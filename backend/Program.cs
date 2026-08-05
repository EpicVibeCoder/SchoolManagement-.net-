using backend.Data;
using DotNetEnv;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Development only: load monorepo root .env into process environment
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
    Env.Load(envPath);
    // Reload env vars into config after DotNetEnv sets them
    builder.Configuration.AddEnvironmentVariables();
}

// ... existing DotNetEnv load ...

var pgHost = builder.Configuration["POSTGRES_HOST"] ?? "localhost";
var pgPort = builder.Configuration["POSTGRES_PORT"]
    ?? throw new InvalidOperationException("POSTGRES_PORT is missing.");
var pgDb = builder.Configuration["POSTGRES_DB"]
    ?? throw new InvalidOperationException("POSTGRES_DB is missing.");
var pgUser = builder.Configuration["POSTGRES_USER"]
    ?? throw new InvalidOperationException("POSTGRES_USER is missing.");
var pgPassword = builder.Configuration["POSTGRES_PASSWORD"]
    ?? throw new InvalidOperationException("POSTGRES_PASSWORD is missing.");

var connectionString =
    $"Host={pgHost};Port={pgPort};Database={pgDb};Username={pgUser};Password={pgPassword}";

// Add services to the container.

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));
builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

