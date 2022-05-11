using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace CM.Data.Model.Migrations
{
    public partial class AddMaintenance : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Maintenance",
                columns: table => new
                {
                    MaintenanceId = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    SystemId = table.Column<byte>(nullable: false),
                    MaintenanceTitle = table.Column<string>(maxLength: 255, nullable: true),
                    StartDateTime = table.Column<DateTime>(nullable: false),
                    ExpectedDurationMinutes = table.Column<int>(nullable: false),
                    OverrideKey = table.Column<string>(maxLength: 15, nullable: false),
                    Active = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Maintenance", x => x.MaintenanceId);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Maintenance");
        }
    }
}
