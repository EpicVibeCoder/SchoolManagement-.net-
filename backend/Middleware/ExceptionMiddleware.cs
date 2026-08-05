using System.Net;
using System.Text.Json;
using backend.Domain.Exceptions;

namespace backend.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (AppException ex)
        {
            _logger.LogWarning(ex, "Handled application exception. RequestId={RequestId}", context.TraceIdentifier);
            await WriteResponseAsync(context, ex.StatusCode, ex.Message, ex.Code);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception. RequestId={RequestId}", context.TraceIdentifier);
            await WriteResponseAsync(
                context,
                (int)HttpStatusCode.InternalServerError,
                "An unexpected error occurred.",
                "server_error");
        }
    }

    private static Task WriteResponseAsync(HttpContext context, int statusCode, string message, string? code)
    {
        if (context.Response.HasStarted)
            return Task.CompletedTask;

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var payload = new
        {
            message,
            code,
            requestId = context.TraceIdentifier
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(payload));
    }
}
