using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateOutcomeDocumentFileIdToNullable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SubstitutedServices_OutcomeDocFiles_OutcomeDocumentFileId",
                table: "SubstitutedServices");

            migrationBuilder.AlterColumn<int>(
                name: "OutcomeDocumentFileId",
                table: "SubstitutedServices",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AddForeignKey(
                name: "FK_SubstitutedServices_OutcomeDocFiles_OutcomeDocumentFileId",
                table: "SubstitutedServices",
                column: "OutcomeDocumentFileId",
                principalTable: "OutcomeDocFiles",
                principalColumn: "OutcomeDocFileId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SubstitutedServices_OutcomeDocFiles_OutcomeDocumentFileId",
                table: "SubstitutedServices");

            migrationBuilder.AlterColumn<int>(
                name: "OutcomeDocumentFileId",
                table: "SubstitutedServices",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_SubstitutedServices_OutcomeDocFiles_OutcomeDocumentFileId",
                table: "SubstitutedServices",
                column: "OutcomeDocumentFileId",
                principalTable: "OutcomeDocFiles",
                principalColumn: "OutcomeDocFileId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
