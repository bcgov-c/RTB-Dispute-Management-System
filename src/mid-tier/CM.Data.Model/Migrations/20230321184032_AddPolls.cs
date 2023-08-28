using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class AddPolls : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Polls",
                columns: table => new
                {
                    PollId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    PollTitle = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    PollDescription = table.Column<string>(type: "character varying(2500)", maxLength: 2500, nullable: true),
                    PollStartDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    PollEndDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    PollStatus = table.Column<int>(type: "integer", nullable: true),
                    PollType = table.Column<byte>(type: "smallint", nullable: false),
                    PollSite = table.Column<int>(type: "integer", nullable: true),
                    PollAudience = table.Column<int>(type: "integer", nullable: true),
                    PollDisputeType = table.Column<byte>(type: "smallint", nullable: true),
                    PollDisputeSubType = table.Column<byte>(type: "smallint", nullable: true),
                    PollParticipantType = table.Column<byte>(type: "smallint", nullable: true),
                    PollConfiguration = table.Column<string>(type: "json", nullable: true),
                    MinResponses = table.Column<int>(type: "integer", nullable: true),
                    MaxResponses = table.Column<int>(type: "integer", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    ModifiedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ModifiedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Polls", x => x.PollId);
                });

            migrationBuilder.CreateTable(
                name: "PollResponses",
                columns: table => new
                {
                    PollResponseId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    PollId = table.Column<int>(type: "integer", nullable: false),
                    DisputeGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    ParticipantId = table.Column<int>(type: "integer", nullable: true),
                    ResponseType = table.Column<byte>(type: "smallint", nullable: true),
                    ResponseSubType = table.Column<byte>(type: "smallint", nullable: true),
                    ResponseStatus = table.Column<byte>(type: "smallint", nullable: false),
                    ResponseSite = table.Column<byte>(type: "smallint", nullable: true),
                    ResponseJson = table.Column<string>(type: "json", nullable: false),
                    ResponseDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ResponseText = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    AssociatedFileId = table.Column<int>(type: "integer", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    ModifiedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ModifiedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PollResponses", x => x.PollResponseId);
                    table.ForeignKey(
                        name: "FK_PollResponses_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PollResponses_Files_AssociatedFileId",
                        column: x => x.AssociatedFileId,
                        principalTable: "Files",
                        principalColumn: "FileId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PollResponses_Participants_ParticipantId",
                        column: x => x.ParticipantId,
                        principalTable: "Participants",
                        principalColumn: "ParticipantId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PollResponses_Polls_PollId",
                        column: x => x.PollId,
                        principalTable: "Polls",
                        principalColumn: "PollId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PollResponses_AssociatedFileId",
                table: "PollResponses",
                column: "AssociatedFileId");

            migrationBuilder.CreateIndex(
                name: "IX_PollResponses_DisputeGuid",
                table: "PollResponses",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_PollResponses_ParticipantId",
                table: "PollResponses",
                column: "ParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_PollResponses_PollId",
                table: "PollResponses",
                column: "PollId");

            migrationBuilder.CreateIndex(
                name: "IX_Polls_PollSite",
                table: "Polls",
                column: "PollSite");

            migrationBuilder.CreateIndex(
                name: "IX_Polls_PollStatus",
                table: "Polls",
                column: "PollStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Polls_PollTitle",
                table: "Polls",
                column: "PollTitle",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Polls_PollType",
                table: "Polls",
                column: "PollType");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PollResponses");

            migrationBuilder.DropTable(
                name: "Polls");
        }
    }
}
