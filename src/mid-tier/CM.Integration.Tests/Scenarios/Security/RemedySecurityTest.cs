using System.Net;
using CM.Business.Entities.Models.Remedy;
using CM.Business.Entities.Models.RemedyDetail;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckRemedySecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var remedyPostResponse = RemedyManager.CreateRemedy(Client, Data.Claims[0].ClaimId, new RemedyRequest());
        remedyPostResponse.CheckStatusCode();

        var remedyPatchResponse = RemedyManager.UpdateRemedy(Client, Data.Remedies[0].RemedyId, new RemedyRequest());
        remedyPatchResponse.CheckStatusCode();

        var remedyDeleteResponse = RemedyManager.DeleteRemedy(Client, Data.Remedies[5].RemedyId);
        remedyDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var remedyDetailPostResponse = RemedyManager.CreateRemedyDetail(Client, Data.Remedies[0].RemedyId, new RemedyDetailRequest());
        remedyDetailPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var remedyDetailPatchResponse = RemedyManager.UpdateRemedyDetail(Client, Data.RemedyDetails[1].RemedyDetailId, new RemedyDetailRequest());
        remedyDetailPatchResponse.CheckStatusCode();

        var remedyDetailDeleteResponse = RemedyManager.DeleteRemedyDetail(Client, Data.RemedyDetails[5].RemedyDetailId);
        remedyDetailDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        remedyPostResponse = RemedyManager.CreateRemedy(Client, Data.Claims[0].ClaimId, new RemedyRequest());
        remedyPostResponse.CheckStatusCode();

        remedyPatchResponse = RemedyManager.UpdateRemedy(Client, Data.Remedies[0].RemedyId, new RemedyRequest());
        remedyPatchResponse.CheckStatusCode();

        remedyDeleteResponse = RemedyManager.DeleteRemedy(Client, Data.Remedies[4].RemedyId);
        remedyDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        remedyDetailPostResponse = RemedyManager.CreateRemedyDetail(Client, Data.Remedies[0].RemedyId, new RemedyDetailRequest());
        remedyDetailPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        remedyDetailPatchResponse = RemedyManager.UpdateRemedyDetail(Client, Data.RemedyDetails[1].RemedyDetailId, new RemedyDetailRequest());
        remedyDetailPatchResponse.CheckStatusCode();

        remedyDetailDeleteResponse = RemedyManager.DeleteRemedyDetail(Client, Data.RemedyDetails[4].RemedyDetailId);
        remedyDetailDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        remedyPostResponse = RemedyManager.CreateRemedy(Client, Data.Claims[0].ClaimId, new RemedyRequest());
        remedyPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        remedyPatchResponse = RemedyManager.UpdateRemedy(Client, Data.Remedies[0].RemedyId, new RemedyRequest());
        remedyPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        remedyDeleteResponse = RemedyManager.DeleteRemedy(Client, Data.Remedies[4].RemedyId);
        remedyDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        remedyDetailPostResponse = RemedyManager.CreateRemedyDetail(Client, Data.Remedies[0].RemedyId, new RemedyDetailRequest());
        remedyDetailPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        remedyDetailPatchResponse = RemedyManager.UpdateRemedyDetail(Client, Data.RemedyDetails[1].RemedyDetailId, new RemedyDetailRequest());
        remedyDetailPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        remedyDetailDeleteResponse = RemedyManager.DeleteRemedyDetail(Client, Data.RemedyDetails[4].RemedyDetailId);
        remedyDetailDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        remedyPostResponse = RemedyManager.CreateRemedy(Client, Data.Claims[0].ClaimId, new RemedyRequest());
        remedyPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        remedyPatchResponse = RemedyManager.UpdateRemedy(Client, Data.Remedies[0].RemedyId, new RemedyRequest());
        remedyPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        remedyDeleteResponse = RemedyManager.DeleteRemedy(Client, Data.Remedies[4].RemedyId);
        remedyDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        remedyDetailPostResponse = RemedyManager.CreateRemedyDetail(Client, Data.Remedies[0].RemedyId, new RemedyDetailRequest());
        remedyDetailPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        remedyDetailPatchResponse = RemedyManager.UpdateRemedyDetail(Client, Data.RemedyDetails[1].RemedyDetailId, new RemedyDetailRequest());
        remedyDetailPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        remedyDetailDeleteResponse = RemedyManager.DeleteRemedyDetail(Client, Data.RemedyDetails[4].RemedyDetailId);
        remedyDetailDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        remedyPostResponse = RemedyManager.CreateRemedy(Client, Data.Claims[0].ClaimId, new RemedyRequest());
        remedyPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        remedyPatchResponse = RemedyManager.UpdateRemedy(Client, Data.Remedies[0].RemedyId, new RemedyRequest());
        remedyPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        remedyDeleteResponse = RemedyManager.DeleteRemedy(Client, Data.Remedies[4].RemedyId);
        remedyDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        remedyDetailPostResponse = RemedyManager.CreateRemedyDetail(Client, Data.Remedies[0].RemedyId, new RemedyDetailRequest());
        remedyDetailPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        remedyDetailPatchResponse = RemedyManager.UpdateRemedyDetail(Client, Data.RemedyDetails[1].RemedyDetailId, new RemedyDetailRequest());
        remedyDetailPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        remedyDetailDeleteResponse = RemedyManager.DeleteRemedyDetail(Client, Data.RemedyDetails[4].RemedyDetailId);
        remedyDetailDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}