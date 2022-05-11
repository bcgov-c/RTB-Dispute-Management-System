using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddTrialDisputes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TrialDisputes",
                columns: table => new
                {
                    TrialDisputeGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    TrialGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    DisputeGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    DisputeRole = table.Column<byte>(type: "smallint", nullable: false),
                    DisputeType = table.Column<byte>(type: "smallint", nullable: true),
                    DisputeTrialStatus = table.Column<byte>(type: "smallint", nullable: false),
                    DisputeSelectionMethod = table.Column<byte>(type: "smallint", nullable: true),
                    DisputeOptedIn = table.Column<bool>(type: "boolean", nullable: true),
                    DisputeOptedInByParticipantId = table.Column<int>(type: "integer", nullable: true),
                    DisputeOptedInByStaffId = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("PK_TrialDisputes", x => x.TrialDisputeGuid);
                    table.ForeignKey(
                        name: "FK_TrialDisputes_Disputes_DisputeGuid",
                        column: x => x.DisputeGuid,
                        principalTable: "Disputes",
                        principalColumn: "DisputeGuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TrialDisputes_Trials_TrialGuid",
                        column: x => x.TrialGuid,
                        principalTable: "Trials",
                        principalColumn: "TrialGuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TrialDisputes_DisputeGuid",
                table: "TrialDisputes",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_TrialDisputes_TrialGuid",
                table: "TrialDisputes",
                column: "TrialGuid");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TrialDisputes");
        }
    }
}
