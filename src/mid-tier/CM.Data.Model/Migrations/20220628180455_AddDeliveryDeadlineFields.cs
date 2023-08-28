using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class AddDeliveryDeadlineFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DeliveryDeadlineDays",
                table: "Notices",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "HasDeliveryDeadline",
                table: "Notices",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeliveryDeadlineDays",
                table: "Notices");

            migrationBuilder.DropColumn(
                name: "HasDeliveryDeadline",
                table: "Notices");
        }
    }
}
