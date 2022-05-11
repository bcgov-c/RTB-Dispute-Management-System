using System.Net;
using CM.Business.Entities.Models.NoticeService;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckNoticeServiceSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var noticeServicePostResponse = NoticeServiceManager.CreateNoticeService(Client, Data.Notices[0].NoticeId, new NoticeServiceRequest());
        noticeServicePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var noticeServicePatchResponse = NoticeServiceManager.UpdateNoticeService(Client, Data.NoticeServices[0].NoticeServiceId, new NoticeServicePatchRequest());
        noticeServicePatchResponse.CheckStatusCode();

        var noticeServiceDeleteResponse = NoticeServiceManager.DeleteNoticeService(Client, Data.NoticeServices[1].NoticeServiceId);
        noticeServiceDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        noticeServicePostResponse = NoticeServiceManager.CreateNoticeService(Client, Data.Notices[0].NoticeId, new NoticeServiceRequest());
        noticeServicePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        noticeServicePatchResponse = NoticeServiceManager.UpdateNoticeService(Client, Data.NoticeServices[0].NoticeServiceId, new NoticeServicePatchRequest());
        noticeServicePatchResponse.CheckStatusCode();

        noticeServiceDeleteResponse = NoticeServiceManager.DeleteNoticeService(Client, Data.NoticeServices[2].NoticeServiceId);
        noticeServiceDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        noticeServicePostResponse = NoticeServiceManager.CreateNoticeService(Client, Data.Notices[0].NoticeId, new NoticeServiceRequest());
        noticeServicePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noticeServicePatchResponse = NoticeServiceManager.UpdateNoticeService(Client, Data.NoticeServices[0].NoticeServiceId, new NoticeServicePatchRequest());
        noticeServicePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noticeServiceDeleteResponse = NoticeServiceManager.DeleteNoticeService(Client, Data.NoticeServices[3].NoticeServiceId);
        noticeServiceDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        noticeServicePostResponse = NoticeServiceManager.CreateNoticeService(Client, Data.Notices[0].NoticeId, new NoticeServiceRequest());
        noticeServicePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noticeServicePatchResponse = NoticeServiceManager.UpdateNoticeService(Client, Data.NoticeServices[0].NoticeServiceId, new NoticeServicePatchRequest());
        noticeServicePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noticeServiceDeleteResponse = NoticeServiceManager.DeleteNoticeService(Client, Data.NoticeServices[4].NoticeServiceId);
        noticeServiceDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        noticeServicePostResponse = NoticeServiceManager.CreateNoticeService(Client, Data.Notices[0].NoticeId, new NoticeServiceRequest());
        noticeServicePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noticeServicePatchResponse = NoticeServiceManager.UpdateNoticeService(Client, Data.NoticeServices[0].NoticeServiceId, new NoticeServicePatchRequest());
        noticeServicePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noticeServiceDeleteResponse = NoticeServiceManager.DeleteNoticeService(Client, Data.NoticeServices[5].NoticeServiceId);
        noticeServiceDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}