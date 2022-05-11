using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddTrials : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Trials",
                columns: table => new
                {
                    TrialGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    AssociatedTrialGuid = table.Column<Guid>(type: "uuid", nullable: true),
                    OptinRequired = table.Column<bool>(type: "boolean", nullable: false),
                    TrialType = table.Column<byte>(type: "smallint", nullable: false),
                    TrialSubType = table.Column<byte>(type: "smallint", nullable: true),
                    TrialStatus = table.Column<byte>(type: "smallint", nullable: true),
                    TrialSubStatus = table.Column<byte>(type: "smallint", nullable: true),
                    TrialTitle = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TrialDescription = table.Column<string>(type: "character varying(750)", maxLength: 750, nullable: true),
                    MinDisputes = table.Column<int>(type: "integer", nullable: true),
                    MinParticipants = table.Column<int>(type: "integer", nullable: true),
                    MinInterventions = table.Column<int>(type: "integer", nullable: true),
                    MaxDisputes = table.Column<int>(type: "integer", nullable: true),
                    MaxParticipants = table.Column<int>(type: "integer", nullable: true),
                    MaxInterventions = table.Column<int>(type: "integer", nullable: true),
                    TrialStartDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    TrialEndDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    ModifiedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ModifiedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Trials", x => x.TrialGuid);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Trials_TrialGuid",
                table: "Trials",
                column: "TrialGuid",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Trials");
        }
    }
}
