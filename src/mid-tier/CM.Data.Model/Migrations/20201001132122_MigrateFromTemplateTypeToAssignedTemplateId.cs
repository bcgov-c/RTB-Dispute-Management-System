using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class MigrateFromTemplateTypeToAssignedTemplateId : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"UPDATE public.""EmailTemplates"" SET ""AssignedTemplateId""=""TemplateType""");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"UPDATE public.""EmailTemplates"" SET ""EmailTemplates"" set ""AssignedTemplateId"" = ''");
        }
    }
}
