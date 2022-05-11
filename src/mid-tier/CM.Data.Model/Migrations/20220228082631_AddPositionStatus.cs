using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddPositionStatus : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "RemedyDetails",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "PositionStatus",
                table: "RemedyDetails",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "PositionStatus",
                table: "ClaimDetails",
                type: "smallint",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PositionStatus",
                table: "RemedyDetails");

            migrationBuilder.DropColumn(
                name: "PositionStatus",
                table: "ClaimDetails");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "RemedyDetails",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);
        }
    }
}
