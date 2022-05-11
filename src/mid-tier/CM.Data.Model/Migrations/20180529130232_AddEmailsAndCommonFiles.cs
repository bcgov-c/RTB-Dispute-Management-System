using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddEmailsAndCommonFiles : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CommonFiles",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    CommonFileId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    CommonFileGuid = table.Column<Guid>(nullable: false),
                    FileType = table.Column<byte>(nullable: true),
                    FileTitle = table.Column<string>(maxLength: 100, nullable: true),
                    FileDescription = table.Column<string>(maxLength: 1000, nullable: true),
                    FileMimeType = table.Column<string>(maxLength: 255, nullable: false),
                    FileName = table.Column<string>(maxLength: 255, nullable: false),
                    FileSize = table.Column<int>(nullable: false),
                    FilePath = table.Column<string>(maxLength: 255, nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommonFiles", x => x.CommonFileId);
                });

            migrationBuilder.CreateTable(
                name: "EmailMessages",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    EmailMessageId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DisputeGuid = table.Column<Guid>(nullable: false),
                    ParticipantId = table.Column<int>(nullable: true),
                    MessageType = table.Column<byte>(nullable: false),
                    TemplateId = table.Column<byte>(nullable: false),
                    EmailTo = table.Column<string>(maxLength: 70, nullable: false),
                    EmailFrom = table.Column<string>(maxLength: 70, nullable: false),
                    Subject = table.Column<string>(maxLength: 255, nullable: false),
                    HtmlBody = table.Column<string>(nullable: false),
                    TextBody = table.Column<string>(nullable: true),
                    BodyType = table.Column<byte>(nullable: false),
                    PreferedSendDate = table.Column<DateTime>(nullable: true),
                    SentDate = table.Column<DateTime>(nullable: true),
                    SendStatus = table.Column<byte>(nullable: true),
                    ResponseDueDate = table.Column<DateTime>(nullable: true),
                    ReceivedDate = table.Column<DateTime>(nullable: true),
                    Retries = table.Column<byte>(nullable: false),
                    IsActive = table.Column<bool>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailMessages", x => x.EmailMessageId);
                    table.ForeignKey(
                        name: "FK_EmailMessages_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EmailMessages_Participants_ParticipantId",
                        column: x => x.ParticipantId,
                        principalTable: "Participants",
                        principalColumn: "ParticipantId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EmailAttachments",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    EmailAttachmentId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    EmailMessageId = table.Column<int>(nullable: false),
                    AttachmentType = table.Column<byte>(nullable: false),
                    FileId = table.Column<int>(nullable: true),
                    CommonFileId = table.Column<int>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true),
                    SendDate = table.Column<DateTime>(nullable: true),
                    ReceivedDate = table.Column<DateTime>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailAttachments", x => x.EmailAttachmentId);
                    table.ForeignKey(
                        name: "FK_EmailAttachments_CommonFiles_CommonFileId",
                        column: x => x.CommonFileId,
                        principalTable: "CommonFiles",
                        principalColumn: "CommonFileId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmailAttachments_EmailMessages_EmailMessageId",
                        column: x => x.EmailMessageId,
                        principalTable: "EmailMessages",
                        principalColumn: "EmailMessageId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EmailAttachments_Files_FileId",
                        column: x => x.FileId,
                        principalTable: "Files",
                        principalColumn: "FileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EmailAttachments_CommonFileId",
                table: "EmailAttachments",
                column: "CommonFileId");

            migrationBuilder.CreateIndex(
                name: "IX_EmailAttachments_EmailMessageId",
                table: "EmailAttachments",
                column: "EmailMessageId");

            migrationBuilder.CreateIndex(
                name: "IX_EmailAttachments_FileId",
                table: "EmailAttachments",
                column: "FileId");

            migrationBuilder.CreateIndex(
                name: "IX_EmailMessages_DisputeGuid",
                table: "EmailMessages",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_EmailMessages_ParticipantId",
                table: "EmailMessages",
                column: "ParticipantId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmailAttachments");

            migrationBuilder.DropTable(
                name: "CommonFiles");

            migrationBuilder.DropTable(
                name: "EmailMessages");
        }
    }
}
