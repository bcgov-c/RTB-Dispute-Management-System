using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddTrialInterventions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TrialInterventions",
                columns: table => new
                {
                    TrialInterventionGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    TrialGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    DisputeGuid = table.Column<Guid>(type: "uuid", nullable: true),
                    DisputeId = table.Column<int>(type: "integer", nullable: true),
                    TrialParticipantGuid = table.Column<Guid>(type: "uuid", nullable: true),
                    TrialParticipantGuid1 = table.Column<Guid>(type: "uuid", nullable: true),
                    OtherAssociatedId = table.Column<int>(type: "integer", nullable: true),
                    InterventionSelectionMethod = table.Column<byte>(type: "smallint", nullable: true),
                    InterventionType = table.Column<byte>(type: "smallint", nullable: false),
                    InterventionSubType = table.Column<byte>(type: "smallint", nullable: true),
                    InterventionStatus = table.Column<byte>(type: "smallint", nullable: false),
                    InterventionTitle = table.Column<string>(type: "text", nullable: true),
                    InterventionDescription = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_TrialInterventions", x => x.TrialInterventionGuid);
                    table.ForeignKey(
                        name: "FK_TrialInterventions_Disputes_DisputeId",
                        column: x => x.DisputeId,
                        principalTable: "Disputes",
                        principalColumn: "DisputeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TrialInterventions_TrialParticipants_TrialParticipantGuid1",
                        column: x => x.TrialParticipantGuid1,
                        principalTable: "TrialParticipants",
                        principalColumn: "TrialParticipantGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TrialInterventions_Trials_TrialGuid",
                        column: x => x.TrialGuid,
                        principalTable: "Trials",
                        principalColumn: "TrialGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TrialInterventions_DisputeId",
                table: "TrialInterventions",
                column: "DisputeId");

            migrationBuilder.CreateIndex(
                name: "IX_TrialInterventions_TrialGuid",
                table: "TrialInterventions",
                column: "TrialGuid");

            migrationBuilder.CreateIndex(
                name: "IX_TrialInterventions_TrialParticipantGuid1",
                table: "TrialInterventions",
                column: "TrialParticipantGuid1");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TrialInterventions");
        }
    }
}
