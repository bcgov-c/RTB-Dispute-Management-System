using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddFilePackage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FilePackageId",
                table: "Files",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "FilePackages",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    FilePackageId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DisputeId = table.Column<int>(nullable: true),
                    DisputeGuid = table.Column<Guid>(nullable: false),
                    CreatedById = table.Column<int>(nullable: true),
                    CreatedParticipantParticipantId = table.Column<int>(nullable: true),
                    CreatedByAccessCode = table.Column<string>(maxLength: 10, nullable: true),
                    PackageTitle = table.Column<string>(maxLength: 100, nullable: true),
                    PackageDescription = table.Column<string>(maxLength: 10000, nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FilePackages", x => x.FilePackageId);
                    table.ForeignKey(
                        name: "FK_FilePackages_Participants_CreatedParticipantParticipantId",
                        column: x => x.CreatedParticipantParticipantId,
                        principalTable: "Participants",
                        principalColumn: "ParticipantId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FilePackages_Disputes_DisputeId",
                        column: x => x.DisputeId,
                        principalTable: "Disputes",
                        principalColumn: "DisputeId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Files_FilePackageId",
                table: "Files",
                column: "FilePackageId");

            migrationBuilder.CreateIndex(
                name: "IX_FilePackages_CreatedParticipantParticipantId",
                table: "FilePackages",
                column: "CreatedParticipantParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_FilePackages_DisputeId",
                table: "FilePackages",
                column: "DisputeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Files_FilePackages_FilePackageId",
                table: "Files",
                column: "FilePackageId",
                principalTable: "FilePackages",
                principalColumn: "FilePackageId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Files_FilePackages_FilePackageId",
                table: "Files");

            migrationBuilder.DropTable(
                name: "FilePackages");

            migrationBuilder.DropIndex(
                name: "IX_Files_FilePackageId",
                table: "Files");

            migrationBuilder.DropColumn(
                name: "FilePackageId",
                table: "Files");
        }
    }
}
