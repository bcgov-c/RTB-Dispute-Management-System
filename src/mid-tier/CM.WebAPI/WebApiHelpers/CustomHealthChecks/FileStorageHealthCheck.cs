using System.IO;
using System.Threading;
using System.Threading.Tasks;
using CM.Business.Services.SystemSettingsService;
using CM.Common.Utilities;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace CM.WebAPI.WebApiHelpers.CustomHealthChecks;

public class FileStorageHealthCheck : IHealthCheck
{
    private readonly IServiceScopeFactory _serviceScopeFactory;

    public FileStorageHealthCheck(IServiceScopeFactory serviceScopeFactory)
    {
        _serviceScopeFactory = serviceScopeFactory;
    }

    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        using var scope = _serviceScopeFactory.CreateScope();

        var systemSettingsService = scope.ServiceProvider.GetRequiredService<ISystemSettingsService>();

        var commonRootFileFolder = systemSettingsService.GetValueAsync<string>(SettingKeys.CommonFileStorageRoot).Result;

        if (Directory.Exists(commonRootFileFolder) == false)
        {
            return Task.FromResult(new HealthCheckResult(HealthStatus.Unhealthy, "CommonRootFileFolder is not accessible"));
        }

        var rootFileFolder = systemSettingsService.GetValueAsync<string>(SettingKeys.FileStorageRoot).Result;
        if (Directory.Exists(rootFileFolder) == false)
        {
            return Task.FromResult(new HealthCheckResult(HealthStatus.Unhealthy, "RootFileFolder is not accessible"));
        }

        var eGarmsFoldersRoot = systemSettingsService.GetValueAsync<string>(SettingKeys.EgarmsFoldersRoot).Result;
        if (Directory.Exists(eGarmsFoldersRoot) == false)
        {
            return Task.FromResult(new HealthCheckResult(HealthStatus.Unhealthy, "eGarmsFoldersRoot is not accessible"));
        }

        var fileColdStorageFolder = systemSettingsService.GetValueAsync<string>(SettingKeys.FileColdStorageRoot).Result;
        var coldStorageHealthFile = Path.Combine(fileColdStorageFolder, "dms_healthcheck_do_not_delete");
        if (File.Exists(coldStorageHealthFile) == false)
        {
            return Task.FromResult(new HealthCheckResult(HealthStatus.Unhealthy, "FileColdStorageFolder is not accessible"));
        }

        return Task.FromResult(new HealthCheckResult(HealthStatus.Healthy));
    }
}