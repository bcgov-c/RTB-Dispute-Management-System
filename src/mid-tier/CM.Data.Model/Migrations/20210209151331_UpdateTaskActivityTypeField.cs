using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateTaskActivityTypeField : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<byte>(
                name: "TaskActivityType",
                table: "Tasks",
                type: "smallint",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "TaskActivityType",
                table: "Tasks",
                type: "integer",
                nullable: true,
                oldClrType: typeof(byte),
                oldType: "smallint",
                oldNullable: true);
        }
    }
}
