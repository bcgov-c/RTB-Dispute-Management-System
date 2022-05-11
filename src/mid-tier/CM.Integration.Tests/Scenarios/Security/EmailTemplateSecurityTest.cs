using System.Net;
using CM.Business.Entities.Models.EmailTemplate;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckEmailTemplateSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var emailTemplateResponse = EmailTemplateManager.CreateEmailTemplate(Client, new EmailTemplateRequest());
        emailTemplateResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var emailTemplateDeleteResponse = EmailTemplateManager.DeleteEmailTemplate(Client, Data.EmailTemplates[0].EmailTemplateId);
        emailTemplateDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var emailTemplatePatchResponse = EmailTemplateManager.PatchEmailTemplate(Client, Data.EmailTemplates[5].EmailTemplateId, new EmailTemplateRequest());
        emailTemplatePatchResponse.CheckStatusCode();

        var emailTemplateGetResponse = EmailTemplateManager.GetEmailTemplate(Client, Data.EmailTemplates[5].EmailTemplateId);
        emailTemplateGetResponse.CheckStatusCode();

        var emailTemplatesResponse = EmailTemplateManager.GetEmailTemplates(Client);
        emailTemplatesResponse.CheckStatusCode();

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        emailTemplateResponse = EmailTemplateManager.CreateEmailTemplate(Client, new EmailTemplateRequest());
        emailTemplateResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailTemplateDeleteResponse = EmailTemplateManager.DeleteEmailTemplate(Client, Data.EmailTemplates[0].EmailTemplateId);
        emailTemplateDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailTemplatePatchResponse = EmailTemplateManager.PatchEmailTemplate(Client, Data.EmailTemplates[5].EmailTemplateId, new EmailTemplateRequest());
        emailTemplatePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailTemplateGetResponse = EmailTemplateManager.GetEmailTemplate(Client, Data.EmailTemplates[5].EmailTemplateId);
        emailTemplateGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailTemplatesResponse = EmailTemplateManager.GetEmailTemplates(Client);
        emailTemplatesResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        emailTemplateResponse = EmailTemplateManager.CreateEmailTemplate(Client, new EmailTemplateRequest());
        emailTemplateResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailTemplateDeleteResponse = EmailTemplateManager.DeleteEmailTemplate(Client, Data.EmailTemplates[0].EmailTemplateId);
        emailTemplateDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailTemplatePatchResponse = EmailTemplateManager.PatchEmailTemplate(Client, Data.EmailTemplates[5].EmailTemplateId, new EmailTemplateRequest());
        emailTemplatePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailTemplateGetResponse = EmailTemplateManager.GetEmailTemplate(Client, Data.EmailTemplates[5].EmailTemplateId);
        emailTemplateGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailTemplatesResponse = EmailTemplateManager.GetEmailTemplates(Client);
        emailTemplatesResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS UNAUTHORIZED ACCESSCODE //
        auth = Client.Authenticate(Data.Participants[4].AccessCode);
        Assert.True(auth.ResponseObject is string);

        emailTemplateResponse = EmailTemplateManager.CreateEmailTemplate(Client, new EmailTemplateRequest());
        emailTemplateResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailTemplateDeleteResponse = EmailTemplateManager.DeleteEmailTemplate(Client, Data.EmailTemplates[0].EmailTemplateId);
        emailTemplateDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailTemplatePatchResponse = EmailTemplateManager.PatchEmailTemplate(Client, Data.EmailTemplates[5].EmailTemplateId, new EmailTemplateRequest());
        emailTemplatePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailTemplateGetResponse = EmailTemplateManager.GetEmailTemplate(Client, Data.EmailTemplates[5].EmailTemplateId);
        emailTemplateGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailTemplatesResponse = EmailTemplateManager.GetEmailTemplates(Client);
        emailTemplatesResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        emailTemplateResponse = EmailTemplateManager.CreateEmailTemplate(Client, new EmailTemplateRequest());
        emailTemplateResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailTemplateDeleteResponse = EmailTemplateManager.DeleteEmailTemplate(Client, Data.EmailTemplates[0].EmailTemplateId);
        emailTemplateDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailTemplatePatchResponse = EmailTemplateManager.PatchEmailTemplate(Client, Data.EmailTemplates[5].EmailTemplateId, new EmailTemplateRequest());
        emailTemplatePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailTemplateGetResponse = EmailTemplateManager.GetEmailTemplate(Client, Data.EmailTemplates[5].EmailTemplateId);
        emailTemplateGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        emailTemplatesResponse = EmailTemplateManager.GetEmailTemplates(Client);
        emailTemplatesResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}