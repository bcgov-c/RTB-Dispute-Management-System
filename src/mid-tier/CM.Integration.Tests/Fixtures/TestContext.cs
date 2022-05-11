using System;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;
using CM.Integration.Tests.TestData;
using CM.ServiceBase;
using CM.Services.PdfConvertor.PdfService;
using EasyNetQ.Management.Client;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Serilog;
using Xunit;

namespace CM.Integration.Tests.Fixtures;

public class TestContext : IDisposable
{
    private TestServer _emailGenerationService;
    private TestServer _emailNotificationService;
    private TestServer _pdfService;
    private IServiceProvider _services;
    private TestServer _webApiService;

    public TestContext()
    {
        SetupClient();
    }

    public IConfigurationRoot Configuration { get; set; }

    public HttpClient Client { get; private set; }

    public GlobalDataSeed Data { get; } = new();

    public void Dispose()
    {
        _webApiService.Dispose();
        _emailGenerationService.Dispose();
        _emailNotificationService.Dispose();
        _pdfService.Dispose();

        Client.Dispose();
    }

    public T GetService<T>() => (T)_services.GetService(typeof(T));

    public async Task<bool> InitializeConfiguration()
    {
        var homeFolder = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
        var filesRoot = Path.Combine(homeFolder, "dms-files");
        Console.WriteLine("Files root folder: {0}", filesRoot);
        FileUtils.CheckIfNotExistsCreate(filesRoot);

        var unitOfWork = GetService<IUnitOfWork>();
        var systemSettings = await unitOfWork.SystemSettingsRepository.GetSetting(SettingKeys.FileStorageRoot);
        systemSettings.Value = Path.Combine(filesRoot, SettingKeys.FileStorageRoot);
        unitOfWork.SystemSettingsRepository.Update(systemSettings);

        systemSettings = await unitOfWork.SystemSettingsRepository.GetSetting(SettingKeys.TempStorageRoot);
        systemSettings.Value = Path.Combine(filesRoot, SettingKeys.TempStorageRoot);
        unitOfWork.SystemSettingsRepository.Update(systemSettings);

        systemSettings = await unitOfWork.SystemSettingsRepository.GetSetting(SettingKeys.ExternalFileStorageRoot);
        systemSettings.Value = Path.Combine(filesRoot, SettingKeys.ExternalFileStorageRoot);
        unitOfWork.SystemSettingsRepository.Update(systemSettings);

        systemSettings = await unitOfWork.SystemSettingsRepository.GetSetting(SettingKeys.CommonFileStorageRoot);
        systemSettings.Value = Path.Combine(filesRoot, SettingKeys.CommonFileStorageRoot);
        unitOfWork.SystemSettingsRepository.Update(systemSettings);

        var completeResult = await unitOfWork.Complete();
        completeResult.AssertSuccess();

        return true;
    }

    private void SetupClient()
    {
        var appRootPath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "CM.Integration.Tests"));

        Console.WriteLine("Root folder: {0}", appRootPath);

        var builder = new ConfigurationBuilder()
            .AddJsonFile(appRootPath + "/secrets/appsettings.json", false);

        Configuration = builder.Build();

        var debugView = Configuration.GetDebugView();
        Console.WriteLine(debugView);

        PurgeRabbitMq();

        _webApiService = new TestServer(new WebHostBuilder()
            .UseContentRoot(appRootPath)
            .UseStartup<WebAPI.Startup>());

        _emailNotificationService = new TestServer(new WebHostBuilder()
            .UseContentRoot(appRootPath)
            .UseStartup<Services.EmailNotification.EmailNotificationService.Startup>());

        _emailGenerationService = new TestServer(new WebHostBuilder()
            .UseContentRoot(appRootPath)
            .UseStartup<Services.EmailGenerator.EmailGeneratorService.Startup>());

        _pdfService = new TestServer(new WebHostBuilder()
            .UseContentRoot(appRootPath)
            .UseStartup<Startup>());

        Client = _webApiService.CreateClient();
        _emailNotificationService.CreateClient();
        _emailGenerationService.CreateClient();
        _pdfService.CreateClient();

        Client.BaseAddress = new Uri(RouteHelper.BaseUrl);

        _services = _webApiService.Host.Services;

        InitializeConfiguration().Wait();
        Data.SetupData(Client);
    }

    private void PurgeRabbitMq()
    {
        var conn = CustomExtensionsBase.GetAmqpConnection(Configuration["MQ:Cluster"]);
        var host = conn.Hosts.FirstOrDefault();

        try
        {
            var client = new ManagementClient(host?.Host, conn.UserName, conn.Password);
            var queues = client.GetQueuesAsync().Result;

            foreach (var queue in queues)
            {
                client.PurgeAsync(queue);
            }
        }
        catch (Exception exc)
        {
            Log.Error(exc, "Purge RabbitMQ fail");
        }
    }
}

[CollectionDefinition("Fixture")]
public class CollectionClass : ICollectionFixture<TestContext>
{
}