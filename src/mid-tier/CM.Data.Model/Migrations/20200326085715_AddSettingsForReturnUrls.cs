using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddSettingsForReturnUrls : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('ReturnUrlDisputeAccess', 'frontendUIreturnURLDisputeAccess', 0)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('ReturnUrlOfficeSubmission', 'frontendUIreturnURLOfficeSubmission', 0)");
            migrationBuilder.Sql(@"UPDATE public.""SystemSettings"" SET ""Key""= 'ReturnUrlIntake' WHERE ""Key"" = 'ReturnUrl'");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'ReturnUrlDisputeAccess'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'ReturnUrlOfficeSubmission'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'ReturnUrlIntake'");
        }
    }
}
