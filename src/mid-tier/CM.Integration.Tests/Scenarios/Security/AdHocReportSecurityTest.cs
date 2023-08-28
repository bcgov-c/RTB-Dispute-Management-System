using System.Net;
using CM.Business.Entities.Models.AdHocReport;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security
{
    public partial class SecurityTests
    {
        [Fact]
        public void CheckAdHocReportSecurity()
        {
            // LOGIN AS STAFF
            Client.Authenticate(Users.Admin, Users.Admin);

            // adHocDl
            var adHocDlReportPostResponse = AdHocReportManager.CreateAdHocDlReport(Client, new AdHocDlReportRequest());
            adHocDlReportPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.InternalServerError);

            var adHocDlReportPatchResponse = AdHocReportManager.UpdateAdHocDlReport(Client, 1, new AdHocDlReportRequest());
            adHocDlReportPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.InternalServerError);

            var adHocDlReportDeleteResponse = AdHocReportManager.DeleteAdHocDlReport(Client, 1);
            adHocDlReportDeleteResponse.StatusCode.Should().Be(HttpStatusCode.InternalServerError);

            var adHocDlReportGetResponse = AdHocReportManager.GetAdHocDlReport(Client, 1);
            adHocDlReportGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.InternalServerError);

            var adHocDlReportsGetResponse = AdHocReportManager.GetAdHocDlReports(Client, new AdHocGetFilter());
            adHocDlReportsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.InternalServerError);

            // reportemail
            var adHocEmailReportPostResponse = AdHocReportManager.CreateAdHocEmailReport(Client, new AdHocReportEmailRequest());
            adHocEmailReportPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.InternalServerError);

            var adHocEmailReportPatchResponse = AdHocReportManager.UpdateAdHocEmailReport(Client, 1, new AdHocReportEmailPatchRequest());
            adHocEmailReportPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.InternalServerError);

            var adHocEmailReportDeleteResponse = AdHocReportManager.DeleteAdHocEmailReport(Client, 1);
            adHocEmailReportDeleteResponse.StatusCode.Should().Be(HttpStatusCode.InternalServerError);

            // report attachment
            var adHocAttachmentPostResponse = AdHocReportManager.CreateAdHocReportAttachment(Client, 1, new AdHocReportAttachmentRequest());
            adHocAttachmentPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.InternalServerError);

            var adHocAttachmentPatchResponse = AdHocReportManager.UpdateAdHocReportAttachment(Client, 1, new AdHocReportAttachmentPatchRequest());
            adHocAttachmentPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.InternalServerError);

            var adHocAttachmentDeleteResponse = AdHocReportManager.DeleteAdHocReportAttachment(Client, 1);
            adHocAttachmentDeleteResponse.StatusCode.Should().Be(HttpStatusCode.InternalServerError);

            // GET Api
            var adHocReportGetResponse = AdHocReportManager.GetAdHocReport(Client, 1);
            adHocReportGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.InternalServerError);

            var adHocReportsGetResponse = AdHocReportManager.GetAdHocReports(Client, new AdHocReportGetFilter());
            adHocReportsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.InternalServerError);

            // LOGIN AS EXTERNAL
            Client.Authenticate(Users.User, Users.User);

            adHocDlReportPostResponse = AdHocReportManager.CreateAdHocDlReport(Client, new AdHocDlReportRequest());
            adHocDlReportPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocDlReportPatchResponse = AdHocReportManager.UpdateAdHocDlReport(Client, 1, new AdHocDlReportRequest());
            adHocDlReportPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocDlReportDeleteResponse = AdHocReportManager.DeleteAdHocDlReport(Client, 1);
            adHocDlReportDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocDlReportGetResponse = AdHocReportManager.GetAdHocDlReport(Client, 1);
            adHocDlReportGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocDlReportsGetResponse = AdHocReportManager.GetAdHocDlReports(Client, new AdHocGetFilter());
            adHocDlReportsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // reportemail
            adHocEmailReportPostResponse = AdHocReportManager.CreateAdHocEmailReport(Client, new AdHocReportEmailRequest());
            adHocEmailReportPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocEmailReportPatchResponse = AdHocReportManager.UpdateAdHocEmailReport(Client, 1, new AdHocReportEmailPatchRequest());
            adHocEmailReportPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocEmailReportDeleteResponse = AdHocReportManager.DeleteAdHocEmailReport(Client, 1);
            adHocEmailReportDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // report attachment
            adHocAttachmentPostResponse = AdHocReportManager.CreateAdHocReportAttachment(Client, 1, new AdHocReportAttachmentRequest());
            adHocAttachmentPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocAttachmentPatchResponse = AdHocReportManager.UpdateAdHocReportAttachment(Client, 1, new AdHocReportAttachmentPatchRequest());
            adHocAttachmentPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocAttachmentDeleteResponse = AdHocReportManager.DeleteAdHocReportAttachment(Client, 1);
            adHocAttachmentDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // GET Api
            adHocReportGetResponse = AdHocReportManager.GetAdHocReport(Client, 1);
            adHocReportGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocReportsGetResponse = AdHocReportManager.GetAdHocReports(Client, new AdHocReportGetFilter());
            adHocReportsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // LOGIN AS UNAUTHORIZED EXTERNAL USER //
            Client.Authenticate(Users.User2, Users.User2);

            adHocDlReportPostResponse = AdHocReportManager.CreateAdHocDlReport(Client, new AdHocDlReportRequest());
            adHocDlReportPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocDlReportPatchResponse = AdHocReportManager.UpdateAdHocDlReport(Client, 1, new AdHocDlReportRequest());
            adHocDlReportPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocDlReportDeleteResponse = AdHocReportManager.DeleteAdHocDlReport(Client, 1);
            adHocDlReportDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocDlReportGetResponse = AdHocReportManager.GetAdHocDlReport(Client, 1);
            adHocDlReportGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocDlReportsGetResponse = AdHocReportManager.GetAdHocDlReports(Client, new AdHocGetFilter());
            adHocDlReportsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // reportemail
            adHocEmailReportPostResponse = AdHocReportManager.CreateAdHocEmailReport(Client, new AdHocReportEmailRequest());
            adHocEmailReportPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocEmailReportPatchResponse = AdHocReportManager.UpdateAdHocEmailReport(Client, 1, new AdHocReportEmailPatchRequest());
            adHocEmailReportPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocEmailReportDeleteResponse = AdHocReportManager.DeleteAdHocEmailReport(Client, 1);
            adHocEmailReportDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // report attachment
            adHocAttachmentPostResponse = AdHocReportManager.CreateAdHocReportAttachment(Client, 1, new AdHocReportAttachmentRequest());
            adHocAttachmentPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocAttachmentPatchResponse = AdHocReportManager.UpdateAdHocReportAttachment(Client, 1, new AdHocReportAttachmentPatchRequest());
            adHocAttachmentPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocAttachmentDeleteResponse = AdHocReportManager.DeleteAdHocReportAttachment(Client, 1);
            adHocAttachmentDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // GET Api
            adHocReportGetResponse = AdHocReportManager.GetAdHocReport(Client, 1);
            adHocReportGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocReportsGetResponse = AdHocReportManager.GetAdHocReports(Client, new AdHocReportGetFilter());
            adHocReportsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // LOGIN AS ACCESSCODE
            var auth = Client.Authenticate(Data.Participant.AccessCode);
            Assert.True(auth.ResponseObject is string);

            adHocDlReportPostResponse = AdHocReportManager.CreateAdHocDlReport(Client, new AdHocDlReportRequest());
            adHocDlReportPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocDlReportPatchResponse = AdHocReportManager.UpdateAdHocDlReport(Client, 1, new AdHocDlReportRequest());
            adHocDlReportPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocDlReportDeleteResponse = AdHocReportManager.DeleteAdHocDlReport(Client, 1);
            adHocDlReportDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocDlReportGetResponse = AdHocReportManager.GetAdHocDlReport(Client, 1);
            adHocDlReportGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocDlReportsGetResponse = AdHocReportManager.GetAdHocDlReports(Client, new AdHocGetFilter());
            adHocDlReportsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // reportemail
            adHocEmailReportPostResponse = AdHocReportManager.CreateAdHocEmailReport(Client, new AdHocReportEmailRequest());
            adHocEmailReportPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocEmailReportPatchResponse = AdHocReportManager.UpdateAdHocEmailReport(Client, 1, new AdHocReportEmailPatchRequest());
            adHocEmailReportPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocEmailReportDeleteResponse = AdHocReportManager.DeleteAdHocEmailReport(Client, 1);
            adHocEmailReportDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // report attachment
            adHocAttachmentPostResponse = AdHocReportManager.CreateAdHocReportAttachment(Client, 1, new AdHocReportAttachmentRequest());
            adHocAttachmentPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocAttachmentPatchResponse = AdHocReportManager.UpdateAdHocReportAttachment(Client, 1, new AdHocReportAttachmentPatchRequest());
            adHocAttachmentPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocAttachmentDeleteResponse = AdHocReportManager.DeleteAdHocReportAttachment(Client, 1);
            adHocAttachmentDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // GET Api
            adHocReportGetResponse = AdHocReportManager.GetAdHocReport(Client, 1);
            adHocReportGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocReportsGetResponse = AdHocReportManager.GetAdHocReports(Client, new AdHocReportGetFilter());
            adHocReportsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // LOGIN AS OFFICE PAY
            Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);
            adHocDlReportPostResponse = AdHocReportManager.CreateAdHocDlReport(Client, new AdHocDlReportRequest());
            adHocDlReportPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocDlReportPatchResponse = AdHocReportManager.UpdateAdHocDlReport(Client, 1, new AdHocDlReportRequest());
            adHocDlReportPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocDlReportDeleteResponse = AdHocReportManager.DeleteAdHocDlReport(Client, 1);
            adHocDlReportDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocDlReportGetResponse = AdHocReportManager.GetAdHocDlReport(Client, 1);
            adHocDlReportGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocDlReportsGetResponse = AdHocReportManager.GetAdHocDlReports(Client, new AdHocGetFilter());
            adHocDlReportsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // reportemail
            adHocEmailReportPostResponse = AdHocReportManager.CreateAdHocEmailReport(Client, new AdHocReportEmailRequest());
            adHocEmailReportPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocEmailReportPatchResponse = AdHocReportManager.UpdateAdHocEmailReport(Client, 1, new AdHocReportEmailPatchRequest());
            adHocEmailReportPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocEmailReportDeleteResponse = AdHocReportManager.DeleteAdHocEmailReport(Client, 1);
            adHocEmailReportDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // report attachment
            adHocAttachmentPostResponse = AdHocReportManager.CreateAdHocReportAttachment(Client, 1, new AdHocReportAttachmentRequest());
            adHocAttachmentPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocAttachmentPatchResponse = AdHocReportManager.UpdateAdHocReportAttachment(Client, 1, new AdHocReportAttachmentPatchRequest());
            adHocAttachmentPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocAttachmentDeleteResponse = AdHocReportManager.DeleteAdHocReportAttachment(Client, 1);
            adHocAttachmentDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // GET Api
            adHocReportGetResponse = AdHocReportManager.GetAdHocReport(Client, 1);
            adHocReportGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            adHocReportsGetResponse = AdHocReportManager.GetAdHocReports(Client, new AdHocReportGetFilter());
            adHocReportsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }
    }
}
