using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateNoticeService : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ArchiveReceivedDate",
                table: "NoticeServices",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ArchiveServedBy",
                table: "NoticeServices",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ArchiveServiceDate",
                table: "NoticeServices",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "ArchiveServiceDateUsed",
                table: "NoticeServices",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "ArchiveServiceMethod",
                table: "NoticeServices",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ArchivedBy",
                table: "NoticeServices",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "NoticeServices",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ArchiveReceivedDate",
                table: "NoticeServices");

            migrationBuilder.DropColumn(
                name: "ArchiveServedBy",
                table: "NoticeServices");

            migrationBuilder.DropColumn(
                name: "ArchiveServiceDate",
                table: "NoticeServices");

            migrationBuilder.DropColumn(
                name: "ArchiveServiceDateUsed",
                table: "NoticeServices");

            migrationBuilder.DropColumn(
                name: "ArchiveServiceMethod",
                table: "NoticeServices");

            migrationBuilder.DropColumn(
                name: "ArchivedBy",
                table: "NoticeServices");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "NoticeServices");
        }
    }
}
