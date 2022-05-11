using System.Net;
using CM.Business.Entities.Models.AutoText;
using CM.Common.Utilities;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckAutotextSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var autotextPostResponse = AutotextManager.CreateAutotext(Client, new AutoTextPostRequest { TextType = (byte)TextType.Legislation, TextTitle = "AutoTitle" });
        autotextPostResponse.CheckStatusCode();

        var autotextPatchResponse = AutotextManager.UpdateAutotext(Client, Data.AutoTexts[1].AutoTextId, new AutoTextPatchRequest());
        autotextPatchResponse.CheckStatusCode();

        var autotextGetResponse = AutotextManager.GetAutotext(Client, Data.AutoTexts[1].AutoTextId);
        autotextGetResponse.CheckStatusCode();

        var disputeAutoTextsGetResponse = AutotextManager.GetAllAutoTexts(Client, new AutoTextGetRequest());
        disputeAutoTextsGetResponse.CheckStatusCode();

        var autotextDeleteResponse = AutotextManager.DeleteAutotext(Client, Data.AutoTexts[5].AutoTextId);
        autotextDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        autotextPostResponse = AutotextManager.CreateAutotext(Client, new AutoTextPostRequest { TextType = (byte)TextType.Legislation, TextTitle = "AutoTitle" });
        autotextPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        autotextPatchResponse = AutotextManager.UpdateAutotext(Client, Data.AutoTexts[1].AutoTextId, new AutoTextPatchRequest());
        autotextPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        autotextGetResponse = AutotextManager.GetAutotext(Client, Data.AutoTexts[1].AutoTextId);
        autotextGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeAutoTextsGetResponse = AutotextManager.GetAllAutoTexts(Client, new AutoTextGetRequest());
        disputeAutoTextsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        autotextDeleteResponse = AutotextManager.DeleteAutotext(Client, Data.AutoTexts[5].AutoTextId);
        autotextDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        autotextPostResponse = AutotextManager.CreateAutotext(Client, new AutoTextPostRequest { TextType = (byte)TextType.Legislation, TextTitle = "AutoTitle" });
        autotextPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        autotextPatchResponse = AutotextManager.UpdateAutotext(Client, Data.AutoTexts[1].AutoTextId, new AutoTextPatchRequest());
        autotextPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        autotextGetResponse = AutotextManager.GetAutotext(Client, Data.AutoTexts[1].AutoTextId);
        autotextGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeAutoTextsGetResponse = AutotextManager.GetAllAutoTexts(Client, new AutoTextGetRequest());
        disputeAutoTextsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        autotextDeleteResponse = AutotextManager.DeleteAutotext(Client, Data.AutoTexts[5].AutoTextId);
        autotextDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        autotextPostResponse = AutotextManager.CreateAutotext(Client, new AutoTextPostRequest { TextType = (byte)TextType.Legislation, TextTitle = "AutoTitle" });
        autotextPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        autotextPatchResponse = AutotextManager.UpdateAutotext(Client, Data.AutoTexts[1].AutoTextId, new AutoTextPatchRequest());
        autotextPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        autotextGetResponse = AutotextManager.GetAutotext(Client, Data.AutoTexts[1].AutoTextId);
        autotextGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeAutoTextsGetResponse = AutotextManager.GetAllAutoTexts(Client, new AutoTextGetRequest());
        disputeAutoTextsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        autotextDeleteResponse = AutotextManager.DeleteAutotext(Client, Data.AutoTexts[5].AutoTextId);
        autotextDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}