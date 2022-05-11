using System;
using System.Collections.Generic;

namespace CM.Data.Model.Search;

public class SearchResult
{
    public SearchResult()
    {
        Claims = new List<ClaimSearchResult>();
    }

    ////Dispute
    public int? FileNumber { get; set; }

    public Guid DisputeGuid { get; set; }

    public byte? DisputeType { get; set; }

    public byte? DisputeSubType { get; set; }

    public byte? DisputeUrgency { get; set; }

    public byte? DisputeComplexity { get; set; }

    public string TenancyAddress { get; set; }

    public string TenancyZipPostal { get; set; }

    public string TenancyCity { get; set; }

    public byte? TenancyEnded { get; set; }

    public byte? CreationMethod { get; set; }

    public DateTime? SubmittedDate { get; set; }

    public DateTime? CreatedDate { get; set; }

    public DateTime? ModifiedDate { get; set; }

    public DateTime? DisputeLastModifiedDate { get; set; }

    ////DisputeStatus
    public byte Status { get; set; }

    public byte? Stage { get; set; }

    public byte? Process { get; set; }

    public int? Owner { get; set; }

    public DateTime StatusStartDate { get; set; }

    ////ClaimParticipantGroups
    public int TotalApplicants { get; set; }

    public int TotalRespondents { get; set; }

    ////Participants
    public byte? ParticipantType { get; set; }

    public string BusinessName { get; set; }

    public string BusinessContactFirstName { get; set; }

    public string BusinessContactLastName { get; set; }

    public string FirstName { get; set; }

    public string LastName { get; set; }

    ////DisputeFees
    public bool? IntakePaymentIsPaid { get; set; }

    public DateTime? IntakePaymentDatePaid { get; set; }

    public decimal? IntakePaymentAmountPaid { get; set; }

    public byte? IntakePaymentAmountPaymentMethod { get; set; }

    ////Hearing
    public HearingSearchResult Hearing { get; set; }

    public byte? SharedHearingLinkType { get; set; }

    ////Notice
    public DateTime? NoticeGeneratedDate { get; set; }

    ////Claims
    public List<ClaimSearchResult> Claims { get; set; }

    public int Score { get; set; }
}

public class ClaimSearchResult
{
    public byte? ClaimCode { get; set; }
}

public class HearingSearchResult
{
    public DateTime? LocalStartDateTime { get; set; }

    public DateTime? HearingStartDateTime { get; set; }

    public byte? HearingType { get; set; }

    public int? HearingOwner { get; set; }
}