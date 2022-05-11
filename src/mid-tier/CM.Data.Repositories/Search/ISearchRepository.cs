using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Model.Search;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Search;

public interface ISearchRepository : IRepository<SearchResult>
{
    Task<List<SearchResult>> FindByFileNumber(int fileNumber);

    Task<List<SearchResult>> FindByAccessCode(string accessCode);

    Task<List<SearchResult>> FindByQuery(string queryString, SearchResultSortRequest sort, int index, int count);

    Task<List<SearchResult>> FindByQueryDocumentOwners(string queryString, int index, int count);

    Task<List<SearchResult>> FindByQueryStatusOwners(string queryString, int index, int count);

    Task<List<SearchResult>> FindByQueryNoteOwners(string queryString, int index, int count);

    Task<List<SearchResult>> FindByQueryMessageOwners(string queryString, int index, int count);

    Task<CrossApplicationSourceDispute> FindByQueryCrossAppSourceDispute(string queryString);

    Task<List<CrossApplicationSourceParticipant>> FindByQueryCrossAppSourceParticipants(string queryString);

    Task<List<SearchResult>> FindByQueryCrossAppDestinationDisputes(string queryString);

    Task<int> GetQueryResultCount(string queryString);

    Task<int> GetApplicantsCount(Guid disputeGuid);

    Task<int> GetRespondentsCount(Guid disputeGuid);
}