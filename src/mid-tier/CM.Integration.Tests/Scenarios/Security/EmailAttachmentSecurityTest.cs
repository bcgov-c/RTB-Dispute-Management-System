using System.Net;
using CM.Business.Entities.Models.EmailAttachment;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckEmailAttachmentSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var emailAttachmentResponse = EmailAttachmentManager.CreateEmailAttachment(Client, Data.EmailMessages[5].EmailMessageId, new EmailAttachmentRequest());
        emailAttachmentResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var emailAttachmentGetResponse = EmailAttachmentManager.GetEmailAttachments(Client, Data.EmailMessages[5].EmailMessageId);
        emailAttachmentGetResponse.CheckStatusCode();

        var emailAttachmentDeleteResponse = EmailAttachmentManager.DeleteEmailAttachment(Client, Data.EmailAttachments[5].EmailAttachmentId);
        emailAttachmentDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        emailAttachmentResponse = EmailAttachmentManager.CreateEmailAttachment(Client, Data.User2EmailMessages[5].EmailMessageId, new EmailAttachmentRequest());
        emailAttachmentResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        emailAttachmentGetResponse = EmailAttachmentManager.GetEmailAttachments(Client, Data.EmailMessages[5].EmailMessageId);
        emailAttachmentGetResponse.CheckStatusCode();

        emailAttachmentDeleteResponse = EmailAttachmentManager.DeleteEmailAttachment(Client, Data.EmailAttachments[4].EmailAttachmentId);
        emailAttachmentDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // LOGIN AS UNAUTHORIZED EXTERNAL
        Client.Authenticate(Users.User2, Users.User2);

        emailAttachmentResponse = EmailAttachmentManager.CreateEmailAttachment(Client, Data.EmailMessages[5].EmailMessageId, new EmailAttachmentRequest());
        emailAttachmentResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailAttachmentGetResponse = EmailAttachmentManager.GetEmailAttachments(Client, Data.EmailMessages[5].EmailMessageId);
        emailAttachmentGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailAttachmentDeleteResponse = EmailAttachmentManager.DeleteEmailAttachment(Client, Data.EmailAttachments[4].EmailAttachmentId);
        emailAttachmentDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        emailAttachmentResponse = EmailAttachmentManager.CreateEmailAttachment(Client, Data.EmailMessages[5].EmailMessageId, new EmailAttachmentRequest());
        emailAttachmentResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailAttachmentGetResponse = EmailAttachmentManager.GetEmailAttachments(Client, Data.EmailMessages[5].EmailMessageId);
        emailAttachmentGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailAttachmentDeleteResponse = EmailAttachmentManager.DeleteEmailAttachment(Client, Data.EmailAttachments[4].EmailAttachmentId);
        emailAttachmentDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        emailAttachmentResponse = EmailAttachmentManager.CreateEmailAttachment(Client, Data.EmailMessages[5].EmailMessageId, new EmailAttachmentRequest());
        emailAttachmentResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailAttachmentGetResponse = EmailAttachmentManager.GetEmailAttachments(Client, Data.EmailMessages[5].EmailMessageId);
        emailAttachmentGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailAttachmentDeleteResponse = EmailAttachmentManager.DeleteEmailAttachment(Client, Data.EmailAttachments[4].EmailAttachmentId);
        emailAttachmentDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}