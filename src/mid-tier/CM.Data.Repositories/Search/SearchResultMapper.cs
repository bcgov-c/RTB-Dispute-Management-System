using System;
using System.Collections.Generic;
using System.Linq;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Model.Search;

namespace CM.Data.Repositories.Search;

public static class SearchResultMapper
{
    public static SearchResult ToSearchResult(
        Model.Dispute dispute = null,
        Model.DisputeStatus disputeStatus = null,
        int? applicantsCount = null,
        int? respondentsCount = null,
        DisputeFee disputeFee = null,
        Participant participant = null,
        Hearing hearing = null,
        DateTime? noticeGeneratedDate = null,
        List<ClaimSearchResult> claimResult = null)
    {
        var searchResult = new SearchResult();
        if (dispute != null)
        {
            searchResult.FileNumber = dispute.FileNumber;
            searchResult.DisputeGuid = dispute.DisputeGuid;
            searchResult.DisputeType = dispute.DisputeType;
            searchResult.DisputeSubType = dispute.DisputeSubType;
            searchResult.DisputeUrgency = dispute.DisputeUrgency;
            searchResult.DisputeComplexity = (byte?)dispute.DisputeComplexity;
            searchResult.CreationMethod = dispute.CreationMethod;
            searchResult.TenancyAddress = dispute.TenancyAddress;
            searchResult.TenancyZipPostal = dispute.TenancyZipPostal;
            searchResult.SubmittedDate = dispute.SubmittedDate;
            searchResult.CreatedDate = dispute.CreatedDate;
            searchResult.ModifiedDate = dispute.ModifiedDate;
            searchResult.DisputeLastModifiedDate = dispute.DisputeLastModified?.LastModifiedDate;
        }

        if (disputeStatus != null)
        {
            searchResult.Status = disputeStatus.Status;
            searchResult.Stage = disputeStatus.Stage;
            searchResult.Process = disputeStatus.Process;
            searchResult.Owner = disputeStatus.Owner;
            searchResult.StatusStartDate = disputeStatus.StatusStartDate;
        }

        if (applicantsCount != null)
        {
            searchResult.TotalApplicants = (int)applicantsCount;
        }

        if (respondentsCount != null)
        {
            searchResult.TotalRespondents = (int)respondentsCount;
        }

        if (participant != null)
        {
            searchResult.ParticipantType = participant.ParticipantType;
            searchResult.BusinessName = participant.BusinessName;
            searchResult.BusinessContactFirstName = participant.BusinessContactFirstName;
            searchResult.BusinessContactLastName = participant.BusinessContactLastName;
            searchResult.FirstName = participant.FirstName;
            searchResult.LastName = participant.LastName;
        }

        if (disputeFee != null)
        {
            searchResult.IntakePaymentIsPaid = disputeFee.IsPaid;
            searchResult.IntakePaymentAmountPaid = disputeFee.AmountPaid;
            searchResult.IntakePaymentDatePaid = disputeFee.DatePaid;
            searchResult.IntakePaymentAmountPaymentMethod = disputeFee.MethodPaid;
        }

        var searchResultHearing = new HearingSearchResult();
        if (hearing != null)
        {
            searchResultHearing.HearingOwner = hearing.HearingOwner;
            searchResultHearing.HearingType = hearing.HearingType;
            searchResultHearing.LocalStartDateTime = hearing.LocalStartDateTime;
            searchResultHearing.HearingStartDateTime = hearing.HearingStartDateTime;
            searchResult.Hearing = searchResultHearing;

            if (dispute != null)
            {
                var disputeHearing = hearing.DisputeHearings.FirstOrDefault(
                    x => x.DisputeHearingStatus == (byte)DisputeHearingStatus.Active &&
                         x.DisputeGuid == dispute.DisputeGuid);
                searchResult.SharedHearingLinkType = disputeHearing?.SharedHearingLinkType;
            }
        }

        if (noticeGeneratedDate != null)
        {
            searchResult.NoticeGeneratedDate = noticeGeneratedDate.Value;
        }

        if (claimResult != null)
        {
            searchResult.Claims = claimResult;
        }

        return searchResult;
    }

    public static SearchResult ToSearchResult(
        Model.Dispute dispute = null,
        DisputeSearch disputeStatus = null,
        int? applicantsCount = null,
        int? respondentsCount = null,
        DisputeFee disputeFee = null,
        Participant participant = null,
        Hearing hearing = null,
        DateTime? noticeGeneratedDate = null,
        List<ClaimSearchResult> claimResult = null)
    {
        var searchResult = new SearchResult();
        if (dispute != null)
        {
            searchResult.FileNumber = dispute.FileNumber;
            searchResult.DisputeGuid = dispute.DisputeGuid;
            searchResult.DisputeType = dispute.DisputeType;
            searchResult.DisputeSubType = dispute.DisputeSubType;
            searchResult.DisputeUrgency = dispute.DisputeUrgency;
            searchResult.DisputeComplexity = (byte?)dispute.DisputeComplexity;
            searchResult.CreationMethod = dispute.CreationMethod;
            searchResult.TenancyAddress = dispute.TenancyAddress;
            searchResult.TenancyZipPostal = dispute.TenancyZipPostal;
            searchResult.TenancyCity = dispute.TenancyCity;
            searchResult.SubmittedDate = dispute.SubmittedDate;
            searchResult.CreatedDate = dispute.CreatedDate;
            searchResult.ModifiedDate = dispute.ModifiedDate;
            searchResult.DisputeLastModifiedDate = dispute.DisputeLastModified?.LastModifiedDate;
        }

        if (disputeStatus != null)
        {
            searchResult.Status = disputeStatus.Status;
            searchResult.Stage = disputeStatus.Stage;
            searchResult.Process = disputeStatus.Process;
            searchResult.Owner = disputeStatus.Owner;
            searchResult.StatusStartDate = disputeStatus.StatusStartDate;
        }

        if (applicantsCount != null)
        {
            searchResult.TotalApplicants = (int)applicantsCount;
        }

        if (respondentsCount != null)
        {
            searchResult.TotalRespondents = (int)respondentsCount;
        }

        if (participant != null)
        {
            searchResult.ParticipantType = participant.ParticipantType;
            searchResult.BusinessName = participant.BusinessName;
            searchResult.BusinessContactFirstName = participant.BusinessContactFirstName;
            searchResult.BusinessContactLastName = participant.BusinessContactLastName;
            searchResult.FirstName = participant.FirstName;
            searchResult.LastName = participant.LastName;
        }

        if (disputeFee != null)
        {
            searchResult.IntakePaymentIsPaid = disputeFee.IsPaid;
            searchResult.IntakePaymentAmountPaid = disputeFee.AmountPaid;
            searchResult.IntakePaymentDatePaid = disputeFee.DatePaid;
            searchResult.IntakePaymentAmountPaymentMethod = disputeFee.MethodPaid;
        }

        var searchResultHearing = new HearingSearchResult();
        if (hearing != null)
        {
            searchResultHearing.HearingOwner = hearing.HearingOwner;
            searchResultHearing.HearingType = hearing.HearingType;
            searchResultHearing.LocalStartDateTime = hearing.LocalStartDateTime;
            searchResultHearing.HearingStartDateTime = hearing.HearingStartDateTime;
            searchResult.Hearing = searchResultHearing;

            if (dispute != null)
            {
                var disputeHearing = hearing.DisputeHearings.FirstOrDefault(
                    x => x.DisputeHearingStatus == (byte)DisputeHearingStatus.Active &&
                         x.DisputeGuid == dispute.DisputeGuid);
                searchResult.SharedHearingLinkType = disputeHearing?.SharedHearingLinkType;
            }
        }

        if (noticeGeneratedDate != null)
        {
            searchResult.NoticeGeneratedDate = noticeGeneratedDate.Value;
        }

        if (claimResult != null)
        {
            searchResult.Claims = claimResult;
        }

        return searchResult;
    }
}