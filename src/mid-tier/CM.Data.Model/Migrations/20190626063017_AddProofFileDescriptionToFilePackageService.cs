using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddProofFileDescriptionToFilePackageService : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProofFileDescriptionId",
                table: "FilePackageServices",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_FilePackageServices_ProofFileDescriptionId",
                table: "FilePackageServices",
                column: "ProofFileDescriptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_FilePackageServices_FileDescriptions_ProofFileDescriptionId",
                table: "FilePackageServices",
                column: "ProofFileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FilePackageServices_FileDescriptions_ProofFileDescriptionId",
                table: "FilePackageServices");

            migrationBuilder.DropIndex(
                name: "IX_FilePackageServices_ProofFileDescriptionId",
                table: "FilePackageServices");

            migrationBuilder.DropColumn(
                name: "ProofFileDescriptionId",
                table: "FilePackageServices");
        }
    }
}
