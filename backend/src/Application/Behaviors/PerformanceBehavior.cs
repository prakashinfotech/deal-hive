using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;

namespace GrouponClone.Application.Behaviors;

public class PerformanceBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<PerformanceBehavior<TRequest, TResponse>> _logger;
    private const int WarningThresholdMs = 500;

    public PerformanceBehavior(ILogger<PerformanceBehavior<TRequest, TResponse>> logger) => _logger = logger;

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();
        var response = await next();
        sw.Stop();

        if (sw.ElapsedMilliseconds > WarningThresholdMs)
            _logger.LogWarning("Slow request {RequestName} took {Elapsed}ms", typeof(TRequest).Name, sw.ElapsedMilliseconds);

        return response;
    }
}
