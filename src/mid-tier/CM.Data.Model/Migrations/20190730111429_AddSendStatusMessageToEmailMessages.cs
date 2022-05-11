using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddSendStatusMessageToEmailMessages : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SendStatusMessage",
                table: "EmailMessages",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Street_Address",
                table: "CMSParticipants",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_EmailTemplates_TemplateType",
                table: "EmailTemplates",
                column: "TemplateType",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_EmailTemplates_TemplateType",
                table: "EmailTemplates");

            migrationBuilder.DropColumn(
                name: "SendStatusMessage",
                table: "EmailMessages");

            migrationBuilder.AlterColumn<string>(
                name: "Street_Address",
                table: "CMSParticipants",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 200,
                oldNullable: true);
        }
    }
}
