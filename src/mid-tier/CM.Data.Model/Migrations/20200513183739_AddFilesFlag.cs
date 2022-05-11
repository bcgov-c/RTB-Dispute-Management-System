using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddFilesFlag : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('StorageType', '1', 4)");

            migrationBuilder.Sql(@"ALTER TABLE public.""Files"" ADD COLUMN IF NOT EXISTS ""Storage"" SMALLINT");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'StorageType'");

            migrationBuilder.DropColumn(
                name: "Storage",
                table: "Files");
        }
    }
}
