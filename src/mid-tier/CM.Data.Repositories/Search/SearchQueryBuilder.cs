using System;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using CM.Business.Entities.Models.Search;
using CM.Common.Utilities;

namespace CM.Data.Repositories.Search;

public static class SearchQueryBuilder
{
    private static readonly string DisputeWithSingleStatusQuery =
        $@"SELECT DISTINCT
                DS.""DisputeGuid"", 
                DS.""Status"", 
                DS.""Stage"", 
                DS.""Process"", 
                DS.""Owner"", 
                DS.""StatusStartDate"", 
                D.""SubmittedDate"", 
                D.""CreatedDate"", 
                D.""TenancyAddress"",
                DLM.""LastModifiedDate"",
                SOUNDEX(D.""TenancyCity"") as ""TenancyCity"", 
                LOWER(regexp_replace(D.""TenancyZipPostal"", '[^a-zA-Z0-9]', '', 'g')) as ""TenancyZipPostal""
            FROM public.""Disputes"" D
            inner JOIN public.""DisputeStatuses"" DS ON DS.""DisputeGuid"" = D.""DisputeGuid"" and DS.""IsActive""
            inner JOIN public.""DisputesLastModified"" DLM ON DLM.""DisputeGuid"" = D.""DisputeGuid""";

    public static string GenerateDisputeInfoQuery(DisputeInfoSearchRequest request)
    {
        var sb = new StringBuilder();
        sb.Append(DisputeWithSingleStatusQuery);
        sb.Append(@" LEFT JOIN public.""ClaimGroupParticipants"" AS CPG on CPG.""DisputeGuid"" = D.""DisputeGuid""
                        LEFT JOIN public.""DisputeFees"" AS DF on DF.""DisputeGuid"" = D.""DisputeGuid""
                        LEFT JOIN public.""DisputeHearings"" AS DH on DH.""DisputeGuid"" = D.""DisputeGuid""
                        LEFT JOIN public.""Hearings"" AS H on H.""HearingId"" = DH.""HearingId""
                        LEFT JOIN public.""Notices"" AS N on N.""HearingId"" = H.""HearingId""");

        sb.Append(" WHERE 1=1 ");

        if (request.DisputeType != null)
        {
            sb.And(@"D.""DisputeType""", "=", request.DisputeType.Value.ToString());
        }

        if (request.DisputeSubType != null)
        {
            sb.And(@"D.""DisputeSubType""", "=", request.DisputeSubType.Value.ToString());
        }

        if (!string.IsNullOrEmpty(request.TenancyAddress))
        {
            sb.And(@"LOWER(D.""TenancyAddress"")", "LIKE", request.TenancyAddress.NormalizeThenLowerAndStripApostrophe());
        }

        if (!string.IsNullOrEmpty(request.TenancyZipPostal))
        {
            var regexTenancyZipPostal = Regex.Replace(request.TenancyZipPostal, "[^a-zA-Z0-9]", string.Empty).NormalizeThenLowerAndStripApostrophe();
            sb.And(@"LOWER(regexp_replace(D.""TenancyZipPostal"", '[^a-zA-Z0-9]', '', 'g'))", "LIKE", regexTenancyZipPostal);
        }

        if (!string.IsNullOrEmpty(request.TenancyEnded.ToString()))
        {
            sb.And(@"D.""TenancyEnded""", "=", request.TenancyEnded.ToString());
        }

        if (!string.IsNullOrEmpty(request.CreationMethod.ToString()))
        {
            sb.And(@"D.""CreationMethod""", "=", request.CreationMethod.ToString());
        }

        if (request.SubmittedDate != null)
        {
            sb.And(@"CAST(D.""SubmittedDate"" AS date)", "=", request.SubmittedDate.Value.Date.ToString(CultureInfo.InvariantCulture));
        }

        if (request.CreatedDate != null)
        {
            sb.And(@"CAST(D.""CreatedDate"", AS date)", "=", request.CreatedDate.Value.Date.ToString(CultureInfo.InvariantCulture));
        }

        if (request.ModifiedDate != null)
        {
            sb.And(@"CAST(DLM.""LastModifiedDate"" AS date)", "=", request.ModifiedDate.Value.Date.ToString(CultureInfo.InvariantCulture));
        }

        sb.AndCommonFilters(request);

        return sb.ToString();
    }

    public static string GenerateParticipantQuery(ParticipantSearchRequest request)
    {
        var sb = new StringBuilder();
        sb.Append(DisputeWithSingleStatusQuery);
        sb.Append(@" LEFT JOIN public.""Participants"" AS P ON P.""DisputeGuid"" = DS.""DisputeGuid""");

        sb.Append(" WHERE 1=1");

        sb.Append(@" AND P.""IsDeleted""=false");

        if (!string.IsNullOrEmpty(request.BusinessName))
        {
            sb.And(@"LOWER(P.""BusinessName"")", "LIKE", request.BusinessName.NormalizeThenLowerAndStripApostrophe());
        }

        if (!string.IsNullOrEmpty(request.AllFirstName))
        {
            if (request.AllFirstName.Length < 5)
            {
                sb.Append($@" AND (LOWER(P.""BusinessContactFirstName"") LIKE '%{request.AllFirstName.NormalizeThenLowerAndStripApostrophe()}%' OR LOWER(P.""FirstName"") LIKE '%{request.AllFirstName.NormalizeThenLowerAndStripApostrophe()}%') ");
            }
            else
            {
                sb.Append($@" 
                        AND (SOUNDEX(LOWER(regexp_replace(P.""BusinessContactFirstName"", '[^a-zA-Z0-9]', '', 'g'))) = SOUNDEX('%{request.AllFirstName.NormalizeThenLowerAndRemoveQuotes()}%') 
                        OR SOUNDEX(LOWER(regexp_replace(P.""FirstName"", '[^a-zA-Z0-9]', '', 'g'))) = SOUNDEX('%{request.AllFirstName.NormalizeThenLowerAndRemoveQuotes()}%')) ");
            }
        }

        if (!string.IsNullOrEmpty(request.AllLastName))
        {
            if (request.AllLastName.Length < 5)
            {
                sb.Append($@" AND (LOWER(P.""BusinessContactLastName"") LIKE '%{request.AllLastName.NormalizeThenLowerAndStripApostrophe()}%' OR LOWER(P.""LastName"") LIKE '%{request.AllLastName.NormalizeThenLowerAndStripApostrophe()}%') ");
            }
            else
            {
                sb.Append($@" 
                    AND (SOUNDEX(LOWER(regexp_replace(P.""BusinessContactLastName"", '[^a-zA-Z0-9]', '', 'g'))) = SOUNDEX('%{request.AllLastName.NormalizeThenLowerAndRemoveQuotes()}%') 
                    OR SOUNDEX(LOWER(regexp_replace(P.""LastName"", '[^a-zA-Z0-9]', '', 'g'))) = SOUNDEX('%{request.AllLastName.NormalizeThenLowerAndRemoveQuotes()}%')) ");
            }
        }

        if (!string.IsNullOrEmpty(request.AllPhone))
        {
            var regexPhone = Regex.Replace(request.AllPhone, "[^0-9]", string.Empty);
            sb.Append($@" AND (RIGHT(regexp_replace(P.""PrimaryPhone"", '[^0-9\s]', '', 'g'),10) = '{regexPhone}' OR RIGHT(regexp_replace(P.""SecondaryPhone"", '[^0-9\s]', '', 'g'),10) = '{regexPhone}' OR RIGHT(regexp_replace(P.""Fax"", '[^0-9\s]', '', 'g'),10) = '{regexPhone}') ");
        }

        if (!string.IsNullOrEmpty(request.Email))
        {
            sb.And(@"LOWER(P.""Email"")", "=", request.Email.ToLower());
        }

        if (!string.IsNullOrEmpty(request.CreationMethod.ToString()))
        {
            sb.And(@"D.""CreationMethod""", "=", request.CreationMethod.ToString());
        }

        sb.AndCommonFilters(request);

        return sb.ToString();
    }

    public static string GenerateDisputeStatusQuery(DisputeStatusSearchRequest request)
    {
        var sb = new StringBuilder();

        if (request.IncludeHistory.HasValue && request.IncludeHistory.Value)
        {
            sb.Append($@"SELECT
                        DS.""DisputeGuid"", DS.""Status"", DS.""Stage"", DS.""Process"", DS.""Owner"", DS.""StatusStartDate"", D.""SubmittedDate"", D.""CreatedDate"", DLM.""LastModifiedDate""
                        FROM public.""DisputeStatuses"" DS
                        LEFT JOIN public.""Disputes"" D ON DS.""DisputeGuid"" = D.""DisputeGuid""
                        LEFT JOIN public.""DisputesLastModified"" DLM ON DLM.""DisputeGuid"" = D.""DisputeGuid""");
        }
        else
        {
            sb.Append(DisputeWithSingleStatusQuery);
        }

        sb.Append(" WHERE 1=1");

        if (request.CreationMethod != null)
        {
            sb.And(@"D.""CreationMethod""", "=", request.CreationMethod.Value.ToString());
        }

        if (request.Status != null)
        {
            sb.And(@"DS.""Status""", "=", request.Status.Value.ToString());
        }

        if (request.Stage != null)
        {
            sb.And(@"DS.""Stage""", "=", request.Stage.Value.ToString());
        }

        if (request.Process != null)
        {
            sb.And(@"DS.""Process""", "=", request.Process.Value.ToString());
        }

        if (request.Owner != null)
        {
            sb.And(@"DS.""Owner""", "=", request.Owner.Value.ToString());
        }

        sb.AndCommonFilters(request);

        return sb.ToString();
    }

    public static string GenerateHearingQuery(HearingSearchRequest request)
    {
        var sb = new StringBuilder();
        sb.Append(DisputeWithSingleStatusQuery);
        sb.Append(@" LEFT JOIN public.""DisputeHearings"" AS DH ON DH.""DisputeGuid"" = DS.""DisputeGuid""
                        LEFT JOIN public.""Hearings"" AS H ON H.""HearingId"" = DH.""HearingId""");

        sb.Append(" WHERE 1=1");

        sb.Append(@" AND DH.""IsDeleted""=false");
        sb.Append(@" AND H.""IsDeleted""=false");

        if (request.HearingStart != null)
        {
            sb.And(@"CAST(H.""LocalStartDateTime"" AS date)", "=", request.HearingStart.Value.Date.ToString(CultureInfo.InvariantCulture));
        }

        if (request.HearingType != null)
        {
            sb.And(@"H.""HearingType""", "=", request.HearingType.Value.ToString());
        }

        if (request.HearingOwner != null)
        {
            sb.And(@"H.""HearingOwner""", "=", request.HearingOwner.Value.ToString());
        }

        if (request.HearingStatus != null)
        {
            sb.And(@"DH.""DisputeHearingStatus""", "=", request.HearingStatus.Value.ToString());
        }

        if (!string.IsNullOrEmpty(request.CreationMethod.ToString()))
        {
            sb.And(@"D.""CreationMethod""", "=", request.CreationMethod.ToString());
        }

        sb.AndCommonFilters(request);

        return sb.ToString();
    }

    public static string GenerateCrossApplicationQueryForSourceDispute(CrossApplicationSearchRequest request)
    {
        var sb = new StringBuilder();
        sb.Append(DisputeWithSingleStatusQuery);

        sb.Append(" WHERE 1=1");
        sb.And(@"D.""DisputeGuid""", "=", request.DisputeGuid.ToString());
        return sb.ToString();
    }

    public static string GenerateCrossApplicationQueryForDestinationDisputes(CrossApplicationSourceDisputeRequest request)
    {
        var sb = new StringBuilder();
        sb.Append(DisputeWithSingleStatusQuery);
        sb.Append(" WHERE 1=1 ");
        sb.Append($@" AND
                    ((D.""TenancyAddress"" ILIKE '%{request.TenancyAddress.NormalizeThenLowerAndStripApostrophe()}%' AND SOUNDEX(D.""TenancyCity"") = '{request.TenancyCitySoundex}')
                OR
                    (D.""TenancyAddress"" ILIKE '%{request.TenancyAddress.NormalizeThenLowerAndStripApostrophe()}%' AND LOWER(regexp_replace(D.""TenancyZipPostal"", '[^a-zA-Z0-9]', '', 'g')) = '{request.TenancyZipPostal}')
                OR
                    (LOWER(regexp_replace(D.""TenancyZipPostal"", '[^a-zA-Z0-9]', '', 'g')) = '{request.TenancyZipPostal}' AND SOUNDEX(D.""TenancyCity"") = '{request.TenancyCitySoundex}'))");
        if (request.HearingAfterDays != null)
        {
            sb.Append($@" AND DS.""DisputeGuid"" NOT IN (
                    SELECT DH.""DisputeGuid""
                    FROM public.""Hearings"" H
                    INNER JOIN public.""DisputeHearings"" DH 
                        ON DH.""HearingId"" = H.""HearingId""
                    WHERE  DH.""DisputeGuid"" is not null and
                        H.""IsDeleted"" != true  and
                        DH.""IsDeleted"" != true and 
                        H.""LocalStartDateTime"" >= CURRENT_DATE AND 
                        H.""LocalStartDateTime"" <= (CURRENT_DATE + INTERVAL '{request.HearingAfterDays} day'))");
        }

        sb.AndCommonFilters(request);
        return sb.ToString();
    }

    public static string GenerateCrossApplicationQueryForSourceParticipants(Guid disputeGuid)
    {
        var sb = new StringBuilder();
        sb.Append($@"select * from ""CrossAppDestinationParticipants""");
        sb.Append(" WHERE 1=1");
        sb.And(@"""DisputeGuid""", "=", disputeGuid.ToString());
        return sb.ToString();
    }

    public static string GenerateClaimsQuery(ClaimsSearchRequest request)
    {
        var sb = new StringBuilder();
        var claimCodesWhereClause = GenerateQueryPart(request.ClaimCodes);

        sb.Append(DisputeWithSingleStatusQuery);
        sb.Append(@" LEFT JOIN public.""ClaimGroups"" AS CG on CG.""DisputeGuid"" = D.""DisputeGuid""");
        sb.Append(claimCodesWhereClause);
        sb.Append(@" WHERE C.""IsDeleted""=false");

        if (!string.IsNullOrEmpty(request.CreationMethod.ToString()))
        {
            sb.And(@"D.""CreationMethod""", "=", request.CreationMethod.ToString());
        }

        sb.AndCommonFilters(request);

        return sb.ToString();
    }

    public static string GenerateDisputeMessageOwnersQuery(DisputeMessageOwnerSearchRequest request)
    {
        var baseQuery =
            $@"SELECT DISTINCT ON (DS.""DisputeGuid"")
                DS.""DisputeGuid"", 
                DS.""Status"", 
                DS.""Stage"", 
                DS.""Process"", 
                DS.""Owner"", 
                DS.""StatusStartDate"", 
                D.""SubmittedDate"", 
                D.""CreatedDate"", 
                D.""TenancyAddress"",
                DLM.""LastModifiedDate"",
                SOUNDEX(D.""TenancyCity"") as ""TenancyCity"", 
                LOWER(regexp_replace(D.""TenancyZipPostal"", '[^a-zA-Z0-9]', '', 'g')) as ""TenancyZipPostal"",
                EM.""CreatedDate"" as MessageCreatedDate,
                EM.""EmailMessageId"",
                EM.""IsDeleted""
            FROM public.""Disputes"" D
            inner JOIN public.""DisputeStatuses"" DS ON DS.""DisputeGuid"" = D.""DisputeGuid"" and DS.""IsActive""
            inner JOIN public.""DisputesLastModified"" DLM ON DLM.""DisputeGuid"" = D.""DisputeGuid""
            inner JOIN public.""EmailMessages"" AS EM ON EM.""DisputeGuid"" = DS.""DisputeGuid""
            WHERE EM.""IsDeleted""=false";

        var sb = new StringBuilder();
        sb.Append(baseQuery);

        if (request.CreatedBy != null)
        {
            sb.And(@"EM.""CreatedBy""", "in", "(" + request.CreatedBy.CreateString(",") + ")");
        }

        if (request.MessageTypes != null)
        {
            sb.And(@"EM.""MessageType""", "in", "(" + request.MessageTypes.CreateString(",") + ")");
        }

        if (request.SendStatuses != null)
        {
            sb.And(@"EM.""SendStatus""", "in", "(" + request.SendStatuses.CreateString(",") + ")");
        }

        if (request.TemplateIds != null)
        {
            sb.And(@"EM.""AssignedTemplateId""", "in", "(" + request.TemplateIds.CreateString(",") + ")");
        }

        if (request.CreatedDateGreaterThan != null)
        {
            sb.And(@"EM.""CreatedDate""", ">", request.CreatedDateGreaterThan.Value.ToString(CultureInfo.InvariantCulture));
        }

        if (request.CreatedDateLessThan != null)
        {
            sb.And(@"EM.""CreatedDate""", "<", request.CreatedDateLessThan.Value.ToString(CultureInfo.InvariantCulture));
        }

        sb.Append(@" Order By DS.""DisputeGuid"", EM.""CreatedDate"" desc");

        return sb.ToString();
    }

    public static string GenerateDisputeStatusOwnersQuery(DisputeStatusOwnerSearchRequest request)
    {
        var criteria = new StringBuilder();
        if (request.Processes != null)
        {
            criteria.And(@"DS1.""Process""", "in", "(" + request.Processes.CreateString(",") + ")");
        }

        if (request.Statuses != null)
        {
            criteria.And(@"DS1.""Status""", "in", "(" + request.Statuses.CreateString(",") + ")");
        }

        if (request.Stages != null)
        {
            criteria.And(@"DS1.""Stage""", "in", "(" + request.Stages.CreateString(",") + ")");
        }

        if (request.StatusStartDateGreaterThan != null)
        {
            criteria.And(@"DS1.""StatusStartDate""", ">", request.StatusStartDateGreaterThan.Value.ToString(CultureInfo.InvariantCulture));
        }

        if (request.StatusStartDateLessThan != null)
        {
            criteria.And(@"DS1.""StatusStartDate""", "<", request.StatusStartDateLessThan.Value.ToString(CultureInfo.InvariantCulture));
        }

        var baseQuery =
            $@"SELECT DISTINCT ON (DS.""DisputeGuid"")
                DS.""DisputeGuid"", 
                DS.""Status"", 
                DS.""Stage"", 
                DS.""Process"", 
                DS.""Owner"", 
                DS.""StatusStartDate"", 
                D.""SubmittedDate"", 
                D.""CreatedDate"", 
                D.""TenancyAddress"",
                DLM.""LastModifiedDate"",
                SOUNDEX(D.""TenancyCity"") as ""TenancyCity"", 
                LOWER(regexp_replace(D.""TenancyZipPostal"", '[^a-zA-Z0-9]', '', 'g')) as ""TenancyZipPostal""
                FROM public.""DisputeStatuses"" DS
                inner JOIN public.""Disputes"" D ON D.""DisputeGuid"" = DS.""DisputeGuid""
                inner JOIN public.""DisputesLastModified"" DLM ON DLM.""DisputeGuid"" = D.""DisputeGuid""
                Where DS.""IsActive"" = true
                AND D.""DisputeGuid"" in (Select DS1.""DisputeGuid"" 
                                        From public.""DisputeStatuses"" DS1 
                                        Where DS1.""IsActive"" != true 
                                            and DS1.""Owner"" in (" + request.OwnedBy.CreateString(",") + ")" +
            criteria + ")";

        var sb = new StringBuilder();
        sb.Append(baseQuery);

        sb.And(@"DS.""Owner""", "not in", "(" + request.OwnedBy.CreateString(",") + ")");

        return sb.ToString();
    }

    public static string GenerateDisputeNoteOwnersQuery(DisputeNoteOwnerSearchRequest request)
    {
        var baseQuery =
            $@"SELECT DISTINCT ON (DS.""DisputeGuid"")
                DS.""DisputeGuid"", 
                DS.""Status"", 
                DS.""Stage"", 
                DS.""Process"", 
                DS.""Owner"", 
                DS.""StatusStartDate"", 
                D.""SubmittedDate"", 
                D.""CreatedDate"", 
                D.""TenancyAddress"",
                DLM.""LastModifiedDate"",
                SOUNDEX(D.""TenancyCity"") as ""TenancyCity"", 
                LOWER(regexp_replace(D.""TenancyZipPostal"", '[^a-zA-Z0-9]', '', 'g')) as ""TenancyZipPostal"",
                N.""CreatedDate"" AS NoteCreatedDate,
                N.""NoteId"",
                N.""IsDeleted""
            FROM public.""Notes"" AS N
            LEFT JOIN public.""Disputes"" D ON D.""DisputeGuid"" = N.""DisputeGuid""
            inner JOIN public.""DisputeStatuses"" DS ON DS.""DisputeGuid"" = D.""DisputeGuid"" and DS.""IsActive""
            inner JOIN public.""DisputesLastModified"" DLM ON DLM.""DisputeGuid"" = D.""DisputeGuid""";

        var sb = new StringBuilder();
        sb.Append(baseQuery);

        sb.Append(" WHERE 1=1");

        sb.Append(@" AND N.""IsDeleted""=false");

        if (request.NoteLinkedTo != null)
        {
            sb.And(@"N.""NoteLinkedTo""", "in", "(" + request.NoteLinkedTo.CreateString(",") + ")");
        }

        if (request.CreatorGroupRoleId != null)
        {
            sb.And(@"N.""CreatorGroupRoleId""", "in", "(" + request.CreatorGroupRoleId.CreateString(",") + ")");
        }

        if (request.OwnedBy != null)
        {
            sb.And(@"N.""CreatedBy""", "in", "(" + request.OwnedBy.CreateString(",") + ")");
        }

        if (request.CreatedDateGreaterThan != null)
        {
            sb.And(@"N.""CreatedDate""", ">", request.CreatedDateGreaterThan.Value.ToString(CultureInfo.InvariantCulture));
        }

        if (request.CreatedDateLessThan != null)
        {
            sb.And(@"N.""CreatedDate""", "<", request.CreatedDateLessThan.Value.ToString(CultureInfo.InvariantCulture));
        }

        sb.Append(@" Order By DS.""DisputeGuid"", N.""CreatedDate"" desc");

        return sb.ToString();
    }

    public static string GenerateDisputeDocumentOwnersQuery(DisputeDocumentOwnerSearchRequest request)
    {
        var baseQuery =
            @"SELECT DISTINCT ON (DS.""DisputeGuid"")
                DS.""DisputeGuid"",
                DS.""Status"", 
                DS.""Stage"", 
                DS.""Process"", 
                DS.""Owner"", 
                DS.""StatusStartDate"", 
                D.""SubmittedDate"", 
                D.""CreatedDate"", 
                D.""TenancyAddress"",
                DLM.""LastModifiedDate"",
                SOUNDEX(D.""TenancyCity"") as ""TenancyCity"", 
                LOWER(regexp_replace(D.""TenancyZipPostal"", '[^a-zA-Z0-9]', '', 'g')) as ""TenancyZipPostal"",
                ODF.""CreatedDate"" AS FileCreatedDate,
                ODF.""OutcomeDocFileId"",
                ODF.""IsDeleted""
            FROM public.""OutcomeDocFiles"" AS ODF
            LEFT JOIN public.""Disputes"" D ON D.""DisputeGuid"" = ODF.""DisputeGuid""
            inner JOIN public.""DisputeStatuses"" DS ON DS.""DisputeGuid"" = D.""DisputeGuid"" and DS.""IsActive""
            inner JOIN public.""DisputesLastModified"" DLM ON DLM.""DisputeGuid"" = D.""DisputeGuid""";

        var sb = new StringBuilder();
        sb.Append(baseQuery);

        sb.Append(" WHERE 1=1");

        sb.Append(@" AND ODF.""IsDeleted""=false");

        if (request.FileType != null)
        {
            sb.And(@"ODF.""FileType""", "in", "(" + request.FileType.CreateString(",") + ")");
        }

        if (request.HasFileId.HasValue && request.HasFileId.Value)
        {
            sb.Append(@" AND ODF.""FileId"" is not null");
        }

        if (request.OwnedBy != null)
        {
            sb.And(@"ODF.""CreatedBy""", "in", "(" + request.OwnedBy.CreateString(",") + ")");
        }

        if (request.CreatedDateGreaterThan != null)
        {
            sb.And(@"ODF.""CreatedDate""", ">", request.CreatedDateGreaterThan.Value.ToString(CultureInfo.InvariantCulture));
        }

        if (request.CreatedDateLessThan != null)
        {
            sb.And(@"ODF.""CreatedDate""", "<", request.CreatedDateLessThan.Value.ToString(CultureInfo.InvariantCulture));
        }

        sb.Append(@" Order By DS.""DisputeGuid"", ODF.""CreatedDate"" desc");

        return sb.ToString();
    }

    private static string GenerateQueryPart(int[] claimCodes)
    {
        var sb = new StringBuilder();
        sb.Append(@" left join(");
        foreach (var code in claimCodes)
        {
            sb.Append(@" select ""ClaimGroupId"", ""IsDeleted"" from public.""Claims"" 
                            where ""ClaimCode"" = " + code + @" AND ""ClaimStatus"" NOT IN (" + (int)ClaimStatus.Removed + "," + (int)ClaimStatus.Deleted + ")");
            if (claimCodes.ToList().IndexOf(code) < claimCodes.Length - 1)
            {
                sb.Append("intersect");
            }
        }

        sb.Append(@") AS C on C.""ClaimGroupId"" = CG.""ClaimGroupId""");

        return sb.ToString();
    }

    private static void AndCommonFilters(this StringBuilder sb, SearchRequestBase commonRequest)
    {
        if (commonRequest.SubmittedDateGreaterThan != null)
        {
            sb.And(@"D.""SubmittedDate""", ">", commonRequest.SubmittedDateGreaterThan.Value.ToString(CultureInfo.InvariantCulture));
        }

        if (commonRequest.SubmittedDateLessThan != null)
        {
            sb.And(@"D.""SubmittedDate""", "<", commonRequest.SubmittedDateLessThan.Value.ToString(CultureInfo.InvariantCulture));
        }

        if (commonRequest.CreatedDateGreaterThan != null)
        {
            sb.And(@"D.""CreatedDate""", ">", commonRequest.CreatedDateGreaterThan.Value.ToString(CultureInfo.InvariantCulture));
        }

        if (commonRequest.CreatedDateLessThan != null)
        {
            sb.And(@"D.""CreatedDate""", "<", commonRequest.CreatedDateLessThan.Value.ToString(CultureInfo.InvariantCulture));
        }

        if (commonRequest.ModifiedDateGreaterThan != null)
        {
            sb.And(@"DLM.""LastModifiedDate""", ">", commonRequest.ModifiedDateGreaterThan.Value.ToString(CultureInfo.InvariantCulture));
        }

        if (commonRequest.ModifiedDateLessThan != null)
        {
            sb.And(@"DLM.""LastModifiedDate""", "<", commonRequest.ModifiedDateLessThan.Value.ToString(CultureInfo.InvariantCulture));
        }

        if (!commonRequest.IncludeNotActive.GetValueOrDefault())
        {
            sb.Append(" AND ");

            sb.Append($@"(DS.""Stage"" <>  {(byte)DisputeStage.DecisionAndPostSupport} OR DS.""Status"" <> {(byte)DisputeStatuses.Closed} )");

            sb.Append(" AND ");

            sb.Append($@"(DS.""Status"" <= {(byte)DisputeStatuses.UnknownAdjourned} OR DS.""Status"" >= {(byte)DisputeStatuses.ProcessDecisionRequired} )");

            sb.Append(" AND ");

            sb.Append($@"DS.""Stage"" <> {(byte)DisputeStage.ApplicationInProgress} ");
        }
    }
}