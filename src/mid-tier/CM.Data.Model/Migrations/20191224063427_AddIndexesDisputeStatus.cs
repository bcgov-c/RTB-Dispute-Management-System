using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddIndexesDisputeStatus : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_DisputeStatuses_Owner",
                table: "DisputeStatuses",
                column: "Owner");

            migrationBuilder.CreateIndex(
                name: "IX_DisputeStatuses_Process",
                table: "DisputeStatuses",
                column: "Process");

            migrationBuilder.CreateIndex(
                name: "IX_DisputeStatuses_Stage",
                table: "DisputeStatuses",
                column: "Stage");

            migrationBuilder.CreateIndex(
                name: "IX_DisputeStatuses_Status",
                table: "DisputeStatuses",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Disputes_CreatedDate",
                table: "Disputes",
                column: "CreatedDate");

            migrationBuilder.CreateIndex(
                name: "IX_Disputes_CreationMethod",
                table: "Disputes",
                column: "CreationMethod");

            migrationBuilder.CreateIndex(
                name: "IX_Disputes_DisputeGuid",
                table: "Disputes",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_Disputes_ModifiedDate",
                table: "Disputes",
                column: "ModifiedDate");

            migrationBuilder.CreateIndex(
                name: "IX_Disputes_SubmittedDate",
                table: "Disputes",
                column: "SubmittedDate");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DisputeStatuses_Owner",
                table: "DisputeStatuses");

            migrationBuilder.DropIndex(
                name: "IX_DisputeStatuses_Process",
                table: "DisputeStatuses");

            migrationBuilder.DropIndex(
                name: "IX_DisputeStatuses_Stage",
                table: "DisputeStatuses");

            migrationBuilder.DropIndex(
                name: "IX_DisputeStatuses_Status",
                table: "DisputeStatuses");

            migrationBuilder.DropIndex(
                name: "IX_Disputes_CreatedDate",
                table: "Disputes");

            migrationBuilder.DropIndex(
                name: "IX_Disputes_CreationMethod",
                table: "Disputes");

            migrationBuilder.DropIndex(
                name: "IX_Disputes_DisputeGuid",
                table: "Disputes");

            migrationBuilder.DropIndex(
                name: "IX_Disputes_ModifiedDate",
                table: "Disputes");

            migrationBuilder.DropIndex(
                name: "IX_Disputes_SubmittedDate",
                table: "Disputes");
        }
    }
}
