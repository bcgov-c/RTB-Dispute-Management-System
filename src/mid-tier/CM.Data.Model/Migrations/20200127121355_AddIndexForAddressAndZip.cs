using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddIndexForAddressAndZip : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Disputes_TenancyAddress",
                table: "Disputes",
                column: "TenancyAddress");

            migrationBuilder.CreateIndex(
                name: "IX_Disputes_TenancyZipPostal",
                table: "Disputes",
                column: "TenancyZipPostal");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Disputes_TenancyAddress",
                table: "Disputes");

            migrationBuilder.DropIndex(
                name: "IX_Disputes_TenancyZipPostal",
                table: "Disputes");
        }
    }
}
