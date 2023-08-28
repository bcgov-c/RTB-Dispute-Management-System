using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class AddNotificationDeliveryFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "NotificationDeliveryDate",
                table: "Hearings",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NotificationDeliveryDescription",
                table: "Hearings",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NotificationDeliveryDate",
                table: "Hearings");

            migrationBuilder.DropColumn(
                name: "NotificationDeliveryDescription",
                table: "Hearings");
        }
    }
}
