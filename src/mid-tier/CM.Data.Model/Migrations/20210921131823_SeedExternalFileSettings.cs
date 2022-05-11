using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class SeedExternalFileSettings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('ExternalFileStorageRoot', 'C:\CaseManagement\ExternalFiles', 4)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('ExternalFileRepositoryBaseUrl', 'localhost:5001/api/externalfiles', 4)");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'ExternalFileStorageRoot'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'ExternalFileRepositoryBaseUrl'");
        }
    }
}
