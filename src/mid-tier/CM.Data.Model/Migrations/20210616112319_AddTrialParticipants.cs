using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddTrialParticipants : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TrialParticipants",
                columns: table => new
                {
                    TrialParticipantGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    TrialGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    ParticipantType = table.Column<byte>(type: "smallint", nullable: false),
                    DisputeGuid = table.Column<Guid>(type: "uuid", nullable: true),
                    DisputeId = table.Column<int>(type: "integer", nullable: true),
                    ParticipantId = table.Column<int>(type: "integer", nullable: true),
                    SystemUserId = table.Column<int>(type: "integer", nullable: true),
                    ParticipantRole = table.Column<byte>(type: "smallint", nullable: false),
                    ParticipantStatus = table.Column<byte>(type: "smallint", nullable: false),
                    ParticipantSelectionMethod = table.Column<byte>(type: "smallint", nullable: true),
                    ParticipantOptedIn = table.Column<bool>(type: "boolean", nullable: true),
                    OtherParticipantTitle = table.Column<string>(type: "character varying(70)", maxLength: 70, nullable: true),
                    OtherParticipantDescription = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    EndDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    ModifiedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ModifiedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrialParticipants", x => x.TrialParticipantGuid);
                    table.ForeignKey(
                        name: "FK_TrialParticipants_Disputes_DisputeId",
                        column: x => x.DisputeId,
                        principalTable: "Disputes",
                        principalColumn: "DisputeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TrialParticipants_Trials_TrialGuid",
                        column: x => x.TrialGuid,
                        principalTable: "Trials",
                        principalColumn: "TrialGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TrialParticipants_DisputeId",
                table: "TrialParticipants",
                column: "DisputeId");

            migrationBuilder.CreateIndex(
                name: "IX_TrialParticipants_TrialGuid",
                table: "TrialParticipants",
                column: "TrialGuid");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TrialParticipants");
        }
    }
}
