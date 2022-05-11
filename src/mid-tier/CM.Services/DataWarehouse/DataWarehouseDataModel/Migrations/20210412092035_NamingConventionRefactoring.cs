using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class NamingConventionRefactoring : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "EvidencefilesFromRespondent",
                table: "FactDisputeSummaries",
                newName: "EvidenceFilesFromRespondent");

            migrationBuilder.RenameColumn(
                name: "AwardedPosessions",
                table: "FactDisputeSummaries",
                newName: "AwardedPossessions");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "EvidenceFilesFromRespondent",
                table: "FactDisputeSummaries",
                newName: "EvidencefilesFromRespondent");

            migrationBuilder.RenameColumn(
                name: "AwardedPossessions",
                table: "FactDisputeSummaries",
                newName: "AwardedPosessions");
        }
    }
}
