using System;
using System.Collections.Generic;
using System.Net.Http;
using CM.Business.Entities.Models.DisputeVerification;
using CM.Business.Entities.Models.VerificationAttempt;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers
{
    public class DisputeVerificationManager
    {
        public static EntityWithStatus<DisputeVerificationResponse> CreateDisputeVerification(HttpClient client, Guid disputeGuid, DisputeVerificationPostRequest request)
        {
            return client.PostAsync<DisputeVerificationResponse>(RouteHelper.PostDisputeVerification + disputeGuid, request);
        }

        public static EntityWithStatus<DisputeVerificationGetResponse> GetDisputeVerification(HttpClient client, int disputeVerificationId)
        {
            return client.GetAsync<DisputeVerificationGetResponse>(RouteHelper.GetDisputeVerification + disputeVerificationId);
        }

        public static EntityWithStatus<DisputeVerificationResponse> UpdateDisputeVerification(HttpClient client, int disputeVerificationId, DisputeVerificationPatchRequest request)
        {
            var patchDoc = new JsonPatchDocument<DisputeVerificationPatchRequest>();
            if (request.RefundStatus != null)
            {
                patchDoc.Replace(e => e.RefundStatus, request.RefundStatus);
            }

            if (!string.IsNullOrEmpty(request.RefundNote))
            {
                patchDoc.Replace(e => e.RefundNote, request.RefundNote);
            }

            return client.PatchAsync<DisputeVerificationResponse>(RouteHelper.PatchDisputeVerification + disputeVerificationId, patchDoc);
        }

        public static HttpResponseMessage DeleteDisputeVerification(HttpClient client, int disputeVerificationId)
        {
            var response = client.DeleteAsync(RouteHelper.DeleteDisputeVerification + disputeVerificationId).Result;
            return response;
        }

        public static EntityWithStatus<List<DisputeVerificationGetResponse>> GetDisputeVerifications(HttpClient client, Guid disputeGuid)
        {
            return client.GetAsync<List<DisputeVerificationGetResponse>>(RouteHelper.GetDisputeVerifications + disputeGuid);
        }

        public static EntityWithStatus<VerificationAttemptResponse> CreateVerificationAttempt(HttpClient client, int verificationId, VerificationAttemptPostRequest request)
        {
            return client.PostAsync<VerificationAttemptResponse>(RouteHelper.PostVerificationAttempt + verificationId, request);
        }

        public static EntityWithStatus<VerificationAttemptResponse> UpdateVerificationAttempt(HttpClient client, int disputeVerificationId, VerificationAttemptPatchRequest request)
        {
            var patchDoc = new JsonPatchDocument<VerificationAttemptPatchRequest>();
            if (request.AttemptMethod != null)
            {
                patchDoc.Replace(e => e.AttemptMethod, request.AttemptMethod);
            }

            if (!string.IsNullOrEmpty(request.VerificationPaymentDetail))
            {
                patchDoc.Replace(e => e.VerificationPaymentDetail, request.VerificationPaymentDetail);
            }

            return client.PatchAsync<VerificationAttemptResponse>(RouteHelper.PatchVerificationAttempt + disputeVerificationId, patchDoc);
        }

        public static HttpResponseMessage DeleteVerificationAttempt(HttpClient client, int disputeVerificationId)
        {
            var response = client.DeleteAsync(RouteHelper.DeleteVerificationAttempt + disputeVerificationId).Result;
            return response;
        }
    }
}