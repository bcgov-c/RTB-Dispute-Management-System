using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateEmailTemplates : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<bool>(
                name: "IsServed",
                table: "FilePackageServices",
                nullable: true,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AssignedTemplateId",
                table: "EmailTemplates",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TemplateGroup",
                table: "EmailTemplates",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AssignedTemplateId",
                table: "EmailTemplates");

            migrationBuilder.DropColumn(
                name: "TemplateGroup",
                table: "EmailTemplates");

            migrationBuilder.AlterColumn<bool>(
                name: "IsServed",
                table: "FilePackageServices",
                type: "boolean",
                nullable: true,
                oldClrType: typeof(bool),
                oldNullable: true,
                oldDefaultValue: false);
        }
    }
}
