using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Dashboard;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.Dashboard;

public class DashboardService : CmServiceBase, IDashboardService
{
    public DashboardService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<DashboardSearchResponse> GetAssignedHearings(int userId, int count, int index, AssignedHearingsRequest request)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        request.ReturnHearingsAfterDate ??= DateTime.UtcNow.GetCmDateTime();

        var hearings = await UnitOfWork.HearingRepository.GetHearings(userId, request.ReturnHearingsAfterDate.Value, index, count);
        var response = await FillDashboardResponseByHearings(hearings);
        return response;
    }

    public async Task<DashboardSearchResponse> GetUnAssignedHearings(int count, int index, UnAssignedHearingsRequest request)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        request.HearingStartDate ??= DateTime.UtcNow.GetCmDateTime();

        var hearings = await UnitOfWork.HearingRepository.GetHearings(null, request.HearingStartDate.Value, index, count);
        var response = await FillDashboardResponseByHearings(hearings);
        return response;
    }

    public async Task<DashboardSearchResponse> GetAssignedDisputes(int userId, int count, int index, DashboardSearchDisputesRequest request)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var disputeStatuses = await UnitOfWork.DisputeStatusRepository.GetDisputeStatuses(userId, request);
        var resultCount = disputeStatuses.Count;
        var response = await FillDashboardResponseByStatuses(disputeStatuses.AsQueryable().ApplyPaging(count, index).ToList());
        response.TotalAvailableRecords = resultCount;
        return response;
    }

    public async Task<DashboardSearchResponse> GetUnAssignedDisputes(int count, int index, DashboardSearchDisputesRequest request)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var disputeStatuses = await UnitOfWork.DisputeStatusRepository.GetDisputeStatuses(null, request);
        var resultCount = disputeStatuses.Count;
        var response = await FillDashboardResponseByStatuses(disputeStatuses.AsQueryable().ApplyPaging(count, index).ToList());
        response.TotalAvailableRecords = resultCount;
        return response;
    }

    private async Task<DashboardSearchResponse> FillDashboardResponseByHearings(IReadOnlyCollection<Hearing> hearings)
    {
        var response = new DashboardSearchResponse();
        foreach (var hearing in hearings)
        {
            foreach (var disputeHearing in hearing.DisputeHearings)
            {
                Debug.Assert(disputeHearing.DisputeGuid != null, "disputeHearing.DisputeGuid != null");
                var dispute = await UnitOfWork.DisputeRepository.GetNoTrackDisputeByGuidAsync(disputeHearing.DisputeGuid.Value);
                var disputeStatus = dispute.DisputeStatuses.LastOrDefault();
                var applicantsCount = await UnitOfWork.SearchRepository.GetApplicantsCount(dispute.DisputeGuid);
                var respondentsCount = await UnitOfWork.SearchRepository.GetRespondentsCount(dispute.DisputeGuid);
                var disputeFee = await UnitOfWork.DisputeFeeRepository.GetLatestDisputeFee(dispute.DisputeGuid);
                var noticeGenDate = await UnitOfWork.NoticeRepository.GetNoticeGeneratedDate(hearing.HearingId, dispute.DisputeGuid);
                var claimsCodes = await UnitOfWork.ClaimRepository.GetDisputeClaimsCode(dispute.DisputeGuid);
                var dsClaims = claimsCodes.Select(code => new DsClaim { ClaimCode = code }).ToList();

                Debug.Assert(disputeStatus != null, nameof(disputeStatus) + " != null");
                response.Items.Add(new DashboardSearchItemResponse
                {
                    FileNumber = dispute.FileNumber,
                    DisputeGuid = dispute.DisputeGuid,
                    DisputeType = dispute.DisputeType,
                    DisputeSubType = dispute.DisputeSubType,
                    DisputeUrgency = dispute.DisputeUrgency,
                    DisputeComplexity = dispute.DisputeComplexity,
                    TenancyAddress = dispute.TenancyAddress,
                    TenancyZipPostal = dispute.TenancyZipPostal,
                    CrossAppFileNumber = dispute.CrossAppFileNumber,
                    CrossAppDisputeGuid = dispute.CrossAppDisputeGuid,
                    SubmittedDate = dispute.SubmittedDate.ToCmDateTimeString(),
                    CreatedDate = dispute.CreatedDate.ToCmDateTimeString(),
                    ModifiedDate = dispute.ModifiedDate.ToCmDateTimeString(),
                    Status = disputeStatus.Status,
                    Stage = disputeStatus.Stage,
                    Process = disputeStatus.Process,
                    Owner = disputeStatus.Owner,
                    StatusStartDate = disputeStatus.StatusStartDate.ToCmDateTimeString(),
                    TotalApplicants = applicantsCount,
                    TotalRespondents = respondentsCount,
                    IntakePaymentIsPaid = disputeFee?.IsPaid,
                    IntakePaymentDatePaid = disputeFee?.DatePaid.ToCmDateTimeString(),
                    IntakePaymentAmountPaid = disputeFee?.AmountPaid,
                    IntakePaymentAmountPaymentMethod = disputeFee?.MethodPaid,
                    HearingStart = hearing.LocalStartDateTime.ToCmDateTimeString(),
                    HearingType = hearing.HearingType,
                    HearingOwner = hearing.HearingOwner,
                    NoticeGeneratedDate = noticeGenDate.ToCmDateTimeString(),
                    Claims = dsClaims
                });
            }
        }

        response.TotalAvailableRecords = hearings.Count;
        return response;
    }

    private async Task<DashboardSearchResponse> FillDashboardResponseByStatuses(IReadOnlyCollection<DisputeStatus> disputeStatuses)
    {
        var response = new DashboardSearchResponse();
        foreach (var item in disputeStatuses)
        {
            var dispute = await UnitOfWork.DisputeRepository.GetDispute(item.DisputeGuid);
            var applicantsCount = await UnitOfWork.SearchRepository.GetApplicantsCount(dispute.DisputeGuid);
            var respondentsCount = await UnitOfWork.SearchRepository.GetRespondentsCount(dispute.DisputeGuid);
            var disputeFee = await UnitOfWork.DisputeFeeRepository.GetLatestDisputeFee(dispute.DisputeGuid);
            var hearing = await UnitOfWork.HearingRepository.GetLastHearing(item.DisputeGuid);
            var noticeGenDate = hearing != null ? await UnitOfWork.NoticeRepository.GetNoticeGeneratedDate(hearing.HearingId, dispute.DisputeGuid) : null;
            var claimsCodes = await UnitOfWork.ClaimRepository.GetDisputeClaimsCode(dispute.DisputeGuid);
            var dsClaims = claimsCodes.Select(code => new DsClaim { ClaimCode = code }).ToList();

            response.Items.Add(new DashboardSearchDisputeResponse
            {
                FileNumber = dispute.FileNumber,
                DisputeGuid = dispute.DisputeGuid,
                DisputeType = dispute.DisputeType,
                DisputeSubType = dispute.DisputeSubType,
                DisputeUrgency = dispute.DisputeUrgency,
                DisputeComplexity = dispute.DisputeComplexity,
                TenancyAddress = dispute.TenancyAddress,
                TenancyZipPostal = dispute.TenancyZipPostal,
                CrossAppFileNumber = dispute.CrossAppFileNumber,
                CrossAppDisputeGuid = dispute.CrossAppDisputeGuid,
                SubmittedDate = dispute.SubmittedDate.ToCmDateTimeString(),
                CreatedDate = dispute.CreatedDate.ToCmDateTimeString(),
                ModifiedDate = dispute.ModifiedDate.ToCmDateTimeString(),
                DisputeLastModifiedDate = dispute.DisputeLastModified?.LastModifiedDate.ToCmDateTimeString(),
                CreationMethod = dispute.CreationMethod,
                Status = item.Status,
                Stage = item.Stage,
                Process = item.Process,
                Owner = item.Owner,
                StatusStartDate = item.StatusStartDate.ToCmDateTimeString(),
                TotalApplicants = applicantsCount,
                TotalRespondents = respondentsCount,
                IntakePaymentIsPaid = disputeFee?.IsPaid,
                IntakePaymentDatePaid = disputeFee?.DatePaid.ToCmDateTimeString(),
                IntakePaymentAmountPaid = disputeFee?.AmountPaid,
                IntakePaymentAmountPaymentMethod = disputeFee?.MethodPaid,
                HearingStart = hearing != null ? hearing.LocalStartDateTime.ToCmDateTimeString() : string.Empty,
                HearingType = hearing?.HearingType,
                HearingOwner = hearing?.HearingOwner,
                NoticeGeneratedDate = noticeGenDate.ToCmDateTimeString(),
                Claims = dsClaims
            });
        }

        return response;
    }
}