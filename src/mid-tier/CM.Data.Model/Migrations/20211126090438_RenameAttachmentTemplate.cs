using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class RenameAttachmentTemplate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PreferedSendDate",
                table: "EmailMessages",
                newName: "PreferredSendDate");

            migrationBuilder.AlterColumn<int>(
                name: "AssignedTemplateId",
                table: "EmailTemplates",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "TemplateId",
                table: "EmailMessages",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.RenameColumn(
                name: "TemplateId",
                table: "EmailMessages",
                newName: "AssignedTemplateId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PreferredSendDate",
                table: "EmailMessages",
                newName: "PreferedSendDate");

            migrationBuilder.RenameColumn(
                name: "AssignedTemplateId",
                table: "EmailMessages",
                newName: "TemplateId");

            migrationBuilder.AlterColumn<byte>(
                name: "TemplateId",
                table: "EmailMessages",
                nullable: false,
                defaultValue: (byte)0,
                oldClrType: typeof(byte));
        }
    }
}
