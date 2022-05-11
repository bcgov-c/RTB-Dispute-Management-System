using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class NamingConventionCrossAppSourceDestinationParticipantsView : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP VIEW public.""CrossAppSourceParticipants""");
            string sourceParticipantsScript = @"
                    CREATE OR REPLACE VIEW public.""CrossAppSourceParticipants""
                    AS SELECT
                    ""D"".""DisputeSubType"", ""P"".""ParticipantId"", ""GroupParticipantRole"", 
                    ""P"".""DisputeGuid"",
                    ""BusinessName"", SOUNDEX(""BusinessName"") AS ""SoundexBusinessName"",
                    ""BusinessContactFirstName"", SOUNDEX(""BusinessContactFirstName"") AS ""SoundexBusinessContactFirstName"", 
                    ""BusinessContactLastName"", SOUNDEX(""BusinessContactLastName"") AS ""SoundexBusinessContactLastName"",
                    SOUNDEX(regexp_replace(""FirstName"", '[^a-zA-Z0-9]', '', 'g')) AS ""SoundexFirstName"",
                    SOUNDEX(regexp_replace(""LastName"", '[^a-zA-Z0-9]', '', 'g')) AS ""SoundexLastName"", 
                    ""Email"", LOWER(""Email"") as ""EmailNormalized"",
                    ""PrimaryPhone"", RIGHT(regexp_replace(""PrimaryPhone"", '[^0-9]', '', 'g'), 10) AS ""PrimaryPhoneNormalized"",
                    ""Address"", LOWER(""Address"") as ""AddressNormalized"",
                    ""City"", SOUNDEX(""City"") AS ""SoundexCity"",
                    ""PostalZip"", LOWER(regexp_replace(""PostalZip"", '[^a-zA-Z0-9]', '', 'g')) AS ""PostalZipNormalized""
                    FROM public.""Participants"" as ""P""
                    INNER JOIN public.""ClaimGroupParticipants"" AS ""CGP""
                    ON ""CGP"".""ParticipantId"" = ""P"".""ParticipantId""
                    INNER JOIN public.""Disputes"" as ""D""
                    on ""P"".""DisputeGuid"" = ""D"".""DisputeGuid""
                    WHERE ""P"".""IsDeleted"" != true";
            migrationBuilder.Sql(sourceParticipantsScript);

            migrationBuilder.Sql(@"DROP VIEW public.""CrossAppDestinationParticipants""");
            string scriptForDestinationParticipants = @"
                    CREATE OR REPLACE VIEW public.""CrossAppDestinationParticipants""
                    AS SELECT
                    ""D"".""DisputeSubType"", ""P"".""ParticipantId"", ""GroupParticipantRole"", 
                    ""P"".""DisputeGuid"",
                    ""BusinessName"", SOUNDEX(""BusinessName"") AS ""SoundexBusinessName"",
                    ""BusinessContactFirstName"", 
                    SOUNDEX(""BusinessContactFirstName"") AS ""SoundexBusinessContactFirstName"", 
                    ""BusinessContactLastName"", 
                    SOUNDEX(""BusinessContactLastName"") AS ""SoundexBusinessContactLastName"",
                    ""FirstName"", 
                    SOUNDEX(regexp_replace(""FirstName"", '[^a-zA-Z0-9]', '', 'g')) AS ""SoundexFirstName"",
                    ""LastName"", 
                    SOUNDEX(regexp_replace(""LastName"", '[^a-zA-Z0-9]', '', 'g')) AS ""SoundexLastName"", 
                    ""Email"", LOWER(""Email"") as ""EmailNormalized"",
                    ""PrimaryPhone"", RIGHT(regexp_replace(""PrimaryPhone"", '[^0-9]', '', 'g'), 10) AS ""PrimaryPhoneNormalized"",
                    ""Address"", LOWER(""Address"") as ""AddressNormalized"",
                    ""City"", SOUNDEX(""City"") AS ""SoundexCity"",
                    ""PostalZip"", LOWER(regexp_replace(""PostalZip"", '[^a-zA-Z0-9]', '', 'g')) AS ""PostalZipNormalized"",
               CASE WHEN ""GroupParticipantRole"" = 1 AND ""D"".""DisputeSubType"" = 0 THEN 'Landlord'
                    WHEN ""GroupParticipantRole"" = 1 AND ""D"".""DisputeSubType"" = 1 THEN 'Tenant'
                    WHEN ""GroupParticipantRole"" = 2 AND ""D"".""DisputeSubType"" = 0 THEN 'Tenant'
                    WHEN ""GroupParticipantRole"" = 2 AND ""D"".""DisputeSubType"" = 1 THEN 'Landlord'
                    ELSE 'NoValue' END AS ""ParticipantRole""
                    FROM public.""Participants"" as ""P""
                    INNER JOIN public.""ClaimGroupParticipants"" AS ""CGP""
                    ON ""CGP"".""ParticipantId"" = ""P"".""ParticipantId""
                    INNER JOIN public.""Disputes"" as ""D""
                    on ""P"".""DisputeGuid"" = ""D"".""DisputeGuid""
                    WHERE ""P"".""IsDeleted"" != true";
            migrationBuilder.Sql(scriptForDestinationParticipants);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
