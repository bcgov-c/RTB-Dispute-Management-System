using System.Net;
using CM.Business.Entities.Models.EmailMessage;
using CM.Common.Utilities;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckEmailMessageSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var emailMessageResponse = EmailMessageManager.CreateEmailMessage(Client, Data.Dispute.DisputeGuid, new EmailMessageRequest { SendMethod = EmailSendMethod.Participant });
        emailMessageResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        var emailMessageDeleteResponse = EmailMessageManager.DeleteEmailMessage(Client, Data.EmailMessages[0].EmailMessageId);
        emailMessageDeleteResponse.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        var emailMessagePatchResponse = EmailMessageManager.PatchEmailMessage(Client, Data.EmailMessages[5].EmailMessageId, new EmailMessageRequest());
        emailMessagePatchResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        var emailMessageGetResponse = EmailMessageManager.GetEmailMessage(Client, Data.EmailMessages[5].EmailMessageId);
        emailMessageGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        var disputeEmailMessagesResponse = EmailMessageManager.GetDisputeEmailMessages(Client, Data.Dispute.DisputeGuid);
        disputeEmailMessagesResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        emailMessageResponse = EmailMessageManager.CreateEmailMessage(Client, Data.Dispute.DisputeGuid, new EmailMessageRequest { SendMethod = EmailSendMethod.Participant });
        emailMessageResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        emailMessageDeleteResponse = EmailMessageManager.DeleteEmailMessage(Client, Data.EmailMessages[1].EmailMessageId);
        emailMessageDeleteResponse.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        emailMessagePatchResponse = EmailMessageManager.PatchEmailMessage(Client, Data.EmailMessages[5].EmailMessageId, new EmailMessageRequest());
        emailMessagePatchResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        emailMessageGetResponse = EmailMessageManager.GetEmailMessage(Client, Data.EmailMessages[5].EmailMessageId);
        emailMessageGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        disputeEmailMessagesResponse = EmailMessageManager.GetDisputeEmailMessages(Client, Data.Dispute.DisputeGuid);
        disputeEmailMessagesResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        emailMessageResponse = EmailMessageManager.CreateEmailMessage(Client, Data.Dispute.DisputeGuid, new EmailMessageRequest { SendMethod = EmailSendMethod.Participant });
        emailMessageResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailMessageDeleteResponse = EmailMessageManager.DeleteEmailMessage(Client, Data.EmailMessages[2].EmailMessageId);
        emailMessageDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailMessagePatchResponse = EmailMessageManager.PatchEmailMessage(Client, Data.EmailMessages[5].EmailMessageId, new EmailMessageRequest());
        emailMessagePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailMessageGetResponse = EmailMessageManager.GetEmailMessage(Client, Data.EmailMessages[5].EmailMessageId);
        emailMessageGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeEmailMessagesResponse = EmailMessageManager.GetDisputeEmailMessages(Client, Data.Dispute.DisputeGuid);
        disputeEmailMessagesResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        emailMessageResponse = EmailMessageManager.CreateEmailMessage(Client, Data.Dispute.DisputeGuid, new EmailMessageRequest { SendMethod = EmailSendMethod.Participant });
        emailMessageResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        emailMessageDeleteResponse = EmailMessageManager.DeleteEmailMessage(Client, Data.EmailMessages[3].EmailMessageId);
        emailMessageDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailMessagePatchResponse = EmailMessageManager.PatchEmailMessage(Client, Data.EmailMessages[5].EmailMessageId, new EmailMessageRequest());
        emailMessagePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailMessageGetResponse = EmailMessageManager.GetEmailMessage(Client, Data.EmailMessages[5].EmailMessageId);
        emailMessageGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeEmailMessagesResponse = EmailMessageManager.GetDisputeEmailMessages(Client, Data.Dispute.DisputeGuid);
        disputeEmailMessagesResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS UNAUTHORIZED ACCESSCODE //
        auth = Client.Authenticate(Data.Participants[4].AccessCode);
        Assert.True(auth.ResponseObject is string);

        emailMessageResponse = EmailMessageManager.CreateEmailMessage(Client, Data.User2Dispute.DisputeGuid, new EmailMessageRequest { SendMethod = EmailSendMethod.Participant });
        emailMessageResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        emailMessageResponse = EmailMessageManager.CreateEmailMessage(Client, Data.Dispute.DisputeGuid, new EmailMessageRequest { SendMethod = EmailSendMethod.Participant });
        emailMessageResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        emailMessageDeleteResponse = EmailMessageManager.DeleteEmailMessage(Client, Data.EmailMessages[4].EmailMessageId);
        emailMessageDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailMessagePatchResponse = EmailMessageManager.PatchEmailMessage(Client, Data.EmailMessages[5].EmailMessageId, new EmailMessageRequest());
        emailMessagePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailMessageGetResponse = EmailMessageManager.GetEmailMessage(Client, Data.EmailMessages[5].EmailMessageId);
        emailMessageGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeEmailMessagesResponse = EmailMessageManager.GetDisputeEmailMessages(Client, Data.Dispute.DisputeGuid);
        disputeEmailMessagesResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}