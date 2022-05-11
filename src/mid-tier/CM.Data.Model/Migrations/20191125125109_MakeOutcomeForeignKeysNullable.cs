using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class MakeOutcomeForeignKeysNullable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PostedDecisionOutcomes_Claims_ClaimId",
                table: "PostedDecisionOutcomes");

            migrationBuilder.DropForeignKey(
                name: "FK_PostedDecisionOutcomes_Remedies_RemedyId",
                table: "PostedDecisionOutcomes");

            migrationBuilder.AlterColumn<int>(
                name: "RemedyId",
                table: "PostedDecisionOutcomes",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AlterColumn<int>(
                name: "ClaimId",
                table: "PostedDecisionOutcomes",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AddForeignKey(
                name: "FK_PostedDecisionOutcomes_Claims_ClaimId",
                table: "PostedDecisionOutcomes",
                column: "ClaimId",
                principalTable: "Claims",
                principalColumn: "ClaimId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PostedDecisionOutcomes_Remedies_RemedyId",
                table: "PostedDecisionOutcomes",
                column: "RemedyId",
                principalTable: "Remedies",
                principalColumn: "RemedyId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PostedDecisionOutcomes_Claims_ClaimId",
                table: "PostedDecisionOutcomes");

            migrationBuilder.DropForeignKey(
                name: "FK_PostedDecisionOutcomes_Remedies_RemedyId",
                table: "PostedDecisionOutcomes");

            migrationBuilder.AlterColumn<int>(
                name: "RemedyId",
                table: "PostedDecisionOutcomes",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ClaimId",
                table: "PostedDecisionOutcomes",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_PostedDecisionOutcomes_Claims_ClaimId",
                table: "PostedDecisionOutcomes",
                column: "ClaimId",
                principalTable: "Claims",
                principalColumn: "ClaimId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PostedDecisionOutcomes_Remedies_RemedyId",
                table: "PostedDecisionOutcomes",
                column: "RemedyId",
                principalTable: "Remedies",
                principalColumn: "RemedyId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
