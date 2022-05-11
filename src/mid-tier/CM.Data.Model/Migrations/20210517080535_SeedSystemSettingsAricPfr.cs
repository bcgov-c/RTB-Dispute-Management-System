using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class SeedSystemSettingsAricPfr : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('AricParticipatoryApplicantEvidenceReminderPeriod', '21', 8)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('PfrParticipatoryApplicantEvidenceReminderPeriod', '21', 8)");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'AricParticipatoryApplicantEvidenceReminderPeriod'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'PfrParticipatoryApplicantEvidenceReminderPeriod'");
        }
    }
}
