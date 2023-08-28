using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class SeedCronJobSystemSettings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('MhvAppCnFirstReminderPeriod', '30', 8)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('MhvAppNotLinkedFirstReminderPeriod', '30', 8)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('MhvAppLinkedFirstReminderPeriod', '30', 8)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('MhvAppCnFinalReminderPeriod', '10', 8)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('MhvAppNotLinkedFinalReminderPeriod', '10', 8)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('MhvAppLinkedFinalReminderPeriod', '10', 8)");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'MhvAppCnFirstReminderPeriod'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'MhvAppNotLinkedFirstReminderPeriod'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'MhvAppLinkedFirstReminderPeriod'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'MhvAppCnFinalReminderPeriod'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'MhvAppNotLinkedFinalReminderPeriod'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'MhvAppLinkedFinalReminderPeriod'");
        }
    }
}
