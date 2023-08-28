using System;
using System.Collections.Generic;
using System.Net.Http;
using CM.Business.Entities.Models.DisputeHearing;
using CM.Business.Entities.Models.Hearing;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class HearingManager
{
    public static EntityWithStatus<HearingResponse> CreateHearing(HttpClient client, HearingRequest request)
    {
        return client.PostAsync<HearingResponse>(RouteHelper.PostHearing, request);
    }

    public static EntityWithStatus<HearingResponse> PatchHearing(HttpClient client, int hearingId, HearingRequest request)
    {
        var patchDoc = new JsonPatchDocument<HearingRequest>();
        if (request.HearingNote != null)
        {
            patchDoc.Replace(e => e.HearingNote, request.HearingNote);
        }

        if (request.HearingEndDateTime != default)
        {
            patchDoc.Replace(e => e.HearingEndDateTime, request.HearingEndDateTime);
        }

        if (request.LocalEndDateTime != default)
        {
            patchDoc.Replace(e => e.LocalEndDateTime, request.LocalEndDateTime);
        }

        return client.PatchAsync<HearingResponse>(RouteHelper.PatchHearing + hearingId, patchDoc);
    }

    public static EntityWithStatus<DisputeHearingGetResponse> GetHearing(HttpClient client, int hearingId)
    {
        return client.GetAsync<DisputeHearingGetResponse>(RouteHelper.GetHearing + hearingId);
    }

    public static EntityWithStatus<ImportScheduleResponse> GetImportSchedule(HttpClient client, int hearingImportId)
    {
        return client.GetAsync<ImportScheduleResponse>(RouteHelper.GetImportSchedule + hearingImportId);
    }

    public static EntityWithStatus<List<ImportScheduleResponse>> GetImportSchedules(HttpClient client)
    {
        return client.GetAsync<List<ImportScheduleResponse>>(RouteHelper.GetImportSchedules);
    }

    public static EntityWithStatus<List<AvailableConferenceBridgesResponse>> GetAvailableConferenceBridges(HttpClient client, AvailableConferenceBridgesRequest request)
    {
        return client.GetAsync<List<AvailableConferenceBridgesResponse>>(RouteHelper.GetAvailableConferenceBridges, request);
    }

    public static EntityWithStatus<List<AvailableStaffResponse>> GetAvailableStaff(HttpClient client, HearingAvailableStaffRequest request)
    {
        return client.GetAsync<List<AvailableStaffResponse>>(RouteHelper.GetAvailableStaff, request);
    }

    public static HttpResponseMessage DeleteHearing(HttpClient client, int hearingId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteHearing + hearingId).Result;
        return response;
    }

    public static EntityWithStatus<ImportScheduleResponse> CreateImportSchedule(HttpClient client, ImportScheduleRequest request)
    {
        return client.PostAsync<ImportScheduleResponse>(RouteHelper.PostImportSchedule, request);
    }

    public static EntityWithStatus<string> ReassignHearing(HttpClient client, ReassignRequest request)
    {
        return client.PostAsync<string>(RouteHelper.ReassignHearing, request);
    }

    public static EntityWithStatus<string> RescheduleHearing(HttpClient client, RescheduleRequest request)
    {
        return client.PostAsync<string>(RouteHelper.RescheduleHearing, request);
    }

    public static EntityWithStatus<OnHoldHearingsGetResponse> GetOnHoldHearings(HttpClient client, OnHoldHearingsRequest request)
    {
        return client.GetAsync<OnHoldHearingsGetResponse>(RouteHelper.GetOnHoldHearings, request);
    }

    public static EntityWithStatus<List<ReserveAvailableHearingResponse>> ReserveAvailableHearings(HttpClient client, ReserveAvailableHearingsRequest request)
    {
        return client.PostAsync<List<ReserveAvailableHearingResponse>>(RouteHelper.ReserveAvailableHearings, request);
    }

    public static EntityWithStatus<string> HoldHearing(HttpClient client, int hearingId, HoldHearingRequest request)
    {
        return client.PostAsync<string>(RouteHelper.HoldHearing + hearingId, request);
    }

    public static EntityWithStatus<string> BookReservedHearing(HttpClient client, int hearingId)
    {
        return client.PostAsync<string>(RouteHelper.BookReservedHearing + hearingId);
    }

    public static EntityWithStatus<string> CancelReservedHearing(HttpClient client, int hearingId)
    {
        return client.PostAsync<string>(RouteHelper.CancelReservedHearing + hearingId);
    }

    public static EntityWithStatus<DisputeHearingGetResponse> LinkPastHearings(HttpClient client, Guid staticDisputeGuid, Guid movedDisputeGuid)
    {
        return client.PostAsync<DisputeHearingGetResponse>(RouteHelper.LinkPastHearings + "?staticDisputeGuid=" + staticDisputeGuid + "&movedDisputeGuid=" + movedDisputeGuid);
    }
}