using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class AddDisputeVerificationFK : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DisputeVerificationId",
                table: "VerificationAttempts",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_VerificationAttempts_DisputeVerificationId",
                table: "VerificationAttempts",
                column: "DisputeVerificationId");

            migrationBuilder.AddForeignKey(
                name: "FK_VerificationAttempts_DisputeVerifications_DisputeVerificati~",
                table: "VerificationAttempts",
                column: "DisputeVerificationId",
                principalTable: "DisputeVerifications",
                principalColumn: "VerificationId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_VerificationAttempts_DisputeVerifications_DisputeVerificati~",
                table: "VerificationAttempts");

            migrationBuilder.DropIndex(
                name: "IX_VerificationAttempts_DisputeVerificationId",
                table: "VerificationAttempts");

            migrationBuilder.DropColumn(
                name: "DisputeVerificationId",
                table: "VerificationAttempts");
        }
    }
}
