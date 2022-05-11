using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateEmailToNullabe : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "EmailTo",
                table: "EmailMessages",
                type: "character varying(70)",
                maxLength: 70,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(70)",
                oldMaxLength: 70);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "EmailTo",
                table: "EmailMessages",
                type: "character varying(70)",
                maxLength: 70,
                nullable: false,
                defaultValue: null,
                oldClrType: typeof(string),
                oldType: "character varying(70)",
                oldMaxLength: 70,
                oldNullable: true);
        }
    }
}
