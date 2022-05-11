using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateRequestDocTypeNotNullable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<byte>(
                name: "RequestDocType",
                table: "SubstitutedServices",
                nullable: false,
                oldClrType: typeof(byte),
                oldNullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<byte>(
                name: "RequestDocType",
                table: "SubstitutedServices",
                nullable: true,
                oldClrType: typeof(byte));
        }
    }
}
