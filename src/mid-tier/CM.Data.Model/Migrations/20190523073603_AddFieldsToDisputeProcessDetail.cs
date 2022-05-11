using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddFieldsToDisputeProcessDetail : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PreparationDuration",
                table: "DisputeProcessDetails",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StartDisputeStatusId",
                table: "DisputeProcessDetails",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "WritingDuration",
                table: "DisputeProcessDetails",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_DisputeProcessDetails_StartDisputeStatusId",
                table: "DisputeProcessDetails",
                column: "StartDisputeStatusId");

            migrationBuilder.AddForeignKey(
                name: "FK_DisputeProcessDetails_DisputeStatuses_StartDisputeStatusId",
                table: "DisputeProcessDetails",
                column: "StartDisputeStatusId",
                principalTable: "DisputeStatuses",
                principalColumn: "DisputeStatusId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DisputeProcessDetails_DisputeStatuses_StartDisputeStatusId",
                table: "DisputeProcessDetails");

            migrationBuilder.DropIndex(
                name: "IX_DisputeProcessDetails_StartDisputeStatusId",
                table: "DisputeProcessDetails");

            migrationBuilder.DropColumn(
                name: "PreparationDuration",
                table: "DisputeProcessDetails");

            migrationBuilder.DropColumn(
                name: "StartDisputeStatusId",
                table: "DisputeProcessDetails");

            migrationBuilder.DropColumn(
                name: "WritingDuration",
                table: "DisputeProcessDetails");
        }
    }
}
