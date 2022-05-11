using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddSoundexForCity : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"CREATE INDEX IX_Participants_City_Soundex ON public.""Participants"" (SOUNDEX(""City""))");
            migrationBuilder.Sql(@"CREATE INDEX IX_Disputes_TenancyCity_Soundex ON public.""Disputes"" (SOUNDEX(""TenancyCity""))");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP INDEX IX_Participants_City");
            migrationBuilder.Sql(@"DROP INDEX IX_Disputes_TenancyCity_Soundex");
        }
    }
}
