using System.Net.Http;
using Bogus;
using CM.Integration.Tests.Fixtures;
using Respawn;
using Respawn.Graph;
using Xunit.Abstractions;

namespace CM.Integration.Tests.Infrastructure;

public class IntegrationTestBase
{
    public IntegrationTestBase(TestContext context, ITestOutputHelper testOutput)
    {
        Context = context;
        TestOutput = testOutput;
    }

    protected Checkpoint Checkpoint { get; } = new()
    {
        TablesToIgnore = new Table[]
        {
            "__EFMigrationsHistory",
            "AccessCodeExcludeWords",
            "SiteVersion",
            "ServiceOffices",
            "SystemSettings",
            "SystemUsers",
            "SystemUserRoles",
            "InternalUserRoles",
            "UserTokens",
            "EmailTemplates"
        },

        SchemasToInclude = new[] { "public" },
        DbAdapter = DbAdapter.Postgres
    };

    protected TestContext Context { get; }

    protected Faker FakerInstance => new();

    protected HttpClient Client => Context.Client;

    protected string ConnectionString => Context.Configuration["ConnectionStrings:DbConnection"];

    protected ITestOutputHelper TestOutput { get; }
}