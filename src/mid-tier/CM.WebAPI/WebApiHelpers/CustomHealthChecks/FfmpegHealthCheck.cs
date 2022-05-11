using System.Threading;
using System.Threading.Tasks;
using CM.Common.Utilities;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace CM.WebAPI.WebApiHelpers.CustomHealthChecks;

public class FfmpegHealthCheck : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        var healthStatus = AudioConversionUtils.IsHealthy() ? HealthStatus.Healthy : HealthStatus.Unhealthy;
        var value = new HealthCheckResult(healthStatus);

        return Task.FromResult(value);
    }
}