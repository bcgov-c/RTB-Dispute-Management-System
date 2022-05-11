using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddEmailTemplateAttachments : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TemplateAttachment05",
                table: "EmailTemplates",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TemplateAttachment06",
                table: "EmailTemplates",
                type: "integer",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TemplateAttachment05",
                table: "EmailTemplates");

            migrationBuilder.DropColumn(
                name: "TemplateAttachment06",
                table: "EmailTemplates");
        }
    }
}
