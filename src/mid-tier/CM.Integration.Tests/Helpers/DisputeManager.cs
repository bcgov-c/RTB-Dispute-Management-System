using System;
using System.Collections.Generic;
using System.Net.Http;
using CM.Business.Entities.Models.Dispute;
using CM.Business.Entities.Models.IntakeQuestion;
using CM.Data.Model;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class DisputeManager
{
    public static EntityWithStatus<CreateDisputeResponse> CreateDispute(HttpClient client)
    {
        return client.PostAsync<CreateDisputeResponse>(RouteHelper.PostDispute, null);
    }

    public static EntityWithStatus<DisputeResponse> CreateDisputeWithData(HttpClient client, DisputeRequest request)
    {
        var disputeGuid = CreateDispute(client).ResponseObject.DisputeGuid;

        var disputeResponse = UpdateDispute(client, disputeGuid, request);
        return disputeResponse;
    }

    public static EntityWithStatus<DisputeResponse> UpdateDispute(HttpClient client, Guid disputeGuid, DisputeRequest request)
    {
        var patchDoc = new JsonPatchDocument<DisputeRequest>();
        if (request.OwnerSystemUserId != null)
        {
            patchDoc.Replace(e => e.OwnerSystemUserId, request.OwnerSystemUserId);
        }

        if (request.DisputeType != null)
        {
            patchDoc.Replace(e => e.DisputeType, request.DisputeType);
        }

        if (request.DisputeSubType != null)
        {
            patchDoc.Replace(e => e.DisputeSubType, request.DisputeSubType);
        }

        if (request.DisputeUrgency != null)
        {
            patchDoc.Replace(e => e.DisputeUrgency, request.DisputeUrgency);
        }

        if (request.TenancyAddress != null)
        {
            patchDoc.Replace(e => e.TenancyAddress, request.TenancyAddress);
        }

        if (request.TenancyCity != null)
        {
            patchDoc.Replace(e => e.TenancyCity, request.TenancyCity);
        }

        if (request.TenancyCountry != null)
        {
            patchDoc.Replace(e => e.TenancyCountry, request.TenancyCountry);
        }

        if (request.TenancyZipPostal != null)
        {
            patchDoc.Replace(e => e.TenancyZipPostal, request.TenancyZipPostal);
        }

        if (request.TenancyGeozoneId != null)
        {
            patchDoc.Replace(e => e.TenancyGeozoneId, request.TenancyGeozoneId);
        }

        if (request.CreationMethod != null)
        {
            patchDoc.Replace(e => e.CreationMethod, request.CreationMethod);
        }

        return client.PatchAsync<DisputeResponse>(RouteHelper.PatchDispute + disputeGuid, patchDoc);
    }

    public static EntityWithStatus<DisputeStatusResponse> CreateDisputeStatus(HttpClient client, Guid disputeGuid, DisputeStatusPostRequest request)
    {
        return client.PostAsync<DisputeStatusResponse>(RouteHelper.PostDisputeStatus + disputeGuid, request);
    }

    public static EntityWithStatus<DisputeListResponse> GetDisputeList(HttpClient client)
    {
        return client.GetAsync<DisputeListResponse>(RouteHelper.GetDisputeList);
    }

    public static EntityWithStatus<DisputeResponse> GetDispute(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<DisputeResponse>(RouteHelper.GetDispute + disputeGuid);
    }

    public static EntityWithStatus<List<DisputeStatusResponse>> GetDisputeStatus(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<List<DisputeStatusResponse>>(RouteHelper.GetDisputeStatuses + disputeGuid);
    }

    public static EntityWithStatus<List<IntakeQuestionResponse>> CreateIntakeQuestion(HttpClient client, Guid disputeGuid, List<IntakeQuestionRequest> request)
    {
        return client.PostAsync<List<IntakeQuestionResponse>>(RouteHelper.PostIntakeQuestion + disputeGuid, request);
    }

    public static EntityWithStatus<IntakeQuestionResponse> UpdateIntakeQuestion(HttpClient client, int intakeQuestionId)
    {
        var patchDoc = new JsonPatchDocument<DisputeRequest>();
        return client.PatchAsync<IntakeQuestionResponse>(RouteHelper.PatchIntakeQuestion + intakeQuestionId, patchDoc);
    }

    public static EntityWithStatus<List<IntakeQuestionResponse>> GetIntakeQuestion(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<List<IntakeQuestionResponse>>(RouteHelper.GetIntakeQuestion + disputeGuid);
    }

    public static EntityWithStatus<List<DisputeUserGetResponse>> GetDisputeUsers(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<List<DisputeUserGetResponse>>(RouteHelper.GetDisputeUsersByGuid + disputeGuid);
    }

    public static EntityWithStatus<DisputeUserGetResponse> UpdateDisputeUser(HttpClient client, int disputeUserId, DisputeUserPatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<DisputeUserPatchRequest>();
        patchDoc.Replace(e => e.IsActive, request.IsActive);

        return client.PatchAsync<DisputeUserGetResponse>(RouteHelper.PatchDisputeUser + disputeUserId, patchDoc);
    }
}