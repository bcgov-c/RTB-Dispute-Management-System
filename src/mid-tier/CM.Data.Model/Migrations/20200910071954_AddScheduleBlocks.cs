using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddScheduleBlocks : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ScheduleBlocks",
                columns: table => new
                {
                    ScheduleBlockId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    SchedulePeriodId = table.Column<int>(nullable: false),
                    SystemUserID = table.Column<int>(nullable: false),
                    BlockStart = table.Column<DateTime>(nullable: false),
                    BlockEnd = table.Column<DateTime>(nullable: false),
                    BlockType = table.Column<int>(nullable: true),
                    BlockStatus = table.Column<int>(nullable: true),
                    BlockSubStatus = table.Column<int>(nullable: true),
                    BlockDescription = table.Column<string>(maxLength: 255, nullable: true),
                    BlockNote = table.Column<string>(maxLength: 255, nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScheduleBlocks", x => x.ScheduleBlockId);
                    table.ForeignKey(
                        name: "FK_ScheduleBlocks_SchedulePeriods_SchedulePeriodId",
                        column: x => x.SchedulePeriodId,
                        principalTable: "SchedulePeriods",
                        principalColumn: "SchedulePeriodId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ScheduleBlocks_SystemUsers_SystemUserID",
                        column: x => x.SystemUserID,
                        principalTable: "SystemUsers",
                        principalColumn: "SystemUserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleBlocks_SchedulePeriodId",
                table: "ScheduleBlocks",
                column: "SchedulePeriodId");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleBlocks_SystemUserID",
                table: "ScheduleBlocks",
                column: "SystemUserID");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ScheduleBlocks");
        }
    }
}
