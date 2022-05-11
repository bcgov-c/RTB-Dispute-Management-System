using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class UpdateTemplateTypeField : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex("IX_EmailTemplates_TemplateType", "dbo.EmailTemplates");
            migrationBuilder.Sql(@"UPDATE public.""EmailTemplates"" SET ""TemplateType""='1'");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_EmailTemplates_TemplateType",
                table: "EmailTemplates",
                column: "TemplateType",
                unique: true);
            migrationBuilder.Sql(@"UPDATE public.""EmailTemplates"" SET ""TemplateType"" = ""AssignedTemplateId""");
        }
    }
}
