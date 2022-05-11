using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddScheduledHearings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ConferenceBridgeId",
                table: "Hearings",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ScheduledHearings",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    ScheduledHearingId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    HearingType = table.Column<byte>(nullable: false),
                    HearingSubType = table.Column<byte>(nullable: true),
                    HearingPriority = table.Column<byte>(nullable: true),
                    ConferenceBridgeId = table.Column<int>(nullable: true),
                    HearingOwner = table.Column<int>(nullable: true),
                    StaffParticipant1 = table.Column<int>(nullable: true),
                    StaffParticipant2 = table.Column<int>(nullable: true),
                    StaffParticipant3 = table.Column<int>(nullable: true),
                    StaffParticipant4 = table.Column<int>(nullable: true),
                    StaffParticipant5 = table.Column<int>(nullable: true),
                    OtherStaffParticipants = table.Column<string>(maxLength: 255, nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true),
                    HearingMethod = table.Column<byte>(nullable: true),
                    UseCustomSchedule = table.Column<bool>(nullable: true, defaultValue: false),
                    HearingStartDateTime = table.Column<DateTime>(nullable: true),
                    HearingEndDateTime = table.Column<DateTime>(nullable: true),
                    LocalStartDateTime = table.Column<DateTime>(nullable: true),
                    LocalEndDateTime = table.Column<DateTime>(nullable: true),
                    HearingLocation = table.Column<string>(maxLength: 255, nullable: true),
                    UseSpecialInstructions = table.Column<bool>(nullable: true, defaultValue: false),
                    SpecialInstructions = table.Column<string>(maxLength: 1500, nullable: true),
                    HearingDetails = table.Column<string>(maxLength: 1500, nullable: true),
                    HearingComplexity = table.Column<byte>(nullable: true),
                    HearingDuration = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScheduledHearings", x => x.ScheduledHearingId);
                    table.ForeignKey(
                        name: "FK_ScheduledHearings_ConferenceBridges_ConferenceBridgeId",
                        column: x => x.ConferenceBridgeId,
                        principalTable: "ConferenceBridges",
                        principalColumn: "ConferenceBridgeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ScheduledHearings_SystemUsers_HearingOwner",
                        column: x => x.HearingOwner,
                        principalTable: "SystemUsers",
                        principalColumn: "SystemUserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ScheduledHearings_SystemUsers_StaffParticipant1",
                        column: x => x.StaffParticipant1,
                        principalTable: "SystemUsers",
                        principalColumn: "SystemUserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ScheduledHearings_SystemUsers_StaffParticipant2",
                        column: x => x.StaffParticipant2,
                        principalTable: "SystemUsers",
                        principalColumn: "SystemUserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ScheduledHearings_SystemUsers_StaffParticipant3",
                        column: x => x.StaffParticipant3,
                        principalTable: "SystemUsers",
                        principalColumn: "SystemUserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ScheduledHearings_SystemUsers_StaffParticipant4",
                        column: x => x.StaffParticipant4,
                        principalTable: "SystemUsers",
                        principalColumn: "SystemUserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ScheduledHearings_SystemUsers_StaffParticipant5",
                        column: x => x.StaffParticipant5,
                        principalTable: "SystemUsers",
                        principalColumn: "SystemUserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Hearings_ConferenceBridgeId",
                table: "Hearings",
                column: "ConferenceBridgeId");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduledHearings_ConferenceBridgeId",
                table: "ScheduledHearings",
                column: "ConferenceBridgeId");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduledHearings_HearingOwner",
                table: "ScheduledHearings",
                column: "HearingOwner");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduledHearings_StaffParticipant1",
                table: "ScheduledHearings",
                column: "StaffParticipant1");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduledHearings_StaffParticipant2",
                table: "ScheduledHearings",
                column: "StaffParticipant2");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduledHearings_StaffParticipant3",
                table: "ScheduledHearings",
                column: "StaffParticipant3");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduledHearings_StaffParticipant4",
                table: "ScheduledHearings",
                column: "StaffParticipant4");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduledHearings_StaffParticipant5",
                table: "ScheduledHearings",
                column: "StaffParticipant5");

            migrationBuilder.AddForeignKey(
                name: "FK_Hearings_ConferenceBridges_ConferenceBridgeId",
                table: "Hearings",
                column: "ConferenceBridgeId",
                principalTable: "ConferenceBridges",
                principalColumn: "ConferenceBridgeId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Hearings_ConferenceBridges_ConferenceBridgeId",
                table: "Hearings");

            migrationBuilder.DropTable(
                name: "ScheduledHearings");

            migrationBuilder.DropIndex(
                name: "IX_Hearings_ConferenceBridgeId",
                table: "Hearings");

            migrationBuilder.DropColumn(
                name: "ConferenceBridgeId",
                table: "Hearings");
        }
    }
}
