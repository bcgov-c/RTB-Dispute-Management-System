using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Migrations
{
    public partial class UpdateAdHocTables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "AdHocReports",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "boolean");

            migrationBuilder.AddColumn<int>(
                name: "CreatedBy",
                table: "AdHocReports",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "AdHocReports",
                type: "boolean",
                nullable: true,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "ModifiedBy",
                table: "AdHocReports",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ModifiedDate",
                table: "AdHocReports",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "ReportSubType",
                table: "AdHocReports",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "ReportType",
                table: "AdHocReports",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "ReportUserGroup",
                table: "AdHocReports",
                type: "smallint",
                nullable: true);

            migrationBuilder.AlterColumn<byte>(
                name: "TargetDatabase",
                table: "AdHocReportAttachments",
                type: "smallint",
                nullable: false,
                oldClrType: typeof(byte),
                oldType: "smallint",
                oldDefaultValue: (byte)1);

            migrationBuilder.AddColumn<int>(
                name: "CreatedBy",
                table: "AdHocReportAttachments",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "AdHocReportAttachments",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ModifiedBy",
                table: "AdHocReportAttachments",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ModifiedDate",
                table: "AdHocReportAttachments",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AlterColumn<byte>(
                name: "TargetDatabase",
                table: "AdHocDlReports",
                type: "smallint",
                nullable: true,
                defaultValue: (byte)1,
                oldClrType: typeof(byte),
                oldType: "smallint",
                oldDefaultValue: (byte)1);

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "AdHocDlReports",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "boolean");

            migrationBuilder.AddColumn<int>(
                name: "CreatedBy",
                table: "AdHocDlReports",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "AdHocDlReports",
                type: "boolean",
                nullable: true,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "ModifiedBy",
                table: "AdHocDlReports",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ModifiedDate",
                table: "AdHocDlReports",
                type: "timestamp without time zone",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "AdHocReports");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "AdHocReports");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "AdHocReports");

            migrationBuilder.DropColumn(
                name: "ModifiedDate",
                table: "AdHocReports");

            migrationBuilder.DropColumn(
                name: "ReportSubType",
                table: "AdHocReports");

            migrationBuilder.DropColumn(
                name: "ReportType",
                table: "AdHocReports");

            migrationBuilder.DropColumn(
                name: "ReportUserGroup",
                table: "AdHocReports");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "AdHocReportAttachments");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "AdHocReportAttachments");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "AdHocReportAttachments");

            migrationBuilder.DropColumn(
                name: "ModifiedDate",
                table: "AdHocReportAttachments");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "AdHocDlReports");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "AdHocDlReports");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "AdHocDlReports");

            migrationBuilder.DropColumn(
                name: "ModifiedDate",
                table: "AdHocDlReports");

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "AdHocReports",
                type: "boolean",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<byte>(
                name: "TargetDatabase",
                table: "AdHocReportAttachments",
                type: "smallint",
                nullable: false,
                defaultValue: (byte)1,
                oldClrType: typeof(byte),
                oldType: "smallint");

            migrationBuilder.AlterColumn<byte>(
                name: "TargetDatabase",
                table: "AdHocDlReports",
                type: "smallint",
                nullable: false,
                defaultValue: (byte)1,
                oldClrType: typeof(byte),
                oldType: "smallint",
                oldNullable: true,
                oldDefaultValue: (byte)1);

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "AdHocDlReports",
                type: "boolean",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldDefaultValue: false);
        }
    }
}
