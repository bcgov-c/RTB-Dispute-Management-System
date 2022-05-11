using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateTasksDefaultValues : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "UnassignedDurationSeconds",
                table: "Tasks",
                type: "integer",
                nullable: true,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "AssignedDurationSeconds",
                table: "Tasks",
                type: "integer",
                nullable: true,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.Sql(@"UPDATE public.""Tasks"" SET ""UnassignedDurationSeconds"" = 0 WHERE ""UnassignedDurationSeconds"" is null");
            migrationBuilder.Sql(@"UPDATE public.""Tasks"" SET ""AssignedDurationSeconds"" = 0 WHERE ""AssignedDurationSeconds"" is null");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "UnassignedDurationSeconds",
                table: "Tasks",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true,
                oldDefaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "AssignedDurationSeconds",
                table: "Tasks",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true,
                oldDefaultValue: 0);

            migrationBuilder.Sql(@"UPDATE public.""Tasks"" SET ""UnassignedDurationSeconds"" = null WHERE ""UnassignedDurationSeconds"" = 0");
            migrationBuilder.Sql(@"UPDATE public.""Tasks"" SET ""AssignedDurationSeconds"" = null WHERE ""AssignedDurationSeconds"" = 0");
        }
    }
}
