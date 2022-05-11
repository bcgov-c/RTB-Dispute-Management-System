using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class DeleteLastAssignedDateTimeAsInteger : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastAssignedDateTime",
                table: "FactIntakeProcessings");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LastAssignedDateTime",
                table: "FactIntakeProcessings",
                type: "timestamp without time zone",
                nullable: true);
        }
    }
}
