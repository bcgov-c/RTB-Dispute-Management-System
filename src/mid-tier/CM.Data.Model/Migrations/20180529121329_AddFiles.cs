using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddFiles : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "File",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    FileId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    FileGuid = table.Column<Guid>(nullable: false),
                    DisputeGuid = table.Column<Guid>(nullable: false),
                    FileType = table.Column<byte>(nullable: false),
                    FileMimeType = table.Column<string>(maxLength: 255, nullable: false),
                    FileName = table.Column<string>(maxLength: 255, nullable: false),
                    OriginalFileName = table.Column<string>(maxLength: 255, nullable: false),
                    FileSize = table.Column<int>(nullable: false),
                    FilePath = table.Column<string>(maxLength: 255, nullable: false),
                    FileTitle = table.Column<string>(maxLength: 100, nullable: true),
                    FileStatus = table.Column<byte>(nullable: true),
                    AddedBy = table.Column<int>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_File", x => x.FileId);
                    table.ForeignKey(
                        name: "FK_File_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FileDescription",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    FileDescriptionId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DisputeGuid = table.Column<Guid>(nullable: false),
                    ClaimId = table.Column<int>(nullable: true),
                    RemedyId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(maxLength: 100, nullable: true),
                    Description = table.Column<string>(maxLength: 750, nullable: true),
                    DescriptionBy = table.Column<int>(nullable: true),
                    DescriptionCategory = table.Column<byte>(nullable: false),
                    DescriptionCode = table.Column<byte>(nullable: true),
                    FileMethod = table.Column<byte>(nullable: true),
                    Discussed = table.Column<bool>(nullable: true),
                    DecisionReference = table.Column<byte>(nullable: true),
                    FileStatus = table.Column<byte>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FileDescription", x => x.FileDescriptionId);
                    table.ForeignKey(
                        name: "FK_FileDescription_Claims_ClaimId",
                        column: x => x.ClaimId,
                        principalTable: "Claims",
                        principalColumn: "ClaimId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FileDescription_Participants_DescriptionBy",
                        column: x => x.DescriptionBy,
                        principalTable: "Participants",
                        principalColumn: "ParticipantId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FileDescription_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FileDescription_Remedies_RemedyId",
                        column: x => x.RemedyId,
                        principalTable: "Remedies",
                        principalColumn: "RemedyId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LinkedFile",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    LinkedFileId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    FileDescriptionId = table.Column<int>(nullable: false),
                    DisputeGuid = table.Column<Guid>(nullable: false),
                    Accepted = table.Column<bool>(nullable: true),
                    FileId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LinkedFile", x => x.LinkedFileId);
                    table.ForeignKey(
                        name: "FK_LinkedFile_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LinkedFile_FileDescription_FileDescriptionId",
                        column: x => x.FileDescriptionId,
                        principalTable: "FileDescription",
                        principalColumn: "FileDescriptionId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LinkedFile_File_FileId",
                        column: x => x.FileId,
                        principalTable: "File",
                        principalColumn: "FileId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_File_DisputeGuid",
                table: "File",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_FileDescription_ClaimId",
                table: "FileDescription",
                column: "ClaimId");

            migrationBuilder.CreateIndex(
                name: "IX_FileDescription_DescriptionBy",
                table: "FileDescription",
                column: "DescriptionBy");

            migrationBuilder.CreateIndex(
                name: "IX_FileDescription_DisputeGuid",
                table: "FileDescription",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_FileDescription_RemedyId",
                table: "FileDescription",
                column: "RemedyId");

            migrationBuilder.CreateIndex(
                name: "IX_LinkedFile_DisputeGuid",
                table: "LinkedFile",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_LinkedFile_FileDescriptionId",
                table: "LinkedFile",
                column: "FileDescriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_LinkedFile_FileId",
                table: "LinkedFile",
                column: "FileId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LinkedFile");

            migrationBuilder.DropTable(
                name: "FileDescription");

            migrationBuilder.DropTable(
                name: "File");
        }
    }
}
