using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddConferenceBridge : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ConferenceBridge",
                columns: table => new
                {
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    ConferenceBridgeId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    BridgeType = table.Column<byte>(nullable: true),
                    BridgeStatus = table.Column<byte>(nullable: true, defaultValue: (byte)1),
                    DialInNumber1 = table.Column<string>(maxLength: 20, nullable: false),
                    DialInDescription1 = table.Column<string>(maxLength: 255, nullable: false),
                    DialInNumber2 = table.Column<string>(maxLength: 20, nullable: true),
                    DialInDescription2 = table.Column<string>(maxLength: 255, nullable: true),
                    DialInNumber3 = table.Column<string>(maxLength: 20, nullable: true),
                    DialInDescription3 = table.Column<string>(maxLength: 255, nullable: true),
                    PreferedStartTime = table.Column<DateTime>(nullable: true),
                    PreferedEndTime = table.Column<DateTime>(nullable: true),
                    PreferedOwner = table.Column<int>(nullable: true),
                    ParticipantCode = table.Column<string>(maxLength: 20, nullable: true),
                    ModeratorCode = table.Column<string>(maxLength: 20, nullable: true),
                    SpecialInstructions = table.Column<string>(maxLength: 500, nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConferenceBridge", x => x.ConferenceBridgeId);
                    table.ForeignKey(
                        name: "FK_ConferenceBridge_SystemUsers_PreferedOwner",
                        column: x => x.PreferedOwner,
                        principalTable: "SystemUsers",
                        principalColumn: "SystemUserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.Sql(@"ALTER SEQUENCE public.""ConferenceBridge_ConferenceBridgeId_seq"" RESTART WITH 10000;");

            migrationBuilder.CreateIndex(
                name: "IX_ConferenceBridge_PreferedOwner",
                table: "ConferenceBridge",
                column: "PreferedOwner");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ConferenceBridge");
        }
    }
}
