using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class ReseedDisputeId : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"ALTER SEQUENCE public.""Disputes_DisputeId_seq"" RESTART WITH 10000000;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"ALTER SEQUENCE public.""Disputes_DisputeId_seq"" RESTART WITH 1;");
        }
    }
}
