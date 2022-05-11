using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddTrialOutcomes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TrialOutcomes",
                columns: table => new
                {
                    TrialOutcomeGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    TrialGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    OutcomeBy = table.Column<byte>(type: "smallint", nullable: false),
                    TrialParticipantGuid = table.Column<Guid>(type: "uuid", nullable: true),
                    TrialParticipantGuid1 = table.Column<Guid>(type: "uuid", nullable: true),
                    TrialDisputeGuid = table.Column<Guid>(type: "uuid", nullable: true),
                    TrialDisputeGuid1 = table.Column<Guid>(type: "uuid", nullable: true),
                    TrialInterventionGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    TrialInterventionGuid1 = table.Column<Guid>(type: "uuid", nullable: true),
                    OutcomeType = table.Column<byte>(type: "smallint", nullable: true),
                    OutcomeSubType = table.Column<byte>(type: "smallint", nullable: true),
                    OutcomeStatus = table.Column<byte>(type: "smallint", nullable: true),
                    OutcomeTitle = table.Column<string>(type: "text", nullable: true),
                    OutcomeValue1 = table.Column<int>(type: "integer", nullable: true),
                    OutcomeValue2 = table.Column<int>(type: "integer", nullable: true),
                    OutcomeValue3 = table.Column<int>(type: "integer", nullable: true),
                    OutcomeValue4 = table.Column<int>(type: "integer", nullable: true),
                    OutcomeString1 = table.Column<string>(type: "text", nullable: true),
                    OutcomeString2 = table.Column<string>(type: "text", nullable: true),
                    OutcomeString3 = table.Column<string>(type: "text", nullable: true),
                    OutcomeJson = table.Column<string>(type: "text", nullable: true),
                    OutcomeComment = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_TrialOutcomes", x => x.TrialOutcomeGuid);
                    table.ForeignKey(
                        name: "FK_TrialOutcomes_TrialDisputes_TrialDisputeGuid1",
                        column: x => x.TrialDisputeGuid1,
                        principalTable: "TrialDisputes",
                        principalColumn: "TrialDisputeGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TrialOutcomes_TrialInterventions_TrialInterventionGuid1",
                        column: x => x.TrialInterventionGuid1,
                        principalTable: "TrialInterventions",
                        principalColumn: "TrialInterventionGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TrialOutcomes_TrialParticipants_TrialParticipantGuid1",
                        column: x => x.TrialParticipantGuid1,
                        principalTable: "TrialParticipants",
                        principalColumn: "TrialParticipantGuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TrialOutcomes_Trials_TrialGuid",
                        column: x => x.TrialGuid,
                        principalTable: "Trials",
                        principalColumn: "TrialGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TrialOutcomes_TrialDisputeGuid1",
                table: "TrialOutcomes",
                column: "TrialDisputeGuid1");

            migrationBuilder.CreateIndex(
                name: "IX_TrialOutcomes_TrialGuid",
                table: "TrialOutcomes",
                column: "TrialGuid");

            migrationBuilder.CreateIndex(
                name: "IX_TrialOutcomes_TrialInterventionGuid1",
                table: "TrialOutcomes",
                column: "TrialInterventionGuid1");

            migrationBuilder.CreateIndex(
                name: "IX_TrialOutcomes_TrialParticipantGuid1",
                table: "TrialOutcomes",
                column: "TrialParticipantGuid1");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TrialOutcomes");
        }
    }
}
