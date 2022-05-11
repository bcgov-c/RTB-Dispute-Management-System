using System.Threading;
using System.Threading.Tasks;
using CM.Integration.Tests.Fixtures;
using CM.Integration.Tests.Infrastructure;
using Xunit;
using Xunit.Abstractions;

namespace CM.Integration.Tests.Scenarios.Security;

[Collection("Fixture")]
public partial class SecurityTests : IntegrationTestBase, IAsyncLifetime, IClassFixture<SecurityTestDataSeed>
{
    public SecurityTests(TestContext context, SecurityTestDataSeed securityTestDataSeed, ITestOutputHelper testOutput)
        : base(context, testOutput)
    {
        Data = securityTestDataSeed;
    }

    private SecurityTestDataSeed Data { get; }

    public Task DisposeAsync()
    {
        Thread.Sleep(1000);
        return Task.CompletedTask;
    }

    public Task InitializeAsync()
    {
        return Task.CompletedTask;
    }
}