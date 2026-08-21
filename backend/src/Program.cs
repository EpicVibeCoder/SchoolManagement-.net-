using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using backend.Auth;
using backend.Data;
using backend.Middleware;
using backend.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);
    builder.Host.UseSerilog((ctx, cfg) =>
        cfg.ReadFrom.Configuration(ctx.Configuration)
            .Enrich.FromLogContext()
            .WriteTo.Console());

    if (builder.Environment.IsDevelopment())
    {
        var dir = new DirectoryInfo(builder.Environment.ContentRootPath);
        string? envPath = null;
        while (dir is not null)
        {
            var candidate = Path.Combine(dir.FullName, ".env");
            if (File.Exists(candidate))
            {
                envPath = candidate;
                break;
            }
            dir = dir.Parent;
        }
        if (envPath is null)
            throw new InvalidOperationException(
                "Development requires a root .env file. Copy .env.example to .env.");
        DotNetEnv.Env.Load(envPath);
        builder.Configuration.AddEnvironmentVariables();
    }

    var connectionString = builder.Configuration["DATABASE_URL"];
    if (string.IsNullOrEmpty(connectionString))
    {
        var pgHost = builder.Configuration["POSTGRES_HOST"] ?? "localhost";
        var pgPort = builder.Configuration["POSTGRES_PORT"]
            ?? throw new InvalidOperationException("POSTGRES_PORT is missing.");
        var pgDb = builder.Configuration["POSTGRES_DB"]
            ?? throw new InvalidOperationException("POSTGRES_DB is missing.");
        var pgUser = builder.Configuration["POSTGRES_USER"]
            ?? throw new InvalidOperationException("POSTGRES_USER is missing.");
        var pgPassword = builder.Configuration["POSTGRES_PASSWORD"]
            ?? throw new InvalidOperationException("POSTGRES_PASSWORD is missing.");

        connectionString = $"Host={pgHost};Port={pgPort};Database={pgDb};Username={pgUser};Password={pgPassword}";
    }
    else if (connectionString.StartsWith("postgres://") || connectionString.StartsWith("postgresql://"))
    {
        var uri = new Uri(connectionString);
        var userInfo = uri.UserInfo.Split(':');
        var user = Uri.UnescapeDataString(userInfo[0]);
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
        var port = uri.Port > 0 ? uri.Port : 5432;
        var db = uri.AbsolutePath.TrimStart('/');

        connectionString = $"Host={uri.Host};Port={port};Database={db};Username={user};Password={password};SSL Mode=Require;Trust Server Certificate=true";
    }

    builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
    var jwtKey = builder.Configuration["Jwt:Key"]
        ?? throw new InvalidOperationException("Jwt:Key is missing. Set Jwt__Key in .env.");
    if (jwtKey.Length < 32)
        throw new InvalidOperationException("Jwt:Key must be at least 32 characters.");

    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(connectionString));

    builder.Services.AddHttpContextAccessor();
    builder.Services.AddScoped<ICurrentUser, CurrentUser>();
    builder.Services.AddSingleton<JwtTokenService>();
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<IUserService, UserService>();
    builder.Services.AddScoped<IClassService, ClassService>();
    builder.Services.AddScoped<ISubjectService, SubjectService>();
    builder.Services.AddScoped<ITeacherAssignmentService, TeacherAssignmentService>();
    builder.Services.AddScoped<IEnrollmentService, EnrollmentService>();
    builder.Services.AddScoped<ISettingsService, SettingsService>();
    builder.Services.AddScoped<IAssignmentService, AssignmentService>();
    builder.Services.AddScoped<ISubmissionService, SubmissionService>();
    builder.Services.AddScoped<INotificationService, NotificationService>();
    builder.Services.AddScoped<IDashboardService, DashboardService>();

    builder.Services.AddValidatorsFromAssemblyContaining<Program>();
    builder.Services.AddControllers(options =>
    {
        options.Filters.Add<FluentValidationActionFilter>();
    }).AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidAudience = builder.Configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                RoleClaimType = System.Security.Claims.ClaimTypes.Role,
                NameClaimType = System.Security.Claims.ClaimTypes.NameIdentifier
            };
        });
    builder.Services.AddAuthorization();

    var frontendOrigin = builder.Configuration["FRONTEND_ORIGIN"] ?? "http://localhost:3000";
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("Frontend", policy =>
            policy.WithOrigins(frontendOrigin)
                .AllowAnyHeader()
                .AllowAnyMethod());
    });

    builder.Services.Configure<ForwardedHeadersOptions>(options =>
    {
        options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
        options.KnownIPNetworks.Clear();
        options.KnownProxies.Clear();
    });

    var apiPermit = builder.Configuration.GetValue("RateLimiting:PermitLimit", 100);
    var apiWindowSeconds = builder.Configuration.GetValue("RateLimiting:WindowSeconds", 60);
    var authPermit = builder.Configuration.GetValue("RateLimiting:AuthPermitLimit", 10);
    var authWindowSeconds = builder.Configuration.GetValue("RateLimiting:AuthWindowSeconds", 60);

    builder.Services.AddRateLimiter(options =>
    {
        options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
        options.OnRejected = async (context, cancellationToken) =>
        {
            var retryAfter = context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var delay)
                ? Math.Max(1, (int)Math.Ceiling(delay.TotalSeconds))
                : apiWindowSeconds;
            context.HttpContext.Response.Headers.RetryAfter = retryAfter.ToString();
            context.HttpContext.Response.ContentType = "application/json";
            await context.HttpContext.Response.WriteAsJsonAsync(new
            {
                message = "Too many requests. Please try again later.",
                code = "rate_limit_exceeded"
            }, cancellationToken);
        };

        options.AddPolicy("auth", httpContext =>
            RateLimitPartition.GetFixedWindowLimiter($"auth:{RateLimitKey(httpContext)}", _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = authPermit,
                Window = TimeSpan.FromSeconds(authWindowSeconds),
                QueueLimit = 0,
                AutoReplenishment = true
            }));

        options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        {
            if (httpContext.Request.Path.StartsWithSegments("/api/health"))
                return RateLimitPartition.GetNoLimiter("health");

            return RateLimitPartition.GetFixedWindowLimiter($"api:{RateLimitKey(httpContext)}", _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = apiPermit,
                Window = TimeSpan.FromSeconds(apiWindowSeconds),
                QueueLimit = 0,
                AutoReplenishment = true
            });
        });
    });

    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
    builder.Services.AddOpenApi();

    var app = builder.Build();

    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();
        await DbSeeder.SeedAsync(db);
    }

    app.UseForwardedHeaders();
    app.UseMiddleware<ExceptionMiddleware>();
    app.UseSerilogRequestLogging();

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseCors("Frontend");
    if (!app.Environment.IsDevelopment())
        app.UseHttpsRedirection();

    app.UseAuthentication();
    app.UseAuthorization();
    app.UseRateLimiter();
    app.MapControllers();

    app.Run();
}
catch (Exception ex)

{
    Log.Fatal(ex, "Application terminated unexpectedly");
    throw;
}
finally
{
    Log.CloseAndFlush();
}

public partial class Program
{
    internal static string RateLimitKey(HttpContext httpContext)
    {
        if (httpContext.User.Identity?.IsAuthenticated == true)
        {
            var userId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(userId))
                return $"user:{userId}";
        }

        return $"ip:{httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"}";
    }
}

public sealed class FluentValidationActionFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        foreach (var argument in context.ActionArguments.Values)
        {
            if (argument is null) continue;
            var validatorType = typeof(IValidator<>).MakeGenericType(argument.GetType());
            if (context.HttpContext.RequestServices.GetService(validatorType) is not IValidator validator)
                continue;

            var validationContext = new ValidationContext<object>(argument);
            var result = await validator.ValidateAsync(validationContext, context.HttpContext.RequestAborted);
            if (result.IsValid) continue;

            context.Result = new BadRequestObjectResult(new
            {
                message = "Validation failed",
                code = "validation_error",
                details = result.Errors.Select(e => new { e.PropertyName, e.ErrorMessage })
            });
            return;
        }

        await next();
    }
}
