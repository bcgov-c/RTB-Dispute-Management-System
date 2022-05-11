using System.Net.Http;
using CM.Business.Entities.Models.ScheduleBlock;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class ScheduleBlockManager
{
    public static EntityWithStatus<ScheduleBlockPostResponse> CreateScheduleBlock(HttpClient client, int schedulePeriodId, ScheduleBlockPostRequest request)
    {
        return client.PostAsync<ScheduleBlockPostResponse>(RouteHelper.PostScheduleBlock + schedulePeriodId, request);
    }

    public static EntityWithStatus<ScheduleBlockPatchResponse> UpdateScheduleBlock(HttpClient client, int scheduleBlockId, ScheduleBlockPatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<ScheduleBlockPatchResponse>();
        if (request.BlockNote != null)
        {
            patchDoc.Replace(e => e.BlockNote, request.BlockNote);
        }

        return client.PatchAsync<ScheduleBlockPatchResponse>(RouteHelper.PatchScheduleBlock + scheduleBlockId, patchDoc);
    }

    public static HttpResponseMessage DeleteBlock(HttpClient client, int scheduleBlockId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteScheduleBlock + scheduleBlockId).Result;
        return response;
    }

    public static EntityWithStatus<ScheduleBlockGetResponse> GetScheduleBlock(HttpClient client, int scheduleBlockId)
    {
        return client.GetAsync<ScheduleBlockGetResponse>(RouteHelper.GetScheduleBlock + scheduleBlockId);
    }

    public static EntityWithStatus<ScheduledBlockByPeriodResponse> GetSchedulePeriodByPeriod(HttpClient client, int schedulePeriodId)
    {
        return client.GetAsync<ScheduledBlockByPeriodResponse>(RouteHelper.GetScheduleBlockByPeriod + schedulePeriodId);
    }

    public static EntityWithStatus<ScheduleBlocksGetFullResponse> GetSchedulePeriodByDateRange(HttpClient client, ScheduleBlockGetByDateRangeRequest request)
    {
        return client.SearchAsync<ScheduleBlocksGetFullResponse>(RouteHelper.GetScheduleBlockByDateRange, request);
    }
}