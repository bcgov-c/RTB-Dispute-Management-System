using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class EmailSendlaterSettings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('EmailErrorResentHoursAgo', '10', 2)");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'EmailErrorResentHoursAgo'");
        }
    }
}
