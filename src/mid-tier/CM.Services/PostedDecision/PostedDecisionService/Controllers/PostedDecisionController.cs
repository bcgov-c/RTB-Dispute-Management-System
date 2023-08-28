using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using CM.Common.Utilities;
using CM.Services.PostedDecision.PostedDecisionDataService.Configuration;
using CM.Services.PostedDecision.PostedDecisionDataService.Entities;
using CM.Services.PostedDecision.PostedDecisionDataService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Nest;

namespace CM.Services.PostedDecision.PostedDecisionDataService.Controllers;

[Route("posteddecision")]
[ApiController]
public class PostedDecisionController : Controller
{
    private readonly PostedDecisionContext _context;

    private readonly ElasticClient _elasticClient;

    private readonly FileSettings _fileSettings;
    private readonly IMapper _mapper;

    public PostedDecisionController(PostedDecisionContext context, IMapper mapper, IOptions<FileSettings> fileSettingsOptions, ElasticClient elasticClient)
    {
        _context = context;
        _mapper = mapper;
        _fileSettings = fileSettingsOptions.Value;
        _elasticClient = elasticClient;
    }

    [HttpGet("full-text/reindex")]
    public async Task<IActionResult> ReIndex()
    {
        await _elasticClient.DeleteByQueryAsync<PostedDecisionIndex>(q => q.MatchAll());

        var allPostedDecisions = await _context.PostedDecisions.ToListAsync();

        var allPostedDecisionsToIndex = _mapper.Map<List<PostedDecisionIndex>>(allPostedDecisions);

        if (allPostedDecisionsToIndex.Any())
        {
            await _elasticClient.IndexManyAsync(allPostedDecisionsToIndex);
        }

        return Ok($"{allPostedDecisions.Count} product(s) re-indexed");
    }

    [HttpGet("full-text/search")]
    public async Task<IActionResult> FindByText(string query, [FromQuery]PostedDecisionFullTextSearchRequest request, int count = Pagination.DefaultPageSize, int index = 0)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var searchResponse = await FullTextSearch(query, request, count, index);
        if (searchResponse == null)
        {
            return Ok();
        }

        foreach (var postedDecision in searchResponse.PostedDecisionResponses)
        {
            var rootPath = _fileSettings.FileRoot;
            postedDecision.FileUrl = $"{rootPath}/{postedDecision.FilePath}/{postedDecision.AnonDecisionId}";
        }

        return Ok(searchResponse);
    }

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery]PostedDecisionSearchRequest request, int count, int index)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        PostedDecisionSearchResponse searchResponse;

        if (!string.IsNullOrEmpty(request.AnonDecisionId))
        {
            searchResponse = await FindByAnonDecisionId(request.AnonDecisionId, count, index);
        }
        else
        {
            var query = GeneratePostedDecisionSearchQuery(request);
            searchResponse = await FindByQuery(query, count, index);
        }

        foreach (var postedDecision in searchResponse.PostedDecisionResponses)
        {
            var rootPath = _fileSettings.FileRoot;
            postedDecision.FileUrl = $"{rootPath}/{postedDecision.FilePath}/{postedDecision.AnonDecisionId}";
        }

        return Ok(searchResponse);
    }

    [HttpDelete]
    public async Task<IActionResult> Delete(int postedDecisionId)
    {
        var postedDecision = await _context.PostedDecisions.FindAsync(postedDecisionId);
        if (postedDecision != null)
        {
            postedDecision.IsDeleted = true;
            _context.Attach(postedDecision);
            _context.Entry(postedDecision).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    private static string GeneratePostedDecisionSearchQuery(PostedDecisionSearchRequest request)
    {
        var query = new StringBuilder();

        query.Append($@"select distinct p.*
                           from public.""PostedDecisions"" AS p
                           left join public.""PostedDecisionOutcomes"" AS o
                           on p.""PostedDecisionId"" = o.""PostedDecisionId""");

        if (request.IncludedClaimCodes != null && request.IncludedClaimCodes.Any())
        {
            var claimCodesWhereClause = GenerateQueryPart(request.IncludedClaimCodes);
            query.Append(claimCodesWhereClause);
            query.Append(@" Where PDO.""IsDeleted""=false");
        }
        else
        {
            query.Append(" WHERE 1=1");
        }

        if (request.ExcludedClaimCodes != null && request.ExcludedClaimCodes.Any())
        {
            var requestClaimTypes = new StringBuilder();

            foreach (var claimCode in request.ExcludedClaimCodes)
            {
                requestClaimTypes.Append(claimCode);
                if (request.ExcludedClaimCodes.LastOrDefault() != claimCode)
                {
                    requestClaimTypes.Append(", ");
                }
            }

            query.Append($@" AND p.""PostedDecisionId"" not in (select ""PostedDecisionId"" from public.""PostedDecisionOutcomes"" where ""IsDeleted""=false AND ""ClaimCode"" in ({requestClaimTypes}))");
        }

        if (request.NoteWorthy != null)
        {
            query.And(@"p.""NoteWorthy""", "=", request.NoteWorthy.Value.ToString());
        }

        if (!string.IsNullOrEmpty(request.BusinessNames))
        {
            query.And(@"LOWER(p.""BusinessNames"")", "LIKE", request.BusinessNames.ToLower());
        }

        if (request.DisputeType != null)
        {
            query.And(@"p.""DisputeType""", "=", request.DisputeType.Value.ToString());
        }

        if (request.DisputeSubType != null)
        {
            query.And(@"p.""DisputeSubType""", "=", request.DisputeSubType.Value.ToString());
        }

        if (request.TenancyEnded != null)
        {
            query.And(@"p.""TenancyEnded""", "=", request.TenancyEnded.Value.ToString());
        }

        if (request.DisputeProcess != null)
        {
            query.And(@"p.""DisputeProcess""", "=", request.DisputeProcess.Value.ToString());
        }

        if (request.ApplicationSubmittedDateGreaterThan != null)
        {
            query.And(@"p.""ApplicationSubmittedDate""", ">", request.ApplicationSubmittedDateGreaterThan.Value.ToString(CultureInfo.InvariantCulture));
        }

        if (request.ApplicationSubmittedDateLessThan != null)
        {
            query.And(@"p.""ApplicationSubmittedDate""", "<", request.ApplicationSubmittedDateLessThan.Value.ToString(CultureInfo.InvariantCulture));
        }

        if (request.DecisionDateGreaterThan != null)
        {
            query.And(@"p.""DecisionDate""", ">", request.DecisionDateGreaterThan.Value.ToString(CultureInfo.InvariantCulture));
        }

        if (request.DecisionDateLessThan != null)
        {
            query.And(@"p.""DecisionDate""", "<", request.DecisionDateLessThan.Value.ToString(CultureInfo.InvariantCulture));
        }

        if (request.PreviousHearingDateGreaterThan != null)
        {
            query.And(@"p.""PreviousHearingDate""", ">", request.PreviousHearingDateGreaterThan.Value.ToString(CultureInfo.InvariantCulture));
        }

        if (request.PreviousHearingDateLessThan != null)
        {
            query.And(@"p.""PreviousHearingDate""", "<", request.PreviousHearingDateLessThan.Value.ToString(CultureInfo.InvariantCulture));
        }

        if (request.HearingAttendance != null)
        {
            switch (request.HearingAttendance)
            {
                case 1:
                    query.And(@"p.""ApplicantHearingAttendance""", ">=", "1");
                    query.And(@"p.""RespondentHearingAttendance""", ">=", "1");
                    break;
                case 2:
                    query.And(@"p.""ApplicantHearingAttendance""", ">=", "1");
                    query.And(@"p.""RespondentHearingAttendance""", "=", "0");
                    break;
                case 3:
                    query.And(@"p.""ApplicantHearingAttendance""", "=", "0");
                    query.And(@"p.""RespondentHearingAttendance""", ">=", "1");
                    break;
            }
        }

        query.Append(@" AND p.""IsDeleted""=false");

        return query.ToString();
    }

    private static string GenerateQueryPart(int[] claimCodes)
    {
        var sb = new StringBuilder();
        sb.Append(@" left join(");
        foreach (var code in claimCodes)
        {
            sb.Append(@" select ""PostedDecisionId"", ""IsDeleted"" from public.""PostedDecisionOutcomes"" 
                            where ""ClaimCode"" = " + code);
            if (claimCodes.ToList().IndexOf(code) < claimCodes.Length - 1)
            {
                sb.Append(" intersect");
            }
        }

        sb.Append(@") AS PDO on PDO.""PostedDecisionId"" = p.""PostedDecisionId""");

        return sb.ToString();
    }

    private async Task<PostedDecisionSearchResponse> FindByAnonDecisionId(string anonDecisionId, int count, int index)
    {
        var searchResponse = new PostedDecisionSearchResponse();

        var postedDecisions = await _context.PostedDecisions
            .Include(p => p.PostedDecisionOutcomes)
            .Where(p => p.AnonDecisionId == anonDecisionId && p.IsDeleted != true)
            .ToListAsync();

        var totalDatabaseRecords = await _context.PostedDecisions.CountAsync(x => x.IsDeleted != true);
        var earliestRecordDate = await _context.PostedDecisions
            .Where(x => x.IsDeleted != true)
            .Select(x => (DateTime?)x.DecisionDate)
            .MinAsync();
        searchResponse.EarliestRecordDate = earliestRecordDate.ToCmDateTimeString();
        searchResponse.TotalDatabaseRecords = totalDatabaseRecords;

        searchResponse.TotalAvailableRecords = postedDecisions.Count;
        postedDecisions = postedDecisions.AsQueryable().ApplyPaging(count, index).ToList();

        searchResponse.PostedDecisionResponses.AddRange(_mapper.Map<List<Models.PostedDecision>, List<PostedDecisionResponse>>(postedDecisions));

        return searchResponse;
    }

    private async Task<PostedDecisionSearchResponse> FindByQuery(string query, int count, int index)
    {
        var searchResponse = new PostedDecisionSearchResponse();

        try
        {
            var resultDecisions = await _context.PostedDecisions.FromSqlRaw(query).ToListAsync();
            searchResponse.TotalAvailableRecords = resultDecisions.Count;

            var totalDatabaseRecords = await _context.PostedDecisions.CountAsync(x => x.IsDeleted != true);
            if (totalDatabaseRecords > 0)
            {
                var earliestRecordDate = await _context.PostedDecisions
                    .Where(x => x.IsDeleted != true)
                    .Select(x => (DateTime?)x.DecisionDate)
                    .MinAsync();
                searchResponse.EarliestRecordDate = earliestRecordDate.ToCmDateTimeString();
            }

            searchResponse.TotalDatabaseRecords = totalDatabaseRecords;

            resultDecisions = resultDecisions.AsQueryable().ApplyPaging(count, index).ToList();

            foreach (var resultDecision in resultDecisions)
            {
                var resultDecisionOutcomes = await _context.PostedDecisionOutcomes
                    .Where(p => p.PostedDecisionId == resultDecision.PostedDecisionId)
                    .ToListAsync();

                resultDecision.PostedDecisionOutcomes = new List<PostedDecisionOutcome>();
                foreach (var resultDecisionOutcome in resultDecisionOutcomes)
                {
                    resultDecision.PostedDecisionOutcomes.Add(resultDecisionOutcome);
                }
            }

            searchResponse.PostedDecisionResponses.AddRange(_mapper.Map<List<Models.PostedDecision>, List<PostedDecisionResponse>>(resultDecisions));

            return searchResponse;
        }
        catch (Exception exc)
        {
            Console.WriteLine(exc);
            throw;
        }
    }

    private async Task<PostedDecisionSearchResponse> FullTextSearch(string query, PostedDecisionFullTextSearchRequest request, int count, int index)
    {
        var response = await _elasticClient.SearchAsync<PostedDecisionIndex>(
            s =>
                s.Query(q =>
                q.QueryString(d => d.Query(query))));

        if (!response.IsValid)
        {
            return null;
        }

        var postedDecisionIdList = await response.Documents
            .Select(x => x.PostedDecisionId)
            .Distinct()
            .ToListAsync();

        var searchResponse = new PostedDecisionSearchResponse();

        if (!postedDecisionIdList.Any())
        {
            return searchResponse;
        }

        var predicate = PredicateBuilder.True<Models.PostedDecision>();
        predicate.And(x => postedDecisionIdList.Contains(x.PostedDecisionId) && x.IsDeleted == false);

        if (request.ApplicationSubmittedDateGreaterThan != null)
        {
            predicate = predicate.And(x => request.ApplicationSubmittedDateGreaterThan <= x.ApplicationSubmittedDate);
        }

        if (request.ApplicationSubmittedDateLessThan != null)
        {
            predicate = predicate.And(x => request.ApplicationSubmittedDateLessThan <= x.ApplicationSubmittedDate);
        }

        if (request.DecisionDateGreaterThan != null)
        {
            predicate = predicate.And(x => request.DecisionDateGreaterThan <= x.DecisionDate);
        }

        if (request.DecisionDateLessThan != null)
        {
            predicate = predicate.And(x => request.DecisionDateLessThan <= x.DecisionDate);
        }

        if (request.PreviousHearingDateGreaterThan != null)
        {
            predicate = predicate.And(x => request.PreviousHearingDateGreaterThan <= x.PreviousHearingDate);
        }

        if (request.PreviousHearingDateLessThan != null)
        {
            predicate = predicate.And(x => request.PreviousHearingDateLessThan <= x.PreviousHearingDate);
        }

        var resultDecisionsCount = await _context.PostedDecisions
            .Where(predicate)
            .Distinct()
            .CountAsync();

        var resultDecisionsPaged = await _context.PostedDecisions
            .Where(predicate)
            .Distinct()
            .ApplyPaging(count, index)
            .ToListAsync();

        var totalDatabaseRecords = await _context.PostedDecisions
            .CountAsync(x => x.IsDeleted != true);

        var earliestRecordDate = await _context.PostedDecisions
            .Where(x => x.IsDeleted != true)
            .Select(x => (DateTime?)x.DecisionDate)
            .MinAsync();

        searchResponse.TotalAvailableRecords = resultDecisionsCount;
        searchResponse.EarliestRecordDate = earliestRecordDate.ToCmDateTimeString();
        searchResponse.TotalDatabaseRecords = totalDatabaseRecords;

        foreach (var resultDecision in resultDecisionsPaged)
        {
            var resultDecisionOutcomes = await _context.PostedDecisionOutcomes
                .Where(p => p.PostedDecisionId == resultDecision.PostedDecisionId)
                .ToListAsync();

            resultDecision.PostedDecisionOutcomes = new List<PostedDecisionOutcome>();

            foreach (var resultDecisionOutcome in resultDecisionOutcomes)
            {
                resultDecision.PostedDecisionOutcomes.Add(resultDecisionOutcome);
            }
        }

        searchResponse.PostedDecisionResponses.AddRange(
            _mapper.Map<List<Models.PostedDecision>, List<PostedDecisionResponse>>(resultDecisionsPaged));

        return searchResponse;
    }
}