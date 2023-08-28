using System.Net;
using CM.Business.Entities.Models.Notice;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckNoticeSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var noticePostResponse = NoticeManager.CreateNotice(Client, Data.Dispute.DisputeGuid, new NoticePostRequest());
        noticePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var noticePatchResponse = NoticeManager.UpdateNotice(Client, Data.Notices[0].NoticeId, new NoticePatchRequest());
        noticePatchResponse.CheckStatusCode();

        var noticeDeleteResponse = NoticeManager.DeleteNotice(Client, Data.Notices[1].NoticeId);
        noticeDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var noticeGetResponse = NoticeManager.GetNotice(Client, Data.Notices[0].NoticeId);
        noticeGetResponse.CheckStatusCode();

        var noticesGetResponse = NoticeManager.GetNotices(Client, Data.Dispute.DisputeGuid);
        noticesGetResponse.CheckStatusCode();

        var externalNoticesGetResponse = NoticeManager.GetExternalNotices(Client, Data.Dispute.DisputeGuid);
        externalNoticesGetResponse.CheckStatusCode();

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        noticePostResponse = NoticeManager.CreateNotice(Client, Data.Dispute.DisputeGuid, new NoticePostRequest());
        noticePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noticePatchResponse = NoticeManager.UpdateNotice(Client, Data.Notices[0].NoticeId, new NoticePatchRequest());
        noticePatchResponse.CheckStatusCode();

        noticeDeleteResponse = NoticeManager.DeleteNotice(Client, Data.Notices[2].NoticeId);
        noticeDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        noticeGetResponse = NoticeManager.GetNotice(Client, Data.Notices[0].NoticeId);
        noticeGetResponse.CheckStatusCode();

        noticesGetResponse = NoticeManager.GetNotices(Client, Data.Dispute.DisputeGuid);
        noticesGetResponse.CheckStatusCode();

        externalNoticesGetResponse = NoticeManager.GetExternalNotices(Client, Data.Dispute.DisputeGuid);
        externalNoticesGetResponse.CheckStatusCode();

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        noticePatchResponse = NoticeManager.UpdateNotice(Client, Data.Notices[0].NoticeId, new NoticePatchRequest());
        noticePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noticeDeleteResponse = NoticeManager.DeleteNotice(Client, Data.Notices[3].NoticeId);
        noticeDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noticeGetResponse = NoticeManager.GetNotice(Client, Data.Notices[0].NoticeId);
        noticeGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noticesGetResponse = NoticeManager.GetNotices(Client, Data.Dispute.DisputeGuid);
        noticesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalNoticesGetResponse = NoticeManager.GetExternalNotices(Client, Data.Dispute.DisputeGuid);
        externalNoticesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        noticePostResponse = NoticeManager.CreateNotice(Client, Data.Dispute.DisputeGuid, new NoticePostRequest());
        noticePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noticePatchResponse = NoticeManager.UpdateNotice(Client, Data.Notices[0].NoticeId, new NoticePatchRequest());
        noticePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noticeDeleteResponse = NoticeManager.DeleteNotice(Client, Data.Notices[4].NoticeId);
        noticeDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noticeGetResponse = NoticeManager.GetNotice(Client, Data.Notices[0].NoticeId);
        noticeGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noticesGetResponse = NoticeManager.GetNotices(Client, Data.Dispute.DisputeGuid);
        noticesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalNoticesGetResponse = NoticeManager.GetExternalNotices(Client, Data.Dispute.DisputeGuid);
        externalNoticesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        noticePostResponse = NoticeManager.CreateNotice(Client, Data.Dispute.DisputeGuid, new NoticePostRequest());
        noticePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noticePatchResponse = NoticeManager.UpdateNotice(Client, Data.Notices[0].NoticeId, new NoticePatchRequest());
        noticePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noticeDeleteResponse = NoticeManager.DeleteNotice(Client, Data.Notices[5].NoticeId);
        noticeDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noticeGetResponse = NoticeManager.GetNotice(Client, Data.Notices[0].NoticeId);
        noticeGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noticesGetResponse = NoticeManager.GetNotices(Client, Data.Dispute.DisputeGuid);
        noticesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalNoticesGetResponse = NoticeManager.GetExternalNotices(Client, Data.Dispute.DisputeGuid);
        externalNoticesGetResponse.CheckStatusCode();
    }
}