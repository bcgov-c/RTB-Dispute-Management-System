using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class RenameOutcomeDocChangeRequestId : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OutcomeDocReqItems_OutcomeDocRequests_OutcomeDocChangeReque~",
                table: "OutcomeDocReqItems");

            migrationBuilder.RenameColumn(
                name: "OutcomeDocChangeRequestId",
                table: "OutcomeDocReqItems",
                newName: "OutcomeDocRequestId");

            migrationBuilder.RenameIndex(
                name: "IX_OutcomeDocReqItems_OutcomeDocChangeRequestId",
                table: "OutcomeDocReqItems",
                newName: "IX_OutcomeDocReqItems_OutcomeDocRequestId");

            migrationBuilder.AddForeignKey(
                name: "FK_OutcomeDocReqItems_OutcomeDocRequests_OutcomeDocRequestId",
                table: "OutcomeDocReqItems",
                column: "OutcomeDocRequestId",
                principalTable: "OutcomeDocRequests",
                principalColumn: "OutcomeDocRequestId",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OutcomeDocReqItems_OutcomeDocRequests_OutcomeDocRequestId",
                table: "OutcomeDocReqItems");

            migrationBuilder.RenameColumn(
                name: "OutcomeDocRequestId",
                table: "OutcomeDocReqItems",
                newName: "OutcomeDocChangeRequestId");

            migrationBuilder.RenameIndex(
                name: "IX_OutcomeDocReqItems_OutcomeDocRequestId",
                table: "OutcomeDocReqItems",
                newName: "IX_OutcomeDocReqItems_OutcomeDocChangeRequestId");

            migrationBuilder.AddForeignKey(
                name: "FK_OutcomeDocReqItems_OutcomeDocRequests_OutcomeDocChangeReque~",
                table: "OutcomeDocReqItems",
                column: "OutcomeDocChangeRequestId",
                principalTable: "OutcomeDocRequests",
                principalColumn: "OutcomeDocRequestId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
