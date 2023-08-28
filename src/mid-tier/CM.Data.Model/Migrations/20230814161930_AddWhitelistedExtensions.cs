using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class AddWhitelistedExtensions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('WhitelistedExtensions', '.avi .mts .mp4 .mov .wmv .3gp .3g2 .m4v .mpg .mpeg .h264 .mkv .web .pdf .jpg .png .jpeg .docx .mp4 .mov .avi .doc .m4a .tif .mp3 .txt .rtf .odt .m4v .xlsx .bmp .tiff .wav .wma .wmv .pptx .xls .csv .aa', 4)");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'WhitelistedExtensions'");
        }
    }
}
