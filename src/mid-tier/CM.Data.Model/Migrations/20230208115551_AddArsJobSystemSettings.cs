using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class AddArsJobSystemSettings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('ARSDeclarationReminderPeriod', '2', 8)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('ARSReinstatementReminderPeriod', '2', 8)");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'ARSDeclarationReminderPeriod'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'ARSReinstatementReminderPeriod'");
        }
    }
}
