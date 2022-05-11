using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddPackageDateToFilePackage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "PackageDate",
                table: "FilePackages",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Online_Cross_App_File_Number",
                table: "CMSData",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Cross_App_File_Number",
                table: "CMSData",
                maxLength: 60,
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 20,
                oldNullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PackageDate",
                table: "FilePackages");

            migrationBuilder.AlterColumn<string>(
                name: "Online_Cross_App_File_Number",
                table: "CMSData",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Cross_App_File_Number",
                table: "CMSData",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 60,
                oldNullable: true);
        }
    }
}
