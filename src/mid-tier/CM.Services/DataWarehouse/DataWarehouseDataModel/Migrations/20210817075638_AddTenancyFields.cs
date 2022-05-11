using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class AddTenancyFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "TenancyEndDate",
                table: "FactDisputeSummaries",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TenancyUnitType",
                table: "FactDisputeSummaries",
                type: "integer",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TenancyEndDate",
                table: "FactDisputeSummaries");

            migrationBuilder.DropColumn(
                name: "TenancyUnitType",
                table: "FactDisputeSummaries");
        }
    }
}
