using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class RenameNoticeFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "HasDeliveryDeadline",
                table: "Notices",
                newName: "HasServiceDeadline");

            migrationBuilder.RenameColumn(
                name: "DeliveryDeadlineDays",
                table: "Notices",
                newName: "ServiceDeadlineDays");

            migrationBuilder.AddColumn<DateTime>(
                name: "ServiceDeadlineDate",
                table: "Notices",
                type: "timestamp with time zone",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ServiceDeadlineDate",
                table: "Notices");

            migrationBuilder.RenameColumn(
                name: "ServiceDeadlineDays",
                table: "Notices",
                newName: "DeliveryDeadlineDays");

            migrationBuilder.RenameColumn(
                name: "HasServiceDeadline",
                table: "Notices",
                newName: "HasDeliveryDeadline");
        }
    }
}
