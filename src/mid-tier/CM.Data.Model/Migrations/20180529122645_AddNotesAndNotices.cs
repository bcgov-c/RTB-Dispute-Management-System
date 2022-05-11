using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddNotesAndNotices : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_File_Disputes_DisputeGuid",
                table: "File");

            migrationBuilder.DropForeignKey(
                name: "FK_FileDescription_Claims_ClaimId",
                table: "FileDescription");

            migrationBuilder.DropForeignKey(
                name: "FK_FileDescription_Participants_DescriptionBy",
                table: "FileDescription");

            migrationBuilder.DropForeignKey(
                name: "FK_FileDescription_Disputes_DisputeGuid",
                table: "FileDescription");

            migrationBuilder.DropForeignKey(
                name: "FK_FileDescription_Remedies_RemedyId",
                table: "FileDescription");

            migrationBuilder.DropForeignKey(
                name: "FK_LinkedFile_Disputes_DisputeGuid",
                table: "LinkedFile");

            migrationBuilder.DropForeignKey(
                name: "FK_LinkedFile_FileDescription_FileDescriptionId",
                table: "LinkedFile");

            migrationBuilder.DropForeignKey(
                name: "FK_LinkedFile_File_FileId",
                table: "LinkedFile");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LinkedFile",
                table: "LinkedFile");

            migrationBuilder.DropPrimaryKey(
                name: "PK_FileDescription",
                table: "FileDescription");

            migrationBuilder.DropPrimaryKey(
                name: "PK_File",
                table: "File");

            migrationBuilder.RenameTable(
                name: "LinkedFile",
                newName: "LinkedFiles");

            migrationBuilder.RenameTable(
                name: "FileDescription",
                newName: "FileDescriptions");

            migrationBuilder.RenameTable(
                name: "File",
                newName: "Files");

            migrationBuilder.RenameIndex(
                name: "IX_LinkedFile_FileId",
                table: "LinkedFiles",
                newName: "IX_LinkedFiles_FileId");

            migrationBuilder.RenameIndex(
                name: "IX_LinkedFile_FileDescriptionId",
                table: "LinkedFiles",
                newName: "IX_LinkedFiles_FileDescriptionId");

            migrationBuilder.RenameIndex(
                name: "IX_LinkedFile_DisputeGuid",
                table: "LinkedFiles",
                newName: "IX_LinkedFiles_DisputeGuid");

            migrationBuilder.RenameIndex(
                name: "IX_FileDescription_RemedyId",
                table: "FileDescriptions",
                newName: "IX_FileDescriptions_RemedyId");

            migrationBuilder.RenameIndex(
                name: "IX_FileDescription_DisputeGuid",
                table: "FileDescriptions",
                newName: "IX_FileDescriptions_DisputeGuid");

            migrationBuilder.RenameIndex(
                name: "IX_FileDescription_DescriptionBy",
                table: "FileDescriptions",
                newName: "IX_FileDescriptions_DescriptionBy");

            migrationBuilder.RenameIndex(
                name: "IX_FileDescription_ClaimId",
                table: "FileDescriptions",
                newName: "IX_FileDescriptions_ClaimId");

            migrationBuilder.RenameIndex(
                name: "IX_File_DisputeGuid",
                table: "Files",
                newName: "IX_Files_DisputeGuid");

            migrationBuilder.AddColumn<int>(
                name: "NoticeId",
                table: "Amendments",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_LinkedFiles",
                table: "LinkedFiles",
                column: "LinkedFileId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_FileDescriptions",
                table: "FileDescriptions",
                column: "FileDescriptionId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Files",
                table: "Files",
                column: "FileId");

            migrationBuilder.CreateTable(
                name: "Notes",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    NoteId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DisputeGuid = table.Column<Guid>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true),
                    NoteStatus = table.Column<byte>(nullable: false),
                    NoteType = table.Column<byte>(nullable: false),
                    NoteLinkedTo = table.Column<byte>(nullable: false),
                    NoteLinkId = table.Column<int>(nullable: true),
                    NoteContent = table.Column<string>(maxLength: 1500, nullable: false),
                    CreatorGroupRoleId = table.Column<byte>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notes", x => x.NoteId);
                    table.ForeignKey(
                        name: "FK_Notes_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Notices",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    NoticeId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DisputeGuid = table.Column<Guid>(nullable: false),
                    NoticeFile1Id = table.Column<int>(nullable: true),
                    NoticeFile2Id = table.Column<int>(nullable: true),
                    NoticeFile3Id = table.Column<int>(nullable: true),
                    NoticeFile4Id = table.Column<int>(nullable: true),
                    NoticeFile5Id = table.Column<int>(nullable: true),
                    NoticeTitle = table.Column<string>(maxLength: 100, nullable: false),
                    NoticeType = table.Column<byte>(nullable: false),
                    NoticeVersion = table.Column<byte>(nullable: true),
                    IsInitialDisputeNotice = table.Column<bool>(nullable: true),
                    HearingId = table.Column<int>(nullable: true),
                    HearingType = table.Column<byte>(nullable: true),
                    NoticeSpecialInstructions = table.Column<string>(maxLength: 1500, nullable: true),
                    NoticeHtmlForPdf = table.Column<string>(nullable: true),
                    NoticeDeliveryMethod = table.Column<byte>(nullable: true),
                    NoticeDeliveredTo = table.Column<int>(nullable: true),
                    NoticeDeliveredDate = table.Column<DateTime>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notices", x => x.NoticeId);
                    table.ForeignKey(
                        name: "FK_Notices_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notices_Hearings_HearingId",
                        column: x => x.HearingId,
                        principalTable: "Hearings",
                        principalColumn: "HearingId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notices_Participants_NoticeDeliveredTo",
                        column: x => x.NoticeDeliveredTo,
                        principalTable: "Participants",
                        principalColumn: "ParticipantId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notices_Files_NoticeFile1Id",
                        column: x => x.NoticeFile1Id,
                        principalTable: "Files",
                        principalColumn: "FileId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notices_Files_NoticeFile2Id",
                        column: x => x.NoticeFile2Id,
                        principalTable: "Files",
                        principalColumn: "FileId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notices_Files_NoticeFile3Id",
                        column: x => x.NoticeFile3Id,
                        principalTable: "Files",
                        principalColumn: "FileId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notices_Files_NoticeFile4Id",
                        column: x => x.NoticeFile4Id,
                        principalTable: "Files",
                        principalColumn: "FileId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notices_Files_NoticeFile5Id",
                        column: x => x.NoticeFile5Id,
                        principalTable: "Files",
                        principalColumn: "FileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "NoticeServices",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    NoticeServiceId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    NoticeId = table.Column<int>(nullable: false),
                    ParticipantId = table.Column<int>(nullable: false),
                    ServedBy = table.Column<int>(nullable: true),
                    IsServed = table.Column<bool>(nullable: true),
                    ServiceMethod = table.Column<byte>(nullable: true),
                    ServiceDate = table.Column<DateTime>(nullable: true),
                    ServiceComment = table.Column<string>(maxLength: 255, nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NoticeServices", x => x.NoticeServiceId);
                    table.ForeignKey(
                        name: "FK_NoticeServices_Notices_NoticeId",
                        column: x => x.NoticeId,
                        principalTable: "Notices",
                        principalColumn: "NoticeId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NoticeServices_Participants_ParticipantId",
                        column: x => x.ParticipantId,
                        principalTable: "Participants",
                        principalColumn: "ParticipantId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Amendments_NoticeId",
                table: "Amendments",
                column: "NoticeId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_DisputeGuid",
                table: "Notes",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_Notices_DisputeGuid",
                table: "Notices",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_Notices_HearingId",
                table: "Notices",
                column: "HearingId");

            migrationBuilder.CreateIndex(
                name: "IX_Notices_NoticeDeliveredTo",
                table: "Notices",
                column: "NoticeDeliveredTo");

            migrationBuilder.CreateIndex(
                name: "IX_Notices_NoticeFile1Id",
                table: "Notices",
                column: "NoticeFile1Id");

            migrationBuilder.CreateIndex(
                name: "IX_Notices_NoticeFile2Id",
                table: "Notices",
                column: "NoticeFile2Id");

            migrationBuilder.CreateIndex(
                name: "IX_Notices_NoticeFile3Id",
                table: "Notices",
                column: "NoticeFile3Id");

            migrationBuilder.CreateIndex(
                name: "IX_Notices_NoticeFile4Id",
                table: "Notices",
                column: "NoticeFile4Id");

            migrationBuilder.CreateIndex(
                name: "IX_Notices_NoticeFile5Id",
                table: "Notices",
                column: "NoticeFile5Id");

            migrationBuilder.CreateIndex(
                name: "IX_NoticeServices_NoticeId",
                table: "NoticeServices",
                column: "NoticeId");

            migrationBuilder.CreateIndex(
                name: "IX_NoticeServices_ParticipantId",
                table: "NoticeServices",
                column: "ParticipantId");

            migrationBuilder.AddForeignKey(
                name: "FK_Amendments_Notices_NoticeId",
                table: "Amendments",
                column: "NoticeId",
                principalTable: "Notices",
                principalColumn: "NoticeId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FileDescriptions_Claims_ClaimId",
                table: "FileDescriptions",
                column: "ClaimId",
                principalTable: "Claims",
                principalColumn: "ClaimId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FileDescriptions_Participants_DescriptionBy",
                table: "FileDescriptions",
                column: "DescriptionBy",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FileDescriptions_Disputes_DisputeGuid",
                table: "FileDescriptions",
                column: "DisputeGuid",
                principalTable: "Disputes",
                principalColumn: "DisputeGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FileDescriptions_Remedies_RemedyId",
                table: "FileDescriptions",
                column: "RemedyId",
                principalTable: "Remedies",
                principalColumn: "RemedyId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Files_Disputes_DisputeGuid",
                table: "Files",
                column: "DisputeGuid",
                principalTable: "Disputes",
                principalColumn: "DisputeGuid",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LinkedFiles_Disputes_DisputeGuid",
                table: "LinkedFiles",
                column: "DisputeGuid",
                principalTable: "Disputes",
                principalColumn: "DisputeGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LinkedFiles_FileDescriptions_FileDescriptionId",
                table: "LinkedFiles",
                column: "FileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LinkedFiles_Files_FileId",
                table: "LinkedFiles",
                column: "FileId",
                principalTable: "Files",
                principalColumn: "FileId",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Amendments_Notices_NoticeId",
                table: "Amendments");

            migrationBuilder.DropForeignKey(
                name: "FK_FileDescriptions_Claims_ClaimId",
                table: "FileDescriptions");

            migrationBuilder.DropForeignKey(
                name: "FK_FileDescriptions_Participants_DescriptionBy",
                table: "FileDescriptions");

            migrationBuilder.DropForeignKey(
                name: "FK_FileDescriptions_Disputes_DisputeGuid",
                table: "FileDescriptions");

            migrationBuilder.DropForeignKey(
                name: "FK_FileDescriptions_Remedies_RemedyId",
                table: "FileDescriptions");

            migrationBuilder.DropForeignKey(
                name: "FK_Files_Disputes_DisputeGuid",
                table: "Files");

            migrationBuilder.DropForeignKey(
                name: "FK_LinkedFiles_Disputes_DisputeGuid",
                table: "LinkedFiles");

            migrationBuilder.DropForeignKey(
                name: "FK_LinkedFiles_FileDescriptions_FileDescriptionId",
                table: "LinkedFiles");

            migrationBuilder.DropForeignKey(
                name: "FK_LinkedFiles_Files_FileId",
                table: "LinkedFiles");

            migrationBuilder.DropTable(
                name: "Notes");

            migrationBuilder.DropTable(
                name: "NoticeServices");

            migrationBuilder.DropTable(
                name: "Notices");

            migrationBuilder.DropIndex(
                name: "IX_Amendments_NoticeId",
                table: "Amendments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LinkedFiles",
                table: "LinkedFiles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Files",
                table: "Files");

            migrationBuilder.DropPrimaryKey(
                name: "PK_FileDescriptions",
                table: "FileDescriptions");

            migrationBuilder.DropColumn(
                name: "NoticeId",
                table: "Amendments");

            migrationBuilder.RenameTable(
                name: "LinkedFiles",
                newName: "LinkedFile");

            migrationBuilder.RenameTable(
                name: "Files",
                newName: "File");

            migrationBuilder.RenameTable(
                name: "FileDescriptions",
                newName: "FileDescription");

            migrationBuilder.RenameIndex(
                name: "IX_LinkedFiles_FileId",
                table: "LinkedFile",
                newName: "IX_LinkedFile_FileId");

            migrationBuilder.RenameIndex(
                name: "IX_LinkedFiles_FileDescriptionId",
                table: "LinkedFile",
                newName: "IX_LinkedFile_FileDescriptionId");

            migrationBuilder.RenameIndex(
                name: "IX_LinkedFiles_DisputeGuid",
                table: "LinkedFile",
                newName: "IX_LinkedFile_DisputeGuid");

            migrationBuilder.RenameIndex(
                name: "IX_Files_DisputeGuid",
                table: "File",
                newName: "IX_File_DisputeGuid");

            migrationBuilder.RenameIndex(
                name: "IX_FileDescriptions_RemedyId",
                table: "FileDescription",
                newName: "IX_FileDescription_RemedyId");

            migrationBuilder.RenameIndex(
                name: "IX_FileDescriptions_DisputeGuid",
                table: "FileDescription",
                newName: "IX_FileDescription_DisputeGuid");

            migrationBuilder.RenameIndex(
                name: "IX_FileDescriptions_DescriptionBy",
                table: "FileDescription",
                newName: "IX_FileDescription_DescriptionBy");

            migrationBuilder.RenameIndex(
                name: "IX_FileDescriptions_ClaimId",
                table: "FileDescription",
                newName: "IX_FileDescription_ClaimId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_LinkedFile",
                table: "LinkedFile",
                column: "LinkedFileId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_File",
                table: "File",
                column: "FileId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_FileDescription",
                table: "FileDescription",
                column: "FileDescriptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_File_Disputes_DisputeGuid",
                table: "File",
                column: "DisputeGuid",
                principalTable: "Disputes",
                principalColumn: "DisputeGuid",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FileDescription_Claims_ClaimId",
                table: "FileDescription",
                column: "ClaimId",
                principalTable: "Claims",
                principalColumn: "ClaimId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FileDescription_Participants_DescriptionBy",
                table: "FileDescription",
                column: "DescriptionBy",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FileDescription_Disputes_DisputeGuid",
                table: "FileDescription",
                column: "DisputeGuid",
                principalTable: "Disputes",
                principalColumn: "DisputeGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FileDescription_Remedies_RemedyId",
                table: "FileDescription",
                column: "RemedyId",
                principalTable: "Remedies",
                principalColumn: "RemedyId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LinkedFile_Disputes_DisputeGuid",
                table: "LinkedFile",
                column: "DisputeGuid",
                principalTable: "Disputes",
                principalColumn: "DisputeGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LinkedFile_FileDescription_FileDescriptionId",
                table: "LinkedFile",
                column: "FileDescriptionId",
                principalTable: "FileDescription",
                principalColumn: "FileDescriptionId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LinkedFile_File_FileId",
                table: "LinkedFile",
                column: "FileId",
                principalTable: "File",
                principalColumn: "FileId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
