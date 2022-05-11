using System;
using System.Collections.Generic;
using System.Net.Http;
using CM.Business.Entities.Models.SubmissionReceipt;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class SubmissionReceiptManager
{
    public static EntityWithStatus<SubmissionReceiptPostResponse> CreateSubmissionReceipt(HttpClient client, Guid disputeGuid, SubmissionReceiptPostRequest request)
    {
        return client.PostAsync<SubmissionReceiptPostResponse>(RouteHelper.PostSubmissionReceipt + disputeGuid, request);
    }

    public static EntityWithStatus<SubmissionReceiptPostResponse> GetSubmissionReceipt(HttpClient client, int submissionReceiptId)
    {
        return client.GetAsync<SubmissionReceiptPostResponse>(RouteHelper.GetSubmissionReceipt + submissionReceiptId);
    }

    public static EntityWithStatus<SubmissionReceiptPostResponse> UpdateSubmissionReceipt(HttpClient client, object submissionReceiptId, SubmissionReceiptPatchRequest request)
    {
        var patchDoc = new JsonPatchDocument<SubmissionReceiptPatchRequest>();
        if (request.ReceiptDate != null)
        {
            patchDoc.Replace(e => e.ReceiptDate, request.ReceiptDate);
        }

        if (request.ReceiptPrinted != null)
        {
            patchDoc.Replace(e => e.ReceiptPrinted, request.ReceiptPrinted);
        }

        return client.PatchAsync<SubmissionReceiptPostResponse>(RouteHelper.PatchSubmissionReceipt + submissionReceiptId, patchDoc);
    }

    public static HttpResponseMessage DeleteSubmissionReceipt(HttpClient client, int submissionReceiptId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteSubmissionReceipt + submissionReceiptId).Result;
        return response;
    }

    public static EntityWithStatus<List<SubmissionReceiptPostResponse>> GetSubmissionReceipts(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<List<SubmissionReceiptPostResponse>>(RouteHelper.GetSubmissionReceipts + disputeGuid);
    }
}