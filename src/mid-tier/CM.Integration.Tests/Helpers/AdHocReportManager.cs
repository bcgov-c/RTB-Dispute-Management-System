using System.Collections.Generic;
using System.Net.Http;
using CM.Business.Entities.Models.AdHocReport;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers
{
    public static class AdHocReportManager
    {
        // adHocDl report
        public static EntityWithStatus<AdHocDlReportResponse> CreateAdHocDlReport(HttpClient client, AdHocDlReportRequest request)
        {
            return client.PostAsync<AdHocDlReportResponse>(RouteHelper.PostAdHocDlReport, request);
        }

        public static EntityWithStatus<AdHocDlReportResponse> UpdateAdHocDlReport(HttpClient client, long adhocDlReportId, AdHocDlReportRequest request)
        {
            var patchDoc = new JsonPatchDocument<AdHocDlReportRequest>();
            if (request.Title != null)
            {
                patchDoc.Replace(e => e.Title, request.Title);
            }

            return client.PatchAsync<AdHocDlReportResponse>(RouteHelper.PatchAdHocDlReport + adhocDlReportId, patchDoc);
        }

        public static HttpResponseMessage DeleteAdHocDlReport(HttpClient client, int adhocDlReportId)
        {
            var response = client.DeleteAsync(RouteHelper.DeleteAdHocDlReport + adhocDlReportId).Result;
            return response;
        }

        public static EntityWithStatus<AdHocDlReportResponse> GetAdHocDlReport(HttpClient client, long adhocDlReportId)
        {
            return client.GetAsync<AdHocDlReportResponse>(RouteHelper.GetAdHocDlReport + adhocDlReportId);
        }

        public static EntityWithStatus<List<AdHocDlReportResponse>> GetAdHocDlReports(HttpClient client, AdHocGetFilter filter)
        {
            return client.GetAsync<List<AdHocDlReportResponse>>(RouteHelper.GetAdHocDlReports, filter);
        }

        // email report
        public static EntityWithStatus<AdHocReportEmailResponse> CreateAdHocEmailReport(HttpClient client, AdHocReportEmailRequest request)
        {
            return client.PostAsync<AdHocReportEmailResponse>(RouteHelper.PostAdHocEmailReport, request);
        }

        public static EntityWithStatus<AdHocReportEmailResponse> UpdateAdHocEmailReport(HttpClient client, long adhocEmailReportId, AdHocReportEmailPatchRequest request)
        {
            var patchDoc = new JsonPatchDocument<AdHocReportEmailPatchRequest>();
            if (request.EmailSubject != null)
            {
                patchDoc.Replace(e => e.EmailSubject, request.EmailSubject);
            }

            return client.PatchAsync<AdHocReportEmailResponse>(RouteHelper.PatchAdHocEmailReport + adhocEmailReportId, patchDoc);
        }

        public static HttpResponseMessage DeleteAdHocEmailReport(HttpClient client, int adhocEmailReportId)
        {
            var response = client.DeleteAsync(RouteHelper.DeleteAdHocEmailReport + adhocEmailReportId).Result;
            return response;
        }

        // report attachment
        public static EntityWithStatus<AdHocReportAttachmentResponse> CreateAdHocReportAttachment(HttpClient client, int adHocReportId, AdHocReportAttachmentRequest request)
        {
            return client.PostAsync<AdHocReportAttachmentResponse>(RouteHelper.PostAdHocReportAttachment + adHocReportId, request);
        }

        public static EntityWithStatus<AdHocReportAttachmentResponse> UpdateAdHocReportAttachment(HttpClient client, long adHocReportAttachmentId, AdHocReportAttachmentPatchRequest request)
        {
            var patchDoc = new JsonPatchDocument<AdHocReportAttachmentPatchRequest>();
            if (request.Description != null)
            {
                patchDoc.Replace(e => e.Description, request.Description);
            }

            return client.PatchAsync<AdHocReportAttachmentResponse>(RouteHelper.PatchAdHocReportAttachment + adHocReportAttachmentId, patchDoc);
        }

        public static HttpResponseMessage DeleteAdHocReportAttachment(HttpClient client, int adHocReportAttachmentId)
        {
            var response = client.DeleteAsync(RouteHelper.DeleteAdHocReportAttachment + adHocReportAttachmentId).Result;
            return response;
        }

        public static EntityWithStatus<AdHocReportEmailGetResponse> GetAdHocReport(HttpClient client, long adhocReportId)
        {
            return client.GetAsync<AdHocReportEmailGetResponse>(RouteHelper.GetAdHocReport + adhocReportId);
        }

        public static EntityWithStatus<List<AdHocReportEmailGetResponse>> GetAdHocReports(HttpClient client, AdHocReportGetFilter filter)
        {
            return client.GetAsync<List<AdHocReportEmailGetResponse>>(RouteHelper.GetAdHocReports, filter);
        }
    }
}
