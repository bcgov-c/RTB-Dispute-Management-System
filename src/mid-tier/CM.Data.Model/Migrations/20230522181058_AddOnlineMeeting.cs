using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class AddOnlineMeeting : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OnlineMeetings",
                columns: table => new
                {
                    OnlineMeetingId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    ConferenceType = table.Column<int>(type: "integer", nullable: false),
                    ConferenceStatus = table.Column<byte>(type: "smallint", nullable: true),
                    ConferenceId = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ConferencePassword = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    GeneralInstructions = table.Column<string>(type: "character varying(2500)", maxLength: 2500, nullable: true),
                    SpecialInstructions = table.Column<string>(type: "character varying(2500)", maxLength: 2500, nullable: true),
                    ConferenceUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    DialInNumber1 = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    DialInDescription1 = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    DialInNumber2 = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    DialInDescription2 = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    DialInNumber3 = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    DialInDescription3 = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CreatedBy = table.Column<int>(type: "integer", nullable: true),
                    ModifiedDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ModifiedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OnlineMeetings", x => x.OnlineMeetingId);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OnlineMeetings");
        }
    }
}
