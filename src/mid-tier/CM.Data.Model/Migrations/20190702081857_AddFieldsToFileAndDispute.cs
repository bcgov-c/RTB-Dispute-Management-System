using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddFieldsToFileAndDispute : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte>(
                name: "FileOrigin",
                table: "Files",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FileOriginId",
                table: "Files",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OwnerGuid",
                table: "Disputes",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "OwnerRole",
                table: "Disputes",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FileOrigin",
                table: "Files");

            migrationBuilder.DropColumn(
                name: "FileOriginId",
                table: "Files");

            migrationBuilder.DropColumn(
                name: "OwnerGuid",
                table: "Disputes");

            migrationBuilder.DropColumn(
                name: "OwnerRole",
                table: "Disputes");
        }
    }
}
