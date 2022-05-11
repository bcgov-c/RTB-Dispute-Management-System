using System;
using System.Collections.Generic;
using CM.Business.Entities.Models.Search;
using CM.Data.Model.Search;
using CM.Data.Repositories.Search;

namespace CM.Business.Services.Search;

public partial class SearchService
{
    private async System.Threading.Tasks.Task<CrossApplicationSourceDisputeRequest> GetCrossAppSourceDisputeRequest(CrossApplicationSearchRequest request)
    {
        var sourceDisputeQuery = SearchQueryBuilder.GenerateCrossApplicationQueryForSourceDispute(request);
        var crossApplicationSourceDispute = await UnitOfWork.SearchRepository.FindByQueryCrossAppSourceDispute(sourceDisputeQuery);

        if (crossApplicationSourceDispute == null)
        {
            return null;
        }

        var sourceDisputeRequest = MapperService.Map<SearchRequestBase, CrossApplicationSourceDisputeRequest>(request);
        sourceDisputeRequest.TenancyAddress = request.TenancyAddress;
        sourceDisputeRequest.TenancyCitySoundex = crossApplicationSourceDispute.TenancyCitySoundex;
        sourceDisputeRequest.TenancyZipPostal = crossApplicationSourceDispute.TenancyZipPostal;
        sourceDisputeRequest.HearingAfterDays = request.HearingAfterDays;

        return sourceDisputeRequest;
    }

    private async System.Threading.Tasks.Task<List<CrossApplicationSourceParticipant>> FindCrossAppSourceParticipants(CrossApplicationSearchRequest request)
    {
        var sourceParticipantsQuery = SearchQueryBuilder.GenerateCrossApplicationQueryForSourceParticipants(request.DisputeGuid);
        return await UnitOfWork.SearchRepository.FindByQueryCrossAppSourceParticipants(sourceParticipantsQuery);
    }

    private async System.Threading.Tasks.Task<List<SearchResult>> FindCrossAppDestinationDisputes(CrossApplicationSourceDisputeRequest sourceDisputeRequest)
    {
        var destinationDisputesQuery = SearchQueryBuilder.GenerateCrossApplicationQueryForDestinationDisputes(sourceDisputeRequest);
        return await UnitOfWork.SearchRepository.FindByQueryCrossAppDestinationDisputes(destinationDisputesQuery);
    }

    private async System.Threading.Tasks.Task<ParticipantMatchingEntity> FindCrossAppSourceParticipants(Guid disputeGuid, IEnumerable<CrossApplicationSourceParticipant> requestParticipants, int threshold)
    {
        var participantsQuery = SearchQueryBuilder.GenerateCrossApplicationQueryForSourceParticipants(disputeGuid);
        var disputeParticipants = await UnitOfWork.SearchRepository.FindByQueryCrossAppSourceParticipants(participantsQuery);
        return SearchScoreCalculator.CompareParticipantsByScore(requestParticipants, disputeParticipants, threshold);
    }
}