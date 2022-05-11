using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddOutcomeDocumentApiTables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OutcomeDocGroups",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    OutcomeDocGroupId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DisputeGuid = table.Column<Guid>(nullable: false),
                    DocGroupType = table.Column<byte>(nullable: true),
                    DocGroupSubType = table.Column<byte>(nullable: true),
                    DocCompletedDate = table.Column<DateTime>(nullable: true),
                    DocStatus = table.Column<byte>(nullable: true, defaultValue: (byte)1),
                    DocStatusDate = table.Column<DateTime>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OutcomeDocGroups", x => x.OutcomeDocGroupId);
                    table.ForeignKey(
                        name: "FK_OutcomeDocGroups_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OutcomeDocFiles",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    OutcomeDocFileId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DisputeGuid = table.Column<Guid>(nullable: false),
                    OutcomeDocGroupId = table.Column<int>(nullable: false),
                    FileType = table.Column<byte>(nullable: false),
                    FileStatus = table.Column<byte>(nullable: true),
                    VisibleToPublic = table.Column<bool>(nullable: true, defaultValue: false),
                    FileTitle = table.Column<string>(maxLength: 100, nullable: true),
                    FileAcronym = table.Column<string>(maxLength: 5, nullable: true),
                    FileDescription = table.Column<string>(maxLength: 500, nullable: true),
                    FileSource = table.Column<byte>(nullable: true),
                    FileId = table.Column<int>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OutcomeDocFiles", x => x.OutcomeDocFileId);
                    table.ForeignKey(
                        name: "FK_OutcomeDocFiles_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OutcomeDocFiles_Files_FileId",
                        column: x => x.FileId,
                        principalTable: "Files",
                        principalColumn: "FileId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OutcomeDocFiles_OutcomeDocGroups_OutcomeDocGroupId",
                        column: x => x.OutcomeDocGroupId,
                        principalTable: "OutcomeDocGroups",
                        principalColumn: "OutcomeDocGroupId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OutcomeDocContents",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    OutcomeDocContentId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    OutcomeDocFileId = table.Column<int>(nullable: false),
                    ContentType = table.Column<byte>(nullable: false),
                    ContentSubType = table.Column<byte>(nullable: true),
                    ContentStatus = table.Column<byte>(nullable: true),
                    StoredContent = table.Column<string>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OutcomeDocContents", x => x.OutcomeDocContentId);
                    table.ForeignKey(
                        name: "FK_OutcomeDocContents_OutcomeDocFiles_OutcomeDocFileId",
                        column: x => x.OutcomeDocFileId,
                        principalTable: "OutcomeDocFiles",
                        principalColumn: "OutcomeDocFileId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OutcomeDocDeliveries",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    OutcomeDocDeliveryId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DisputeGuid = table.Column<Guid>(nullable: false),
                    OutcomeDocFileId = table.Column<int>(nullable: false),
                    ParticipantId = table.Column<int>(nullable: false),
                    DeliveryMethod = table.Column<byte>(nullable: true),
                    DeliveryComment = table.Column<string>(maxLength: 500, nullable: true),
                    IsDelivered = table.Column<bool>(nullable: true),
                    DeliveryDate = table.Column<DateTime>(nullable: true),
                    ConfirmedReceived = table.Column<bool>(nullable: true),
                    ReceivedDate = table.Column<DateTime>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OutcomeDocDeliveries", x => x.OutcomeDocDeliveryId);
                    table.ForeignKey(
                        name: "FK_OutcomeDocDeliveries_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OutcomeDocDeliveries_OutcomeDocFiles_OutcomeDocFileId",
                        column: x => x.OutcomeDocFileId,
                        principalTable: "OutcomeDocFiles",
                        principalColumn: "OutcomeDocFileId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OutcomeDocDeliveries_Participants_ParticipantId",
                        column: x => x.ParticipantId,
                        principalTable: "Participants",
                        principalColumn: "ParticipantId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OutcomeDocContents_OutcomeDocFileId",
                table: "OutcomeDocContents",
                column: "OutcomeDocFileId");

            migrationBuilder.CreateIndex(
                name: "IX_OutcomeDocDeliveries_DisputeGuid",
                table: "OutcomeDocDeliveries",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_OutcomeDocDeliveries_OutcomeDocFileId",
                table: "OutcomeDocDeliveries",
                column: "OutcomeDocFileId");

            migrationBuilder.CreateIndex(
                name: "IX_OutcomeDocDeliveries_ParticipantId",
                table: "OutcomeDocDeliveries",
                column: "ParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_OutcomeDocFiles_DisputeGuid",
                table: "OutcomeDocFiles",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_OutcomeDocFiles_FileId",
                table: "OutcomeDocFiles",
                column: "FileId");

            migrationBuilder.CreateIndex(
                name: "IX_OutcomeDocFiles_OutcomeDocGroupId",
                table: "OutcomeDocFiles",
                column: "OutcomeDocGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_OutcomeDocGroups_DisputeGuid",
                table: "OutcomeDocGroups",
                column: "DisputeGuid");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OutcomeDocContents");

            migrationBuilder.DropTable(
                name: "OutcomeDocDeliveries");

            migrationBuilder.DropTable(
                name: "OutcomeDocFiles");

            migrationBuilder.DropTable(
                name: "OutcomeDocGroups");
        }
    }
}
