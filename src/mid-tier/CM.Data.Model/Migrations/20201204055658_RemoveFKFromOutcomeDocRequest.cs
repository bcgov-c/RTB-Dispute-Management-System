using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class RemoveFKFromOutcomeDocRequest : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OutcomeDocRequests_FileDescriptions_FileDescriptionId",
                table: "OutcomeDocRequests");

            migrationBuilder.DropIndex(
                name: "IX_OutcomeDocRequests_FileDescriptionId",
                table: "OutcomeDocRequests");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_OutcomeDocRequests_FileDescriptionId",
                table: "OutcomeDocRequests",
                column: "FileDescriptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_OutcomeDocRequests_FileDescriptions_FileDescriptionId",
                table: "OutcomeDocRequests",
                column: "FileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
