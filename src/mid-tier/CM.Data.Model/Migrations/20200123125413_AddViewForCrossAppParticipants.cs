using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddViewForCrossAppParticipants : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var sourceParticipantsScript =
                @"
                    CREATE VIEW public.""CrossAppSourceParticipants""
                    AS SELECT
                    ""D"".""DisputeSubType"", ""P"".""ParticipantId"", ""GroupParticipantRole"", 
                    ""P"".""DisputeGuid"",
                    ""BusinessName"", SOUNDEX(""BusinessName"") AS ""SNDX_BusinessName"",
                    ""BusinessContactFirstName"", SOUNDEX(""BusinessContactFirstName"") AS ""SNDX_BusinessContactFirstName"", 
                    ""BusinessContactLastName"", SOUNDEX(""BusinessContactLastName"") AS ""SNDX_BusinessContactLastName"",
                    ""FirstName"", SOUNDEX(""FirstName"") AS ""SNDX_FirstName"",
                    ""LastName"", SOUNDEX(""LastName"") AS ""SNDX_LastName"", 
                    ""Email"", LOWER(""Email"") as ""CLN_Email"",
                    ""PrimaryPhone"", RIGHT(regexp_replace(""PrimaryPhone"", '[^0-9]', '', 'g'), 10) AS ""CLN_PrimaryPhone"",
                    ""Address"", LOWER(""Address"") as ""CLN_Address"",
                    ""City"", SOUNDEX(""City"") AS ""SNDX_City"",
                    ""PostalZip"", LOWER(regexp_replace(""PostalZip"", '[^a-zA-Z0-9]', '', 'g')) AS ""CLN_PostalZip""
                    FROM public.""Participants"" as ""P""
                    INNER JOIN public.""ClaimGroupParticipants"" AS ""CGP""
                    ON ""CGP"".""ParticipantId"" = ""P"".""ParticipantId""
                    INNER JOIN public.""Disputes"" as ""D""
                    on ""P"".""DisputeGuid"" = ""D"".""DisputeGuid""
                    WHERE ""P"".""IsDeleted"" != true";
            migrationBuilder.Sql(sourceParticipantsScript);

            var scriptForDestinationParticipants =
                @"
                    CREATE VIEW public.""CrossAppDestinationParticipants""
                    AS SELECT
                    ""D"".""DisputeSubType"", ""P"".""ParticipantId"", ""GroupParticipantRole"", 
                    ""P"".""DisputeGuid"",
                    ""BusinessName"", SOUNDEX(""BusinessName"") AS ""SNDX_BusinessName"",
                    ""BusinessContactFirstName"", SOUNDEX(""BusinessContactFirstName"") AS ""SNDX_BusinessContactFirstName"", 
                    ""BusinessContactLastName"", SOUNDEX(""BusinessContactLastName"") AS ""SNDX_BusinessContactLastName"",
                    ""FirstName"", SOUNDEX(""FirstName"") AS ""SNDX_FirstName"",
                    ""LastName"", SOUNDEX(""LastName"") AS ""SNDX_LastName"", 
                    ""Email"", LOWER(""Email"") as ""CLN_Email"",
                    ""PrimaryPhone"", RIGHT(regexp_replace(""PrimaryPhone"", '[^0-9]', '', 'g'), 10) AS ""CLN_PrimaryPhone"",
                    ""Address"", LOWER(""Address"") as ""CLN_Address"",
                    ""City"", SOUNDEX(""City"") AS ""SNDX_City"",
                    ""PostalZip"", LOWER(regexp_replace(""PostalZip"", '[^a-zA-Z0-9]', '', 'g')) AS ""CLN_PostalZip"",
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
            migrationBuilder.Sql(@"DROP VIEW public.CrossAppSourceParticipants");
            migrationBuilder.Sql(@"DROP VIEW public.CrossAppDestinationParticipants");
        }
    }
}
