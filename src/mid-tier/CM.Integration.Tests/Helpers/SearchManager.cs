using System.Net.Http;
using CM.Business.Entities.Models.Search;
using CM.Integration.Tests.Infrastructure;

namespace CM.Integration.Tests.Helpers;

public static class SearchManager
{
    public static EntityWithStatus<FullSearchResponse> SearchByFileNumber(HttpClient client, FileNumberSearchRequest request)
    {
        return client.SearchAsync<FullSearchResponse>(RouteHelper.SearchByFileNumber, request);
    }

    public static EntityWithStatus<FullSearchResponse> SearchByDisputeInfo(HttpClient client, DisputeInfoSearchRequest request, int count, int index)
    {
        return client.SearchAsync<FullSearchResponse>(RouteHelper.SearchByDisputeInfo + "count=" + count + "&index=" + index + "&", request);
    }

    public static EntityWithStatus<FullSearchResponse> SearchByAccessCode(HttpClient client, AccessCodeSearchRequest request)
    {
        return client.SearchAsync<FullSearchResponse>(RouteHelper.SearchByAccessCode, request);
    }

    public static EntityWithStatus<FullSearchResponse> SearchByParticipant(HttpClient client, ParticipantSearchRequest request, int count, int index)
    {
        return client.SearchAsync<FullSearchResponse>(RouteHelper.SearchByParticipant + "count=" + count + "&index=" + index + "&", request);
    }

    public static EntityWithStatus<FullSearchResponse> SearchByDisputeStatus(HttpClient client, DisputeStatusSearchRequest request)
    {
        return client.SearchAsync<FullSearchResponse>(RouteHelper.SearchByDisputeStatus, request);
    }

    public static EntityWithStatus<FullSearchResponse> SearchByHearing(HttpClient client, HearingSearchRequest request)
    {
        return client.SearchAsync<FullSearchResponse>(RouteHelper.SearchByHearing, request);
    }

    public static EntityWithStatus<FullSearchResponse> SearchByCrossApp(HttpClient client, CrossApplicationSearchRequest request)
    {
        return client.SearchAsync<FullSearchResponse>(RouteHelper.SearchByCrossApp, request);
    }

    public static EntityWithStatus<FullSearchResponse> SearchByClaims(HttpClient client, ClaimsSearchRequest request)
    {
        return client.SearchAsync<FullSearchResponse>(RouteHelper.SearchByClaims, request);
    }

    public static EntityWithStatus<FullSearchResponse> SearchDisputeMessageOwners(HttpClient client, DisputeMessageOwnerSearchRequest request)
    {
        return client.SearchAsync<FullSearchResponse>(RouteHelper.SearchDisputeMessageOwners, request);
    }

    public static EntityWithStatus<FullSearchResponse> SearchDisputeStatusOwners(HttpClient client, DisputeStatusOwnerSearchRequest request)
    {
        return client.SearchAsync<FullSearchResponse>(RouteHelper.SearchDisputeStatusOwners, request);
    }

    public static EntityWithStatus<FullSearchResponse> SearchDisputeNoteOwners(HttpClient client, DisputeNoteOwnerSearchRequest request)
    {
        return client.SearchAsync<FullSearchResponse>(RouteHelper.SearchDisputeNoteOwners, request);
    }

    public static EntityWithStatus<FullSearchResponse> SearchDisputeDocumentOwners(HttpClient client, DisputeDocumentOwnerSearchRequest request)
    {
        return client.SearchAsync<FullSearchResponse>(RouteHelper.SearchDisputeDocumentOwners, request);
    }
}