using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Search;
using CM.Common.Utilities;
using CM.Data.Model.Search;
using CM.Data.Repositories.Search;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.Search;

public partial class SearchService : CmServiceBase, ISearchService
{
    private const int MatchedParticipantScore = 2;
    private const int GlobalThresholdScore = 4;

    public SearchService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<FullSearchResponse> GetByFileNumber(FileNumberSearchRequest request)
    {
        var searchResult = await UnitOfWork.SearchRepository.FindByFileNumber(request.FileNumber);
        if (searchResult != null)
        {
            var searchResponse = new FullSearchResponse();
            searchResponse.SearchResponses.AddRange(MapperService.Map<List<SearchResult>, List<SearchResponse>>(searchResult));
            searchResponse.TotalAvailableRecords = searchResult.Count;

            return searchResponse;
        }

        return new FullSearchResponse();
    }

    public async Task<FullSearchResponse> GetByDisputeInfo(DisputeInfoSearchRequest request, int count, int index)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var searchResultRequest = MapperService.Map<DisputeInfoSearchRequest, DisputeInfoSearchResultRequest>(request);
        var sort = new SearchResultSortRequest { SortByField = searchResultRequest.SortByField, SortDirection = searchResultRequest.SortDirection };

        var queryString = SearchQueryBuilder.GenerateDisputeInfoQuery(request);

        var searchResult = await UnitOfWork.SearchRepository.FindByQuery(queryString, sort, index, count);
        var totalCount = await UnitOfWork.SearchRepository.GetQueryResultCount(queryString);

        if (searchResult != null)
        {
            var searchResponse = new FullSearchResponse
            {
                TotalAvailableRecords = totalCount,
                SearchResponses = new List<SearchResponse>(MapperService.Map<List<SearchResult>, List<SearchResponse>>(searchResult))
            };
            return searchResponse;
        }

        return null;
    }

    public async Task<FullSearchResponse> GetByAccessCode(AccessCodeSearchRequest request)
    {
        var searchResult = await UnitOfWork.SearchRepository.FindByAccessCode(request.AccessCode);
        if (searchResult != null)
        {
            var searchResponse = new FullSearchResponse
            {
                TotalAvailableRecords = searchResult.Count,
                SearchResponses = new List<SearchResponse>(MapperService.Map<List<SearchResult>, List<SearchResponse>>(searchResult))
            };

            return searchResponse;
        }

        return null;
    }

    public async Task<FullSearchResponse> GetByParticipant(ParticipantSearchRequest request, int count, int index)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var searchResultRequest = MapperService.Map<ParticipantSearchRequest, ParticipantSearchResultRequest>(request);
        var sort = new SearchResultSortRequest { SortByField = searchResultRequest.SortByField, SortDirection = searchResultRequest.SortDirection };

        if (!string.IsNullOrWhiteSpace(request.AllPhone))
        {
            request.AllPhone = request.AllPhone.GetPhoneNumber();
        }

        var queryString = SearchQueryBuilder.GenerateParticipantQuery(request);

        var searchResult = await UnitOfWork.SearchRepository.FindByQuery(queryString, sort, index, count);
        var totalCount = await UnitOfWork.SearchRepository.GetQueryResultCount(queryString);

        if (searchResult != null)
        {
            var searchResponse = new FullSearchResponse
            {
                TotalAvailableRecords = totalCount,
                SearchResponses = new List<SearchResponse>(MapperService.Map<List<SearchResult>, List<SearchResponse>>(searchResult))
            };
            return searchResponse;
        }

        return null;
    }

    public async Task<FullSearchResponse> GetByDisputeStatus(DisputeStatusSearchRequest request, int count, int index)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var searchResultRequest = MapperService.Map<DisputeStatusSearchRequest, DisputeStatusSearchResultRequest>(request);
        var sort = new SearchResultSortRequest { SortByField = searchResultRequest.SortByField, SortDirection = searchResultRequest.SortDirection };

        var queryString = SearchQueryBuilder.GenerateDisputeStatusQuery(request);

        var searchResult = await UnitOfWork.SearchRepository.FindByQuery(queryString, sort, index, count);
        var totalCount = await UnitOfWork.SearchRepository.GetQueryResultCount(queryString);

        if (searchResult != null)
        {
            var searchResponse = new FullSearchResponse
            {
                TotalAvailableRecords = totalCount,
                SearchResponses = new List<SearchResponse>(MapperService.Map<List<SearchResult>, List<SearchResponse>>(searchResult))
            };

            return searchResponse;
        }

        return null;
    }

    public async Task<FullSearchResponse> GetByHearing(HearingSearchRequest request, int count, int index)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var searchResultRequest = MapperService.Map<HearingSearchRequest, HearingSearchResultRequest>(request);
        var sort = new SearchResultSortRequest { SortByField = searchResultRequest.SortByField, SortDirection = searchResultRequest.SortDirection };

        var queryString = SearchQueryBuilder.GenerateHearingQuery(request);

        var searchResult = await UnitOfWork.SearchRepository.FindByQuery(queryString, sort, index, count);
        var totalCount = await UnitOfWork.SearchRepository.GetQueryResultCount(queryString);

        if (searchResult != null)
        {
            var searchResponse = new FullSearchResponse
            {
                TotalAvailableRecords = totalCount,
                SearchResponses = new List<SearchResponse>(MapperService.Map<List<SearchResult>, List<SearchResponse>>(searchResult))
            };
            return searchResponse;
        }

        return null;
    }

    public async Task<FullSearchResponse> GetByCrossApplication(CrossApplicationSearchRequest request, int count, int index)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var sourceDisputeRequest = await GetCrossAppSourceDisputeRequest(request);
        if (sourceDisputeRequest == null)
        {
            return null;
        }

        var disputes = await FindCrossAppDestinationDisputes(sourceDisputeRequest);
        if (!disputes.Any())
        {
            return null;
        }

        var searchResults = new List<SearchResult>();
        var sourceParticipants = await FindCrossAppSourceParticipants(request);

        foreach (var dispute in disputes)
        {
            dispute.Score += SearchScoreCalculator.GetDisputeMatchScore(dispute, sourceDisputeRequest);

            var participantMatchingEntity = await FindCrossAppSourceParticipants(dispute.DisputeGuid, sourceParticipants, MatchedParticipantScore);
            dispute.Score += participantMatchingEntity.ParticipantIndividualScore;

            var threshold = request.CrossThreshold ?? GlobalThresholdScore;

            if (dispute.Score >= threshold)
            {
                searchResults.Add(dispute);
            }
        }

        var searchResponses = MapperService.Map<List<SearchResult>, List<CrossApplicationSearchResponse>>(searchResults);
        foreach (var crossApplicationSearchResponse in searchResponses)
        {
            var resultHearing = searchResults
                .SingleOrDefault(s => s.DisputeGuid == crossApplicationSearchResponse.DisputeGuid)?.Hearing;

            if (resultHearing == null)
            {
                continue;
            }

            if (resultHearing.HearingOwner != null)
            {
                crossApplicationSearchResponse.HearingOwner = (int)resultHearing.HearingOwner;
            }

            if (resultHearing.HearingType != null)
            {
                crossApplicationSearchResponse.HearingType = (byte)resultHearing.HearingType;
            }

            crossApplicationSearchResponse.HearingStartDateTime = resultHearing.HearingStartDateTime.ToCmDateTimeString();
            crossApplicationSearchResponse.LocalStartDateTime = resultHearing.LocalStartDateTime.ToCmDateTimeString();
        }

        searchResponses.RemoveAll(s => s.DisputeGuid == request.DisputeGuid);
        var totalCount = searchResponses.Count;
        searchResponses = await searchResponses
            .OrderByDescending(s => s.Score)
            .ApplyPagingArrayStyleAsync(count, index);

        var fullResponse = new FullSearchResponse();
        fullResponse.SearchResponses.AddRange(searchResponses);
        fullResponse.TotalAvailableRecords = totalCount;

        return fullResponse;
    }

    public async Task<FullSearchResponse> GetByClaims(ClaimsSearchRequest request, int count, int index)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var searchResultRequest = MapperService.Map<ClaimsSearchRequest, ClaimsSearchResultRequest>(request);
        var sort = new SearchResultSortRequest { SortByField = searchResultRequest.SortByField, SortDirection = searchResultRequest.SortDirection };

        var queryString = SearchQueryBuilder.GenerateClaimsQuery(request);

        var searchResult = await UnitOfWork.SearchRepository.FindByQuery(queryString, sort, index, count);
        var totalCount = await UnitOfWork.SearchRepository.GetQueryResultCount(queryString);

        if (searchResult != null)
        {
            var searchResponse = new FullSearchResponse
            {
                TotalAvailableRecords = totalCount,
                SearchResponses = new List<SearchResponse>(MapperService.Map<List<SearchResult>, List<SearchResponse>>(searchResult))
            };
            return searchResponse;
        }

        return null;
    }

    public async Task<ValidateFilenumberResponse> ValidateFileNumber(int filenumber, string token)
    {
        var dispute = await UnitOfWork.DisputeRepository.GetDisputeByFileNumber(filenumber);
        var result = new ValidateFilenumberResponse() { Validated = dispute != null };

        if (!string.IsNullOrEmpty(token))
        {
            var userToken = await UnitOfWork.TokenRepository.GetTokenAsync(token);

            var userId = userToken != null ? userToken.SystemUserId : null;
            if (userId != null)
            {
                var user = await UnitOfWork.SystemUserRepository.GetByIdAsync(userId.Value);
                if (user != null && user.SystemUserRoleId == (int)Roles.StaffUser)
                {
                    var withGuid = dispute != null;

                    if (withGuid)
                    {
                        result.DisputeGuid = dispute.DisputeGuid;
                    }
                }
            }
        }

        return result;
    }

    public async Task<FullSearchResponse> GetDisputeMessageOwners(DisputeMessageOwnerSearchRequest request, int count, int index)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var queryString = SearchQueryBuilder.GenerateDisputeMessageOwnersQuery(request);

        var searchResult = await UnitOfWork
            .SearchRepository
            .FindByQueryMessageOwners(queryString, index, count);
        var totalCount = await UnitOfWork.SearchRepository.GetQueryResultCount(queryString);

        if (searchResult != null)
        {
            var searchResponse = new FullSearchResponse
            {
                TotalAvailableRecords = totalCount,
                SearchResponses = new List<SearchResponse>(MapperService.Map<List<SearchResult>, List<SearchResponse>>(searchResult))
            };

            return searchResponse;
        }

        return null;
    }

    public async Task<FullSearchResponse> GetDisputeStatusOwners(DisputeStatusOwnerSearchRequest request, int count, int index)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var queryString = SearchQueryBuilder.GenerateDisputeStatusOwnersQuery(request);

        var searchResult = await UnitOfWork
            .SearchRepository
            .FindByQueryStatusOwners(queryString, index, count);
        var totalCount = await UnitOfWork.SearchRepository.GetQueryResultCount(queryString);

        if (searchResult != null)
        {
            var searchResponse = new FullSearchResponse
            {
                TotalAvailableRecords = totalCount,
                SearchResponses = new List<SearchResponse>(MapperService.Map<List<SearchResult>, List<SearchResponse>>(searchResult))
            };

            return searchResponse;
        }

        return null;
    }

    public async Task<FullSearchResponse> GetDisputeNoteOwners(DisputeNoteOwnerSearchRequest request, int count, int index)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var queryString = SearchQueryBuilder.GenerateDisputeNoteOwnersQuery(request);

        var searchResult = await UnitOfWork
            .SearchRepository
            .FindByQueryNoteOwners(queryString, index, count);
        var totalCount = await UnitOfWork.SearchRepository.GetQueryResultCount(queryString);

        if (searchResult != null)
        {
            var searchResponse = new FullSearchResponse
            {
                TotalAvailableRecords = totalCount,
                SearchResponses = new List<SearchResponse>(MapperService.Map<List<SearchResult>, List<SearchResponse>>(searchResult))
            };

            return searchResponse;
        }

        return null;
    }

    public async Task<FullSearchResponse> GetDisputeDocumentOwners(DisputeDocumentOwnerSearchRequest request, int count, int index)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var queryString = SearchQueryBuilder.GenerateDisputeDocumentOwnersQuery(request);

        var searchResult = await UnitOfWork
            .SearchRepository
            .FindByQueryDocumentOwners(queryString, index, count);
        var totalCount = await UnitOfWork.SearchRepository.GetQueryResultCount(queryString);

        if (searchResult != null)
        {
            var searchResponse = new FullSearchResponse
            {
                TotalAvailableRecords = totalCount,
                SearchResponses = new List<SearchResponse>(MapperService.Map<List<SearchResult>, List<SearchResponse>>(searchResult))
            };

            return searchResponse;
        }

        return null;
    }

    public async Task<int> ValidateCreatedBy(int[] createdBy)
    {
        foreach (var userId in createdBy)
        {
            var user = await UnitOfWork.SystemUserRepository.GetAdminUser(userId);
            if (user is not { IsActive: { } })
            {
                return userId;
            }
        }

        return -1;
    }
}