using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddIndexesForSoundex : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"CREATE EXTENSION fuzzystrmatch");
            migrationBuilder.Sql(@"CREATE INDEX IX_Participants_FirstName_Soundex ON public.""Participants"" (SOUNDEX(""FirstName""))");
            migrationBuilder.Sql(@"CREATE INDEX IX_Participants_BusinessContactFirstName_Soundex ON public.""Participants"" (SOUNDEX(""BusinessContactFirstName""))");
            migrationBuilder.Sql(@"CREATE INDEX IX_Participants_LastName_Soundex ON public.""Participants"" (SOUNDEX(""LastName""))");
            migrationBuilder.Sql(@"CREATE INDEX IX_Participants_BusinessContactLastName_Soundex ON public.""Participants"" (SOUNDEX(""BusinessContactLastName""))");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP INDEX IX_Participants_FirstName_Soundex");
            migrationBuilder.Sql(@"DROP INDEX IX_Participants_BusinessContactFirstName_Soundex");
            migrationBuilder.Sql(@"DROP INDEX IX_Participants_LastName_Soundex");
            migrationBuilder.Sql(@"DROP INDEX IX_Participants_BusinessContactLastName_Soundex");
        }
    }
}
