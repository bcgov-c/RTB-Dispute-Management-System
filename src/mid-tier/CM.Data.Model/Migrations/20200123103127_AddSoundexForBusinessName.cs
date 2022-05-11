using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddSoundexForBusinessName : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Participants_AccessCode",
                table: "Participants",
                column: "AccessCode");

            migrationBuilder.CreateIndex(
                name: "IX_Disputes_FileNumber",
                table: "Disputes",
                column: "FileNumber");

            migrationBuilder.Sql(@"CREATE INDEX IX_Participants_BusinessName_Soundex ON public.""Participants"" (SOUNDEX(""BusinessName""))");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Participants_AccessCode",
                table: "Participants");

            migrationBuilder.DropIndex(
                name: "IX_Disputes_FileNumber",
                table: "Disputes");

            migrationBuilder.Sql(@"DROP INDEX IX_Participants_BusinessName_Soundex");
        }
    }
}
