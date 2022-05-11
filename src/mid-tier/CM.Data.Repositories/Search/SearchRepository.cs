using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Model.Search;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Search;

public class SearchRepository : CmRepository<SearchResult>, ISearchRepository
{
    public SearchRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<List<SearchResult>> FindByFileNumber(int fileNumber)
    {
        var dispute = await GetDisputeAsync(fileNumber);
        if (dispute != null)
        {
            return await GetSearchResultList(dispute.DisputeGuid);
        }

        return null;
    }

    public async Task<List<SearchResult>> FindByQuery(string queryString, SearchResultSortRequest sort, int index, int count)
    {
        var disputes = await Context.DisputeStatuses
            .FromSqlRaw(queryString)
            .Select(x => new DisputeSearch
            {
                DisputeGuid = x.DisputeGuid,
                Process = x.Process,
                Owner = x.Owner,
                Stage = x.Stage,
                Status = x.Status,
                StatusStartDate = x.StatusStartDate,
                CreatedDate = x.Dispute.CreatedDate.Value,
                ModifiedDate = x.Dispute.ModifiedDate.Value,
                SubmittedDate = x.Dispute.SubmittedDate.GetValueOrDefault(),
                DisputeLastModifiedDate = x.Dispute.DisputeLastModified.LastModifiedDate
            })
            .ToListAsync();

        var searchResults = await GetSearchResultList(disputes, sort, index, count);
        return searchResults;
    }

    public async Task<List<SearchResult>> FindByQueryStatusOwners(string queryString, int index, int count)
    {
        var disputes = await Context.DisputeStatuses
            .FromSqlRaw(queryString)
            .Select(x => new DisputeSearch
            {
                DisputeGuid = x.DisputeGuid,
                Process = x.Process,
                Owner = x.Owner,
                Stage = x.Stage,
                Status = x.Status,
                StatusStartDate = x.StatusStartDate,
                CreatedDate = x.Dispute.CreatedDate.Value,
                ModifiedDate = x.Dispute.ModifiedDate.Value,
                SubmittedDate = x.Dispute.SubmittedDate.GetValueOrDefault(),
                DisputeLastModifiedDate = x.Dispute.DisputeLastModified.LastModifiedDate
            })
            .ToListAsync();

        disputes = disputes.OrderByDescending(x => x.StatusStartDate).ToList();

        var searchResults = await GetSearchResultListForStatusOwners(disputes, index, count);
        return searchResults;
    }

    public async Task<List<SearchResult>> FindByQueryNoteOwners(string queryString, int index, int count)
    {
        var disputes = await Context.Notes
            .FromSqlRaw(queryString)
            .Select(x => new DisputeNoteOwnersSearch
            {
                DisputeGuid = x.DisputeGuid,
                Process = x.Dispute.DisputeStatuses.FirstOrDefault(d => d.IsActive).Process,
                Owner = x.Dispute.DisputeStatuses.FirstOrDefault(d => d.IsActive).Owner,
                Stage = x.Dispute.DisputeStatuses.FirstOrDefault(d => d.IsActive).Stage,
                Status = x.Dispute.DisputeStatuses.FirstOrDefault(d => d.IsActive).Status,
                StatusStartDate = x.Dispute.DisputeStatuses.FirstOrDefault(d => d.IsActive).StatusStartDate,
                CreatedDate = x.Dispute.CreatedDate.Value,
                ModifiedDate = x.Dispute.ModifiedDate.Value,
                SubmittedDate = x.Dispute.SubmittedDate.GetValueOrDefault(),
                DisputeLastModifiedDate = x.Dispute.DisputeLastModified.LastModifiedDate,
                NoteId = x.NoteId
            })
            .ToListAsync();

        foreach (var item in disputes)
        {
            var note = await Context.Notes.FirstOrDefaultAsync(x => x.NoteId == item.NoteId);
            item.NoteCreatedDate = note.CreatedDate;
        }

        disputes = disputes.OrderByDescending(x => x.NoteCreatedDate).ToList();

        var searchResults = await GetSearchResultListForNoteOwners(disputes, index, count);
        return searchResults;
    }

    public async Task<List<SearchResult>> FindByQueryDocumentOwners(string queryString, int index, int count)
    {
        var disputes = await Context.OutcomeDocFiles
            .FromSqlRaw(queryString)
            .Select(x => new DisputeDocumentOwnersSearch
            {
                DisputeGuid = x.DisputeGuid,
                Process = x.Dispute.DisputeStatuses.FirstOrDefault(d => d.IsActive).Process,
                Owner = x.Dispute.DisputeStatuses.FirstOrDefault(d => d.IsActive).Owner,
                Stage = x.Dispute.DisputeStatuses.FirstOrDefault(d => d.IsActive).Stage,
                Status = x.Dispute.DisputeStatuses.FirstOrDefault(d => d.IsActive).Status,
                StatusStartDate = x.Dispute.DisputeStatuses.FirstOrDefault(d => d.IsActive).StatusStartDate,
                CreatedDate = x.Dispute.CreatedDate.Value,
                ModifiedDate = x.Dispute.ModifiedDate.Value,
                SubmittedDate = x.Dispute.SubmittedDate.GetValueOrDefault(),
                DisputeLastModifiedDate = x.Dispute.DisputeLastModified.LastModifiedDate,
                OutcomeDocFileId = x.OutcomeDocFileId
            })
            .ToListAsync();

        foreach (var item in disputes)
        {
            var outcomeDocFile = await Context.OutcomeDocFiles.FirstOrDefaultAsync(x => x.OutcomeDocFileId == item.OutcomeDocFileId);
            item.FileCreatedDate = outcomeDocFile.CreatedDate;
        }

        disputes = disputes.OrderByDescending(x => x.FileCreatedDate).ToList();

        var searchResults = await GetSearchResultListForDocumentOwners(disputes, index, count);
        return searchResults;
    }

    public async Task<List<SearchResult>> FindByQueryMessageOwners(string queryString, int index, int count)
    {
        var disputes = await Context.EmailMessages
            .FromSqlRaw(queryString)
            .Select(x => new DisputeMessageOwnersSearch
            {
                DisputeGuid = x.DisputeGuid,
                Process = x.Dispute.DisputeStatuses.FirstOrDefault(d => d.IsActive).Process,
                Owner = x.Dispute.DisputeStatuses.FirstOrDefault(d => d.IsActive).Owner,
                Stage = x.Dispute.DisputeStatuses.FirstOrDefault(d => d.IsActive).Stage,
                Status = x.Dispute.DisputeStatuses.FirstOrDefault(d => d.IsActive).Status,
                StatusStartDate = x.Dispute.DisputeStatuses.FirstOrDefault(d => d.IsActive).StatusStartDate,
                CreatedDate = x.Dispute.CreatedDate.Value,
                ModifiedDate = x.Dispute.ModifiedDate.Value,
                SubmittedDate = x.Dispute.SubmittedDate.GetValueOrDefault(),
                DisputeLastModifiedDate = x.Dispute.DisputeLastModified.LastModifiedDate,
                EmailMessageId = x.EmailMessageId
            })
            .ToListAsync();

        foreach (var item in disputes)
        {
            var message = await Context.EmailMessages.FirstOrDefaultAsync(x => x.EmailMessageId == item.EmailMessageId);
            item.MessageCreatedDate = message.CreatedDate;
        }

        disputes = disputes.OrderByDescending(x => x.MessageCreatedDate).ToList();

        var searchResults = await GetSearchResultListForMessageOwners(disputes, index, count);
        return searchResults;
    }

    public async Task<CrossApplicationSourceDispute> FindByQueryCrossAppSourceDispute(string queryString)
    {
        var sourceDisputes = await Context.Disputes
            .FromSqlRaw(queryString)
            .Select(x => new CrossApplicationSourceDispute
            {
                TenancyCitySoundex = x.TenancyCity,
                TenancyZipPostal = x.TenancyZipPostal
            })
            .ToListAsync();

        var sourceDispute = sourceDisputes.FirstOrDefault();
        return sourceDispute;
    }

    public async Task<List<CrossApplicationSourceParticipant>> FindByQueryCrossAppSourceParticipants(string queryString)
    {
        var sourceParticipants = await Context.CrossApplicationParticipants
            .FromSqlRaw(queryString)
            .Select(x => new CrossApplicationSourceParticipant
            {
                ParticipantRole = x.ParticipantRole,
                GroupParticipantRole = x.GroupParticipantRole,
                SoundexBusinessName = x.SoundexBusinessName,
                BusinessName = x.BusinessName,
                BusinessContactFirstName = x.BusinessContactFirstName,
                SoundexBusinessContactFirstName = x.SoundexBusinessContactFirstName,
                BusinessContactLastName = x.BusinessContactLastName,
                SoundexBusinessContactLastName = x.SoundexBusinessContactLastName,
                FirstName = x.FirstName,
                SoundexFirstName = x.SoundexFirstName,
                LastName = x.LastName,
                SoundexLastName = x.SoundexLastName,
                Email = x.Email,
                EmailNormalized = x.EmailNormalized,
                City = x.City,
                SoundexCity = x.SoundexCity,
                PrimaryPhone = x.PrimaryPhoneNormalized,
                PrimaryPhoneNormalized = x.PrimaryPhoneNormalized,
                PostalZip = x.PostalZip,
                PostalZipNormalized = x.PostalZipNormalized
            })
            .ToListAsync();

        return sourceParticipants;
    }

    public async Task<List<SearchResult>> FindByQueryCrossAppDestinationDisputes(string queryString)
    {
        var disputes = await Context.DisputeStatuses
            .FromSqlRaw(queryString)
            .Select(x => new CrossApplicationDestinationDispute
            {
                DisputeGuid = x.DisputeGuid,
                TenancyAddress = x.Dispute.TenancyAddress,
                TenancyCitySoundex = x.Dispute.TenancyCity,
                TenancyZipPostal = x.Dispute.TenancyZipPostal,
                Status = x.Status,
                Stage = x.Stage
            })
            .ToListAsync();

        var searchResults = await GetSearchResultListForCrossApp(disputes);

        return searchResults;
    }

    public async Task<int> GetQueryResultCount(string queryString)
    {
        var count = await Context.Disputes.FromSqlRaw(queryString).CountAsync();
        return count;
    }

    public async Task<List<SearchResult>> FindByAccessCode(string accessCode)
    {
        var searchResults = new List<SearchResult>();
        var disputeGuidResult = await Context.Participants
            .Where(p => p.AccessCode == accessCode)
            .Select(p => p.DisputeGuid)
            .ToListAsync();

        if (disputeGuidResult is { Count: > 0 })
        {
            var disputeGuid = disputeGuidResult.FirstOrDefault();
            var dispute = await GetDisputeAsync(disputeGuid);
            var disputeStatuses = await GetLastDisputeStatusAsync(disputeGuid);
            var applicantsCount = await GetApplicantsCount(disputeGuid);
            var respondentsCount = await GetRespondentsCount(disputeGuid);
            var primaryApplicant = await GetPrimaryApplicantInfoAsync(disputeGuid);
            var disputeFee = await GetDisputeFee(disputeGuid);
            var hearings = await GetLastHearing(disputeGuid);
            var noticeGeneratedDate = await GetLatestNoticeGeneratedDate(disputeGuid);
            var claimResult = await GetClaimCodes(disputeGuid);
            var searchResult = SearchResultMapper.ToSearchResult(dispute, disputeStatuses, applicantsCount, respondentsCount, disputeFee, primaryApplicant, hearings, noticeGeneratedDate, claimResult);
            searchResults.Add(searchResult);
            return searchResults;
        }

        return null;
    }

    public async Task<int> GetApplicantsCount(Guid disputeGuid)
    {
        var applicantsCount = await Context.ClaimGroupParticipants
            .Include(x => x.ClaimGroup)
            .Where(x => x.GroupParticipantRole == (byte)ParticipantRole.Applicant)
            .CountAsync(x => x.ClaimGroup.DisputeGuid == disputeGuid);

        return applicantsCount;
    }

    public async Task<int> GetRespondentsCount(Guid disputeGuid)
    {
        var respondentsCount = await Context.ClaimGroupParticipants
            .Include(x => x.ClaimGroup)
            .Where(x => x.GroupParticipantRole == (byte)ParticipantRole.Respondent)
            .CountAsync(x => x.ClaimGroup.DisputeGuid == disputeGuid);

        return respondentsCount;
    }

    private static IEnumerable<DisputeSearch> SortByField(List<DisputeSearch> result, int? sortByField, SortDir sortDirection)
    {
        switch (sortByField)
        {
            case (int?)SearchSortField.Submitted:
                result = result.OrderBy(d => d.SubmittedDate).ToList();
                break;
            case (int?)SearchSortField.Created:
                result = result.OrderBy(d => d.CreatedDate).ToList();
                break;
            case (int?)SearchSortField.Modified:
                result = result.OrderBy(d => d.DisputeLastModifiedDate).ToList();
                break;
            case (int?)SearchSortField.Status:
                result = result.OrderBy(d => d.StatusStartDate).ToList();
                break;
            case (int?)SearchSortField.None:
                return result;
            default:
                return result.OrderBy(d => d.SubmittedDate).ToList();
        }

        if (sortDirection == SortDir.Desc)
        {
            result.Reverse();
        }

        return result;
    }

    private async Task<Model.Dispute> GetDisputeAsync(Guid disputeGuid)
    {
        var dispute = await Context.Disputes.Where(d => d.DisputeGuid == disputeGuid)
            .Select(d => new Model.Dispute
            {
                FileNumber = d.FileNumber,
                DisputeGuid = d.DisputeGuid,
                DisputeType = d.DisputeType,
                DisputeSubType = d.DisputeSubType,
                DisputeUrgency = d.DisputeUrgency,
                DisputeComplexity = d.DisputeComplexity,
                CreationMethod = d.CreationMethod,
                TenancyCity = d.TenancyCity,
                TenancyAddress = d.TenancyAddress,
                TenancyZipPostal = d.TenancyZipPostal,
                CrossAppFileNumber = d.CrossAppFileNumber,
                CrossAppDisputeGuid = d.CrossAppDisputeGuid,
                SubmittedDate = d.SubmittedDate,
                CreatedDate = d.CreatedDate,
                ModifiedDate = d.ModifiedDate,
                DisputeLastModified = d.DisputeLastModified
            }).ToListAsync();

        return dispute.FirstOrDefault();
    }

    private async Task<Model.Dispute> GetDisputeAsync(int fileNumber)
    {
        var dispute = await Context.Disputes.Include(x => x.DisputeLastModified).Where(d => d.FileNumber == fileNumber).Select(d => new Model.Dispute
        {
            FileNumber = d.FileNumber,
            DisputeGuid = d.DisputeGuid,
            DisputeType = d.DisputeType,
            DisputeSubType = d.DisputeSubType,
            DisputeUrgency = d.DisputeUrgency,
            TenancyAddress = d.TenancyAddress,
            TenancyZipPostal = d.TenancyZipPostal,
            CrossAppFileNumber = d.CrossAppFileNumber,
            CrossAppDisputeGuid = d.CrossAppDisputeGuid,
            SubmittedDate = d.SubmittedDate,
            CreatedDate = d.CreatedDate,
            ModifiedDate = d.ModifiedDate,
            DisputeLastModified = d.DisputeLastModified
        }).ToListAsync();

        return dispute.SingleOrDefault();
    }

    private async Task<Model.DisputeStatus> GetLastDisputeStatusAsync(Guid disputeGuid)
    {
        var statuses = await Context.DisputeStatuses
            .Where(d => d.DisputeGuid == disputeGuid)
            .Select(d => new Model.DisputeStatus
            {
                Status = d.Status,
                Stage = d.Stage,
                StatusStartDate = d.StatusStartDate,
                StatusSetBy = d.StatusSetBy,
                Process = d.Process,
                Owner = d.Owner
            }).ToListAsync();

        return statuses?.OrderBy(d => d.StatusStartDate).LastOrDefault();
    }

    private async Task<Participant> GetPrimaryApplicantInfoAsync(Guid disputeGuid)
    {
        var primaryApplicantId = 0;

        var claimGroups = await Context.ClaimGroups
            .Where(d => d.DisputeGuid == disputeGuid)
            .Include(c => c.ClaimGroupParticipants)
            .ToListAsync();

        foreach (var claimGroup in claimGroups)
        {
            foreach (var claimGroupParticipant in claimGroup.ClaimGroupParticipants)
            {
                if (claimGroupParticipant.ParticipantId == claimGroupParticipant.GroupPrimaryContactId &&
                    claimGroupParticipant.GroupParticipantRole == (int)ParticipantRole.Applicant)
                {
                    primaryApplicantId = claimGroupParticipant.ParticipantId;
                }
            }
        }

        var applicants = await Context.Participants.Where(p => p.ParticipantId == primaryApplicantId)
            .Select(p => new Participant
            {
                ParticipantType = p.ParticipantType,
                BusinessName = p.BusinessName,
                BusinessContactFirstName = p.BusinessContactFirstName,
                BusinessContactLastName = p.BusinessContactLastName,
                FirstName = p.FirstName,
                LastName = p.LastName
            }).ToListAsync();

        var primaryApplicant = applicants?.LastOrDefault();
        return primaryApplicant;
    }

    private async Task<DisputeFee> GetDisputeFee(Guid disputeGuid)
    {
        var disputeFees = await Context.DisputeFees
            .Where(ds => ds.DisputeGuid == disputeGuid)
            .Select(d => new DisputeFee
            {
                AmountPaid = d.AmountPaid,
                IsPaid = d.IsPaid,
                MethodPaid = d.MethodPaid,
                DatePaid = d.DatePaid
            }).ToListAsync();

        var lastDisputeFee = disputeFees?.OrderBy(d => d.ModifiedDate).LastOrDefault();
        return lastDisputeFee;
    }

    private async Task<Hearing> GetLastHearing(Guid disputeGuid)
    {
        var lastHearing = await Context.DisputeHearings
            .Include(d => d.Hearing)
            .Where(d => d.DisputeGuid == disputeGuid && d.DisputeHearingStatus == (byte)DisputeHearingStatus.Active)
            .Select(x => x.Hearing)
            .OrderByDescending(x => x.HearingStartDateTime)
            .FirstOrDefaultAsync();

        if (lastHearing != null)
        {
            lastHearing.DisputeHearings = await GetDisputeHearings(disputeGuid, lastHearing.HearingId);
        }

        return lastHearing;
    }

    private async Task<List<Model.DisputeHearing>> GetDisputeHearings(Guid disputeGuid, int hearingId)
    {
        var disputeHearings = await Context.DisputeHearings.Where(x => x.DisputeGuid == disputeGuid && x.HearingId == hearingId).ToListAsync();
        return disputeHearings;
    }

    private async Task<DateTime?> GetLatestNoticeGeneratedDate(Guid disputeGuid)
    {
        var latestNotice = await Context.Notices
            .Where(x => x.DisputeGuid == disputeGuid)
            .OrderByDescending(x => x.NoticeId)
            .FirstOrDefaultAsync();

        return latestNotice?.CreatedDate;
    }

    private async Task<List<ClaimSearchResult>> GetClaimCodes(Guid disputeGuid)
    {
        var claimResult = new List<ClaimSearchResult>();

        var claimGroupIds = await Context.ClaimGroups
            .Where(c => c.DisputeGuid == disputeGuid)
            .Select(c => c.ClaimGroupId)
            .ToListAsync();

        if (claimGroupIds != null)
        {
            foreach (var groupId in claimGroupIds)
            {
                var groupClaimCodes = await Context.Claims
                    .Where(c => c.ClaimGroupId == groupId && c.ClaimStatus != (byte)ClaimStatus.Deleted && c.ClaimStatus != (byte)ClaimStatus.Removed)
                    .Select(c => c.ClaimCode)
                    .ToListAsync();

                if (groupClaimCodes != null)
                {
                    claimResult.AddRange(groupClaimCodes.Select(groupClaimCode => new ClaimSearchResult { ClaimCode = groupClaimCode }));
                }
            }

            return claimResult;
        }

        return null;
    }

    private async Task<List<SearchResult>> GetSearchResultList(Guid disputeGuid)
    {
        var searchResults = new List<SearchResult>();

        var dispute = await GetDisputeAsync(disputeGuid);
        var disputeStatus = await GetLastDisputeStatusAsync(disputeGuid);
        var applicantsCount = await GetApplicantsCount(disputeGuid);
        var respondentsCount = await GetRespondentsCount(disputeGuid);
        var primaryApplicant = await GetPrimaryApplicantInfoAsync(disputeGuid);
        var disputeFee = await GetDisputeFee(disputeGuid);
        var hearings = await GetLastHearing(disputeGuid);
        var noticeGeneratedDate = await GetLatestNoticeGeneratedDate(disputeGuid);
        var claimResult = await GetClaimCodes(disputeGuid);
        var searchResult = SearchResultMapper.ToSearchResult(dispute, disputeStatus, applicantsCount, respondentsCount, disputeFee, primaryApplicant, hearings, noticeGeneratedDate, claimResult);
        searchResults.Add(searchResult);

        return searchResults;
    }

    private async Task<List<SearchResult>> GetSearchResultList(List<DisputeSearch> disputes, SearchResultSortRequest sort, int index = 0, int count = Pagination.DefaultPageSize)
    {
        var searchResults = new List<SearchResult>();

        disputes = SortByField(disputes, sort.SortByField, sort.SortDirection).AsQueryable().ApplyPagingArrayStyle(count, index).ToList();

        foreach (var item in disputes)
        {
            var disputeGuid = item.DisputeGuid;
            var dispute = await GetDisputeAsync(disputeGuid);
            var applicantsCount = await GetApplicantsCount(disputeGuid);
            var respondentsCount = await GetRespondentsCount(disputeGuid);
            var primaryApplicant = await GetPrimaryApplicantInfoAsync(disputeGuid);
            var disputeFee = await GetDisputeFee(disputeGuid);
            var hearings = await GetLastHearing(disputeGuid);
            var noticeGeneratedDate = await GetLatestNoticeGeneratedDate(disputeGuid);
            var claimResult = await GetClaimCodes(disputeGuid);
            var searchResult = SearchResultMapper.ToSearchResult(dispute, item, applicantsCount, respondentsCount, disputeFee, primaryApplicant, hearings, noticeGeneratedDate, claimResult);
            searchResults.Add(searchResult);
        }

        return searchResults;
    }

    private async Task<List<SearchResult>> GetSearchResultListForCrossApp(List<CrossApplicationDestinationDispute> disputes)
    {
        var searchResults = new List<SearchResult>();

        foreach (var item in disputes)
        {
            var disputeGuid = item.DisputeGuid;
            var dispute = await GetDisputeAsync(disputeGuid);
            dispute.TenancyCity = item.TenancyCitySoundex;
            var applicantsCount = await GetApplicantsCount(disputeGuid);
            var respondentsCount = await GetRespondentsCount(disputeGuid);
            var primaryApplicant = await GetPrimaryApplicantInfoAsync(disputeGuid);
            var disputeFee = await GetDisputeFee(disputeGuid);
            var hearings = await GetLastHearing(disputeGuid);
            var noticeGeneratedDate = await GetLatestNoticeGeneratedDate(disputeGuid);
            var claimResult = await GetClaimCodes(disputeGuid);
            var searchResult = SearchResultMapper.ToSearchResult(dispute, item, applicantsCount, respondentsCount, disputeFee, primaryApplicant, hearings, noticeGeneratedDate, claimResult);
            searchResults.Add(searchResult);
        }

        return searchResults;
    }

    private async Task<List<SearchResult>> GetSearchResultListForStatusOwners(List<DisputeSearch> disputes, int index = 0, int count = Pagination.DefaultPageSize)
    {
        var searchResults = new List<SearchResult>();

        disputes = disputes.AsQueryable().ApplyPagingArrayStyle(count, index).ToList();

        foreach (var item in disputes)
        {
            var disputeGuid = item.DisputeGuid;
            var dispute = await GetDisputeAsync(disputeGuid);
            var applicantsCount = await GetApplicantsCount(disputeGuid);
            var respondentsCount = await GetRespondentsCount(disputeGuid);
            var primaryApplicant = await GetPrimaryApplicantInfoAsync(disputeGuid);
            var disputeFee = await GetDisputeFee(disputeGuid);
            var hearings = await GetLastHearing(disputeGuid);
            var noticeGeneratedDate = await GetLatestNoticeGeneratedDate(disputeGuid);
            var claimResult = await GetClaimCodes(disputeGuid);
            var searchResult = SearchResultMapper.ToSearchResult(dispute, item, applicantsCount, respondentsCount, disputeFee, primaryApplicant, hearings, noticeGeneratedDate, claimResult);
            searchResults.Add(searchResult);
        }

        return searchResults;
    }

    private async Task<List<SearchResult>> GetSearchResultListForNoteOwners(List<DisputeNoteOwnersSearch> disputes, int index = 0, int count = Pagination.DefaultPageSize)
    {
        var searchResults = new List<SearchResult>();

        disputes = disputes.AsQueryable().ApplyPagingArrayStyle(count, index).ToList();

        foreach (var item in disputes)
        {
            var disputeGuid = item.DisputeGuid;
            var dispute = await GetDisputeAsync(disputeGuid);
            var applicantsCount = await GetApplicantsCount(disputeGuid);
            var respondentsCount = await GetRespondentsCount(disputeGuid);
            var primaryApplicant = await GetPrimaryApplicantInfoAsync(disputeGuid);
            var disputeFee = await GetDisputeFee(disputeGuid);
            var hearings = await GetLastHearing(disputeGuid);
            var noticeGeneratedDate = await GetLatestNoticeGeneratedDate(disputeGuid);
            var claimResult = await GetClaimCodes(disputeGuid);
            var searchResult = SearchResultMapper.ToSearchResult(dispute, item, applicantsCount, respondentsCount, disputeFee, primaryApplicant, hearings, noticeGeneratedDate, claimResult);
            searchResults.Add(searchResult);
        }

        return searchResults;
    }

    private async Task<List<SearchResult>> GetSearchResultListForMessageOwners(List<DisputeMessageOwnersSearch> disputes, int index = 0, int count = Pagination.DefaultPageSize)
    {
        var searchResults = new List<SearchResult>();

        disputes = disputes.AsQueryable().ApplyPagingArrayStyle(count, index).ToList();

        foreach (var item in disputes)
        {
            var disputeGuid = item.DisputeGuid;
            var dispute = await GetDisputeAsync(disputeGuid);
            var applicantsCount = await GetApplicantsCount(disputeGuid);
            var respondentsCount = await GetRespondentsCount(disputeGuid);
            var primaryApplicant = await GetPrimaryApplicantInfoAsync(disputeGuid);
            var disputeFee = await GetDisputeFee(disputeGuid);
            var hearings = await GetLastHearing(disputeGuid);
            var noticeGeneratedDate = await GetLatestNoticeGeneratedDate(disputeGuid);
            var claimResult = await GetClaimCodes(disputeGuid);
            var searchResult = SearchResultMapper.ToSearchResult(dispute, item, applicantsCount, respondentsCount, disputeFee, primaryApplicant, hearings, noticeGeneratedDate, claimResult);
            searchResults.Add(searchResult);
        }

        return searchResults;
    }

    private async Task<List<SearchResult>> GetSearchResultListForDocumentOwners(List<DisputeDocumentOwnersSearch> disputes, int index = 0, int count = Pagination.DefaultPageSize)
    {
        var searchResults = new List<SearchResult>();

        disputes = disputes.AsQueryable().ApplyPagingArrayStyle(count, index).ToList();

        foreach (var item in disputes)
        {
            var disputeGuid = item.DisputeGuid;
            var dispute = await GetDisputeAsync(disputeGuid);
            var applicantsCount = await GetApplicantsCount(disputeGuid);
            var respondentsCount = await GetRespondentsCount(disputeGuid);
            var primaryApplicant = await GetPrimaryApplicantInfoAsync(disputeGuid);
            var disputeFee = await GetDisputeFee(disputeGuid);
            var hearings = await GetLastHearing(disputeGuid);
            var noticeGeneratedDate = await GetLatestNoticeGeneratedDate(disputeGuid);
            var claimResult = await GetClaimCodes(disputeGuid);
            var searchResult = SearchResultMapper.ToSearchResult(dispute, item, applicantsCount, respondentsCount, disputeFee, primaryApplicant, hearings, noticeGeneratedDate, claimResult);
            searchResults.Add(searchResult);
        }

        return searchResults;
    }
}