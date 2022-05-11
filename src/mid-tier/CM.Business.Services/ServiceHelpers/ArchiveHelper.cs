using System.Text;
using System.Text.RegularExpressions;
using CM.Common.Utilities;

namespace CM.Business.Services.ServiceHelpers;

public static class ArchiveHelper
{
    public static string GenerateDisputeInfoQuery(string disputeAddress, string disputeCity, byte? applicantType)
    {
        var sb = new StringBuilder();
        sb.Append(@"select D.* from public.""CMSData"" as D");

        sb.Append(" where 1=1");

        if (!string.IsNullOrEmpty(disputeAddress))
        {
            sb.And(@"LOWER(D.""Dispute_Address"")", "LIKE", disputeAddress.NormalizeThenLowerAndStripApostrophe());
        }

        if (!string.IsNullOrEmpty(disputeCity))
        {
            sb.And(@"LOWER(D.""Dispute_City"")", "LIKE", disputeCity.NormalizeThenLowerAndStripApostrophe());
        }

        if (applicantType.HasValue)
        {
            sb.And(@"D.""Applicant_Type""", "=", applicantType.Value.ToString());
        }

        sb.And(@"D.""Searchable_Record""", "=", "1");

        return sb.ToString();
    }

    internal static string GenerateParticipantQuery(string firstName, string lastName, string dayTimePhone, string emailAddress, byte? participantType)
    {
        var sb = new StringBuilder();
        sb.Append(@"select P.""Request_ID""
                        from public.""CMSParticipants"" as P");

        sb.Append(" where 1=1");

        if (!string.IsNullOrEmpty(firstName))
        {
            sb.And(@"LOWER(P.""First_Name"")", "LIKE", firstName.NormalizeThenLowerAndStripApostrophe());
        }

        if (!string.IsNullOrEmpty(lastName))
        {
            sb.And(@"LOWER(P.""Last_Name"")", "LIKE", lastName.NormalizeThenLowerAndStripApostrophe());
        }

        if (!string.IsNullOrEmpty(dayTimePhone))
        {
            var regexPhone = Regex.Replace(dayTimePhone, "[^0-9]", string.Empty);
            sb.And(@"((RIGHT(regexp_replace(concat(P.""DayTime_Area"", P.""DayTime_Phone""), '[^0-9\s]', '', 'g'),10))", "=", regexPhone);
            sb.Or(@"(RIGHT(regexp_replace(concat(P.""Other_Area"", P.""Other_Phone""), '[^0-9\s]', '', 'g'),10))", "=", regexPhone);
            sb.Append(')');
        }

        if (!string.IsNullOrEmpty(emailAddress))
        {
            sb.And(@"LOWER(P.""Email_Address"")", "=", emailAddress.ToLower());
        }

        if (participantType.HasValue)
        {
            sb.And(@"P.""Participant_Type""", "=", participantType.Value.ToString());
        }

        return sb.ToString();
    }
}