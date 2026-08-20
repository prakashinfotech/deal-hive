// ============================================================
// GrouponClone.API — Global Exception Handling Middleware
// Middleware/ExceptionHandlingMiddleware.cs
// ============================================================

using System.Net;
using System.Text.Json;
using GrouponClone.Domain.Exceptions;
using FluentValidation;

namespace GrouponClone.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
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
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var traceId = context.TraceIdentifier;

        var (statusCode, title, detail, errors) = exception switch
        {
            ValidationException ve => (
                HttpStatusCode.UnprocessableEntity,
                "Validation Failed",
                "One or more validation errors occurred.",
                ve.Errors.GroupBy(e => e.PropertyName)
                         .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray())
                         as IDictionary<string, string[]>
            ),
            NotFoundException nfe => (
                HttpStatusCode.NotFound,
                "Not Found",
                nfe.Message,
                null
            ),
            DomainException de => (
                HttpStatusCode.BadRequest,
                "Business Rule Violation",
                de.Message,
                null
            ),
            UnauthorizedException ue => (
                HttpStatusCode.Unauthorized,
                "Unauthorized",
                ue.Message,
                null
            ),
            ForbiddenException fe => (
                HttpStatusCode.Forbidden,
                "Forbidden",
                fe.Message,
                null
            ),
            ConflictException ce => (
                HttpStatusCode.Conflict,
                "Conflict",
                ce.Message,
                null
            ),
            _ => (
                HttpStatusCode.InternalServerError,
                "Internal Server Error",
                "An unexpected error occurred.",
                null
            )
        };

        if (statusCode == HttpStatusCode.InternalServerError)
            _logger.LogError(exception, "Unhandled exception. TraceId: {TraceId}", traceId);
        else
            _logger.LogWarning(exception, "Handled exception {Type}. TraceId: {TraceId}", exception.GetType().Name, traceId);

        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/problem+json";

        var response = new
        {
            type = $"https://tools.ietf.org/html/rfc7807",
            title,
            status = (int)statusCode,
            detail,
            errors,
            traceId
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
    }
}
