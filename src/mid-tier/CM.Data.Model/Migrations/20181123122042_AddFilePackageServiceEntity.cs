using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddFilePackageServiceEntity : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FilePackageService",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    FilePackageServiceId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    FilePackageId = table.Column<int>(nullable: false),
                    ParticipantId = table.Column<int>(nullable: false),
                    OtherParticipantName = table.Column<string>(maxLength: 255, nullable: true),
                    OtherParticipantRole = table.Column<byte>(nullable: true),
                    OtherParticipantTitle = table.Column<string>(maxLength: 255, nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true),
                    IsServed = table.Column<bool>(nullable: true, defaultValue: false),
                    ServiceMethod = table.Column<byte>(nullable: true),
                    ServiceDate = table.Column<DateTime>(nullable: true),
                    ReceivedDate = table.Column<DateTime>(nullable: true),
                    ServiceDateUsed = table.Column<byte>(nullable: true),
                    OtherParticipantTitleServiceComment = table.Column<string>(maxLength: 255, nullable: true),
                    ServedBy = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FilePackageService", x => x.FilePackageServiceId);
                    table.ForeignKey(
                        name: "FK_FilePackageService_FilePackages_FilePackageId",
                        column: x => x.FilePackageId,
                        principalTable: "FilePackages",
                        principalColumn: "FilePackageId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FilePackageService_Participants_ParticipantId",
                        column: x => x.ParticipantId,
                        principalTable: "Participants",
                        principalColumn: "ParticipantId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FilePackageService_Participants_ServedBy",
                        column: x => x.ServedBy,
                        principalTable: "Participants",
                        principalColumn: "ParticipantId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FilePackageService_FilePackageId",
                table: "FilePackageService",
                column: "FilePackageId");

            migrationBuilder.CreateIndex(
                name: "IX_FilePackageService_ParticipantId",
                table: "FilePackageService",
                column: "ParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_FilePackageService_ServedBy",
                table: "FilePackageService",
                column: "ServedBy");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FilePackageService");
        }
    }
}
