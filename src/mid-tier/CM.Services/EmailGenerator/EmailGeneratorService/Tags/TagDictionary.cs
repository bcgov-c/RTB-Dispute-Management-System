using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CM.Services.EmailGenerator.EmailGeneratorService.Tags;

public enum Tag
{
    FileNumber,
    RecipientAccessCode,
    InitialSubmissionDate,
    EvidenceProvidedLater,
    NoticePackageDeliveryMethod,
    ThreeFromToday,
    IntakeUrl,
    DisputeAccessUrl,
    RentalUnitAddress,
    HearingDetails,
    HearingStartDate,
    HearingStartTime,
    PrimaryApplicantName,
    ApplicantType,
    DisputeType,
    PaymentTitle,
    PayorName,
    PaymentDate,
    PaymentAmount,
    PaymentId,
    PaymentMethod,
    NoticeServiceDeadlineDate,
    NoticeServiceSecondServiceDeadlineDate
}

public static class TagDictionary
{
    private static readonly Dictionary<Tag, string> Tags = new()
    {
        { Tag.FileNumber, "{file_number}" },
        { Tag.RecipientAccessCode, "{recipient_access_code}" },
        { Tag.InitialSubmissionDate, "{initial_submission_date}" },
        { Tag.EvidenceProvidedLater, "{application_evidence_later_list}" },
        { Tag.NoticePackageDeliveryMethod, "{notice_package_delivery_method}" },
        { Tag.ThreeFromToday, "{3d_from_today}" },
        { Tag.IntakeUrl, "{intake_url}" },
        { Tag.DisputeAccessUrl, "{dispute_access_url}" },
        { Tag.RentalUnitAddress, "{rental_unit_address}" },
        { Tag.HearingDetails, "{hearing_details}" },
        { Tag.HearingStartDate, "{hearing_start_date}" },
        { Tag.HearingStartTime, "{hearing_start_time}" },
        { Tag.PrimaryApplicantName, "{primary_applicant_name}" },
        { Tag.ApplicantType, "{applicant_type}" },
        { Tag.DisputeType, "{dispute_type}" },
        { Tag.PaymentTitle, "{payment_title}" },
        { Tag.PayorName, "{payor_name}" },
        { Tag.PaymentDate, "{payment_date}" },
        { Tag.PaymentAmount, "{payment_amount}" },
        { Tag.PaymentId, "{payment_id}" },
        { Tag.PaymentMethod, "{payment_method}" },
        { Tag.NoticeServiceDeadlineDate, "{notice_service_deadline_date}" },
        { Tag.NoticeServiceSecondServiceDeadlineDate, "{notice_service_second_service_deadline_date}" }
    };

    public static string GetTag(Tag tag)
    {
        return Tags[tag];
    }

    public static IEnumerable<string> GetAllTagValues()
    {
        return Tags.Values.ToList();
    }

    internal static bool TagIsExists(StringBuilder htmlBody, string tag)
    {
        return htmlBody.ToString().Contains(tag);
    }
}