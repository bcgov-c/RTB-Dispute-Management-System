using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddLandlordIntakeUrls : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('AdditionalLandlordIntakeLoginUrl', 'AdditionalLandlordIntakeLoginUrl', 6)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('AdditionalLandlordIntakeSiteminderUrl', 'AdditionalLandlordIntakeSiteminderUrl', 6)");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'AdditionalLandlordIntakeLoginUrl'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'AdditionalLandlordIntakeSiteminderUrl'");
        }
    }
}
