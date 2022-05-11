using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class SeedRequestSourseInSubstitutedService : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"UPDATE public.""SubstitutedServices"" SET ""RequestSource""='2'");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"UPDATE public.""SubstitutedServices"" SET ""RequestSource""=''");
        }
    }
}
