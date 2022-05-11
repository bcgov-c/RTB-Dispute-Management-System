using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateFilePackageService : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ArchiveReceivedDate",
                table: "FilePackageServices",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ArchiveServedBy",
                table: "FilePackageServices",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ArchiveServiceDate",
                table: "FilePackageServices",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "ArchiveServiceDateUsed",
                table: "FilePackageServices",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "ArchiveServiceMethod",
                table: "FilePackageServices",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ArchivedBy",
                table: "FilePackageServices",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "FilePackageServices",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ArchiveReceivedDate",
                table: "FilePackageServices");

            migrationBuilder.DropColumn(
                name: "ArchiveServedBy",
                table: "FilePackageServices");

            migrationBuilder.DropColumn(
                name: "ArchiveServiceDate",
                table: "FilePackageServices");

            migrationBuilder.DropColumn(
                name: "ArchiveServiceDateUsed",
                table: "FilePackageServices");

            migrationBuilder.DropColumn(
                name: "ArchiveServiceMethod",
                table: "FilePackageServices");

            migrationBuilder.DropColumn(
                name: "ArchivedBy",
                table: "FilePackageServices");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "FilePackageServices");
        }
    }
}
