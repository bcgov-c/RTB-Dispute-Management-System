using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class UpdateServiceAuditLog : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ReceivedDate",
                table: "ServiceAuditLogs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "ServiceDateUsed",
                table: "ServiceAuditLogs",
                type: "smallint",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReceivedDate",
                table: "ServiceAuditLogs");

            migrationBuilder.DropColumn(
                name: "ServiceDateUsed",
                table: "ServiceAuditLogs");
        }
    }
}
