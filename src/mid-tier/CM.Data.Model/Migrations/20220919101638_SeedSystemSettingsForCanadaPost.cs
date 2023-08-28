using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class SeedSystemSettingsForCanadaPost : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('CPTrackingUser', 'ac209f17e4b5b489', 9)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('CPTrackingPassword', '8e1068021eae3d3f2f9791', 9)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('CPTrackingURL', 'https://soa-gw.canadapost.ca/vis/track/pin/', 9)");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'CPTrackingUser'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'CPTrackingPassword'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'CPTrackingURL'");
        }
    }
}
