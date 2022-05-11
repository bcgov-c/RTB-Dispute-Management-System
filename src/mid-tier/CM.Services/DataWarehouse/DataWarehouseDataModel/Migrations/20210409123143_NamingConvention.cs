using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class NamingConvention : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IOTasksCompleted",
                table: "FactTimeStatistics",
                newName: "IoTasksCompleted");

            migrationBuilder.RenameColumn(
                name: "IOIncompleteTasksUnassignedOldest",
                table: "FactTimeStatistics",
                newName: "IoIncompleteTasksUnassignedOldest");

            migrationBuilder.RenameColumn(
                name: "IOIncompleteTasksUnassigned",
                table: "FactTimeStatistics",
                newName: "IoIncompleteTasksUnassigned");

            migrationBuilder.RenameColumn(
                name: "IOIncompleteTasksAssigned",
                table: "FactTimeStatistics",
                newName: "IoIncompleteTasksAssigned");

            migrationBuilder.RenameColumn(
                name: "FilesMB",
                table: "FactTimeStatistics",
                newName: "FilesMb");

            migrationBuilder.RenameColumn(
                name: "EvidenceFilesMB",
                table: "FactTimeStatistics",
                newName: "EvidenceFilesMb");

            migrationBuilder.RenameColumn(
                name: "TotalIOOwners",
                table: "FactDisputeSummaries",
                newName: "TotalIoOwners");

            migrationBuilder.RenameColumn(
                name: "EvidenceFilesMBFromRespondent",
                table: "FactDisputeSummaries",
                newName: "EvidenceFilesMbFromRespondent");

            migrationBuilder.RenameColumn(
                name: "EvidenceFilesMBFromApplicant",
                table: "FactDisputeSummaries",
                newName: "EvidenceFilesMbFromApplicant");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IoTasksCompleted",
                table: "FactTimeStatistics",
                newName: "IOTasksCompleted");

            migrationBuilder.RenameColumn(
                name: "IoIncompleteTasksUnassignedOldest",
                table: "FactTimeStatistics",
                newName: "IOIncompleteTasksUnassignedOldest");

            migrationBuilder.RenameColumn(
                name: "IoIncompleteTasksUnassigned",
                table: "FactTimeStatistics",
                newName: "IOIncompleteTasksUnassigned");

            migrationBuilder.RenameColumn(
                name: "IoIncompleteTasksAssigned",
                table: "FactTimeStatistics",
                newName: "IOIncompleteTasksAssigned");

            migrationBuilder.RenameColumn(
                name: "FilesMb",
                table: "FactTimeStatistics",
                newName: "FilesMB");

            migrationBuilder.RenameColumn(
                name: "EvidenceFilesMb",
                table: "FactTimeStatistics",
                newName: "EvidenceFilesMB");

            migrationBuilder.RenameColumn(
                name: "TotalIoOwners",
                table: "FactDisputeSummaries",
                newName: "TotalIOOwners");

            migrationBuilder.RenameColumn(
                name: "EvidenceFilesMbFromRespondent",
                table: "FactDisputeSummaries",
                newName: "EvidenceFilesMBFromRespondent");

            migrationBuilder.RenameColumn(
                name: "EvidenceFilesMbFromApplicant",
                table: "FactDisputeSummaries",
                newName: "EvidenceFilesMBFromApplicant");
        }
    }
}
