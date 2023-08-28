using System;
using System.Net.Http;
using CM.Business.Entities.Models.ExternalUpdate;
using CM.Business.Entities.Models.OfficeUser;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class ExternalUpdateManager
{
    public static EntityWithStatus<ExternalUpdateParticipantResponse> UpdateParticipant(HttpClient client, int participantId, ExternalUpdateParticipantRequest request)
    {
        var patchDoc = new JsonPatchDocument<ExternalUpdateParticipantRequest>();
        if (request.PrimaryPhone != null)
        {
            patchDoc.Replace(e => e.PrimaryPhone, request.PrimaryPhone);
        }

        return client.PatchAsync<ExternalUpdateParticipantResponse>(RouteHelper.PatchExternalParticipant + participantId, patchDoc);
    }

    public static EntityWithStatus<ExternalsUpdateNoticeServiceResponse> UpdateNoticeService(HttpClient client, int noticeServiceId, ExternalUpdateNoticeServiceRequest request)
    {
        var patchDoc = new JsonPatchDocument<ExternalUpdateNoticeServiceRequest>();
        if (request.ServiceComment != null)
        {
            patchDoc.Replace(e => e.ServiceComment, request.ServiceComment);
        }

        return client.PatchAsync<ExternalsUpdateNoticeServiceResponse>(RouteHelper.PatchExternalNoticeService + noticeServiceId, patchDoc);
    }

    public static EntityWithStatus<ExternalUpdateDisputeStatusResponse> CreateDisputeStatus(HttpClient client, int fileNumber, ExternalUpdateDisputeStatusRequest request)
    {
        return client.PostAsync<ExternalUpdateDisputeStatusResponse>(RouteHelper.PostExternalDisputeStatus + fileNumber, request);
    }

    public static EntityWithStatus<OfficeUserPostDisputeResponse> CreateDispute(HttpClient client, OfficeUserPostDisputeRequest request)
    {
        return client.PostAsync<OfficeUserPostDisputeResponse>(RouteHelper.PostExternalDispute, request);
    }

    public static EntityWithStatus<OfficeUserDisputeFee> CreatePaymentTransaction(HttpClient client, int disputeFeeId, OfficeUserPostTransactionRequest request)
    {
        return client.PostAsync<OfficeUserDisputeFee>(RouteHelper.PostExternalTransaction + disputeFeeId, request);
    }

    public static EntityWithStatus<OfficeUserDispute> GetDisputeDetails(HttpClient client, OfficeUserGetDisputeRequest request)
    {
        return client.SearchAsync<OfficeUserDispute>(RouteHelper.GetExternalDisputeDetails, request);
    }

    public static EntityWithStatus<OfficeUserPatchDisputeResponse> UpdateDisputeInfo(HttpClient client, Guid disputeGuid, OfficeUserPatchDisputeRequest request)
    {
        var patchDoc = new JsonPatchDocument<OfficeUserPatchDisputeRequest>();
        if (request.OriginalNoticeDelivered != null)
        {
            patchDoc.Replace(e => e.OriginalNoticeDelivered, request.OriginalNoticeDelivered);
        }

        return client.PatchAsync<OfficeUserPatchDisputeResponse>(RouteHelper.PatchExternalDisputeInfo + disputeGuid, patchDoc);
    }

    public static EntityWithStatus<OfficeUserPostNoticeResponse> CreateNotice(HttpClient client, Guid disputeGuid, OfficeUserPostNoticeRequest request)
    {
        return client.PostAsync<OfficeUserPostNoticeResponse>(RouteHelper.PostExternalNotice + disputeGuid, request);
    }

    public static EntityWithStatus<string> GetHearingWaitTime(HttpClient client, ExternalHearingWaitTimeRequest request)
    {
        return client.GetAsync<string>(RouteHelper.GetHearingWaitTime, request);
    }
}