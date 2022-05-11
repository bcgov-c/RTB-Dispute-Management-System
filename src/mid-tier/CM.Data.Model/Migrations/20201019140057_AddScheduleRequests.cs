using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddScheduleRequests : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ScheduleRequests",
                columns: table => new
                {
                    ScheduleRequestId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<int>(nullable: true),
                    ModifiedDate = table.Column<DateTime>(nullable: true),
                    ModifiedBy = table.Column<int>(nullable: true),
                    RequestorSystemUserId = table.Column<int>(nullable: false),
                    RequestType = table.Column<byte>(nullable: true),
                    RequestSubmitter = table.Column<int>(nullable: true),
                    RequestOwnerId = table.Column<int>(nullable: true),
                    RequestStart = table.Column<DateTime>(nullable: true),
                    RequestEnd = table.Column<DateTime>(nullable: true),
                    RequestStatus = table.Column<int>(nullable: true),
                    RequestSubStatus = table.Column<int>(nullable: true),
                    RequestDescription = table.Column<string>(maxLength: 500, nullable: true),
                    RequestNote = table.Column<string>(maxLength: 500, nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScheduleRequests", x => x.ScheduleRequestId);
                    table.ForeignKey(
                        name: "FK_ScheduleRequests_SystemUsers_RequestOwnerId",
                        column: x => x.RequestOwnerId,
                        principalTable: "SystemUsers",
                        principalColumn: "SystemUserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ScheduleRequests_SystemUsers_RequestorSystemUserId",
                        column: x => x.RequestorSystemUserId,
                        principalTable: "SystemUsers",
                        principalColumn: "SystemUserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleRequests_RequestOwnerId",
                table: "ScheduleRequests",
                column: "RequestOwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleRequests_RequestorSystemUserId",
                table: "ScheduleRequests",
                column: "RequestorSystemUserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ScheduleRequests");
        }
    }
}
