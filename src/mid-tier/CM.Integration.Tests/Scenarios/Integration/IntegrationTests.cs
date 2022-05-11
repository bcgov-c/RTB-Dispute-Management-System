using System.Threading;
using System.Threading.Tasks;
using CM.Integration.Tests.Fixtures;
using Npgsql;
using Xunit;
using Xunit.Abstractions;

namespace CM.Integration.Tests.Scenarios.Integration;

[Collection("Fixture")]
public partial class IntegrationTests : IAsyncLifetime
{
    public IntegrationTests(TestContext context, ITestOutputHelper testOutput)
        : base(context, testOutput)
    {
    }

    public Task DisposeAsync()
    {
        Thread.Sleep(1000);
        return Task.CompletedTask;
    }

    public Task InitializeAsync()
    {
        using var conn = new NpgsqlConnection(ConnectionString);

        conn.Open();
        Checkpoint.Reset(conn).Wait();

        return Task.CompletedTask;
    }
}