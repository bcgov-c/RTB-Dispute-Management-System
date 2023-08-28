using System.Threading;
using System.Threading.Tasks;
using CM.Common.Utilities;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace CM.WebAPI.WebApiHelpers.CustomHealthChecks;

public class FfmpegHealthCheck : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        var healthStatus = await AudioConversionUtils.IsHealthy() ? HealthStatus.Healthy : HealthStatus.Unhealthy;
        return new HealthCheckResult(healthStatus);
    }
}