using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class RemoveHearingTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_HearingParticipations_Hearings_HearingId",
                table: "HearingParticipations");

            migrationBuilder.DropForeignKey(
                name: "FK_Notices_Hearings_HearingId",
                table: "Notices");

            migrationBuilder.DropTable(
                name: "Hearings");

            migrationBuilder.DropIndex(
                name: "IX_Notices_HearingId",
                table: "Notices");

            migrationBuilder.DropIndex(
                name: "IX_HearingParticipations_HearingId",
                table: "HearingParticipations");

            migrationBuilder.DropColumn(
                name: "HearingId",
                table: "Notices");

            migrationBuilder.DropColumn(
                name: "HearingId",
                table: "HearingParticipations");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "HearingId",
                table: "Notices",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HearingId",
                table: "HearingParticipations",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Hearings",
                columns: table => new
                {
                    HearingId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    CreatedBy = table.Column<int>(nullable: true),
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    HearingComplexity = table.Column<byte>(nullable: true),
                    HearingDetails = table.Column<string>(maxLength: 1500, nullable: true),
                    HearingDuration = table.Column<int>(nullable: true),
                    HearingEnd = table.Column<DateTime>(nullable: true),
                    HearingLocation = table.Column<string>(maxLength: 255, nullable: true),
                    HearingMethod = table.Column<byte>(nullable: true),
                    HearingOwner = table.Column<int>(nullable: true),
                    HearingStart = table.Column<DateTime>(nullable: true),
                    HearingStatus = table.Column<byte>(nullable: false),
                    HearingType = table.Column<byte>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true),
                    ModeratorDialCode = table.Column<string>(maxLength: 15, nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ParticipantDialCode = table.Column<string>(maxLength: 15, nullable: true),
                    PrimaryDialInNumber = table.Column<string>(maxLength: 20, nullable: true),
                    PrimaryDialInTitle = table.Column<string>(maxLength: 100, nullable: true),
                    SecondaryDialInNumber = table.Column<string>(maxLength: 20, nullable: true),
                    SecondaryDialInTitle = table.Column<string>(maxLength: 100, nullable: true),
                    SpecialInstructions = table.Column<string>(maxLength: 1500, nullable: true),
                    UseCustomSchedule = table.Column<bool>(nullable: true, defaultValue: false),
                    UseSpecialInstructions = table.Column<bool>(nullable: true, defaultValue: false),
                    VersionNumber = table.Column<byte>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Hearings", x => x.HearingId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Notices_HearingId",
                table: "Notices",
                column: "HearingId");

            migrationBuilder.CreateIndex(
                name: "IX_HearingParticipations_HearingId",
                table: "HearingParticipations",
                column: "HearingId");

            migrationBuilder.AddForeignKey(
                name: "FK_HearingParticipations_Hearings_HearingId",
                table: "HearingParticipations",
                column: "HearingId",
                principalTable: "Hearings",
                principalColumn: "HearingId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_Hearings_HearingId",
                table: "Notices",
                column: "HearingId",
                principalTable: "Hearings",
                principalColumn: "HearingId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
