using System.Threading;
using System.Threading.Tasks;
using CM.Common.Utilities;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace CM.WebAPI.WebApiHelpers.CustomHealthChecks;

public class ThumbnailHealthCheck : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        var healthStatus = ThumbnailHelper.IsHealthy() ? HealthStatus.Healthy : HealthStatus.Unhealthy;
        var value = new HealthCheckResult(healthStatus);

        return Task.FromResult(value);
    }
}