using System.Diagnostics;
using System.Net;
using CM.Business.Entities.Models.Search;
using CM.Common.Utilities;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckSearchSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        Debug.Assert(Data.Dispute.FileNumber != null, "Data.Dispute.FileNumber != null");
        var searchByFileNumberResponse = SearchManager.SearchByFileNumber(Client, new FileNumberSearchRequest { FileNumber = Data.Dispute.FileNumber.Value });
        searchByFileNumberResponse.CheckStatusCode();

        var searchByDisputeInfoResponse = SearchManager.SearchByDisputeInfo(Client, new DisputeInfoSearchRequest { DisputeType = 1 }, 10, 0);
        searchByDisputeInfoResponse.CheckStatusCode();

        var searchByAccessCodeResponse = SearchManager.SearchByAccessCode(Client, new AccessCodeSearchRequest { AccessCode = "ABCDE" });
        searchByAccessCodeResponse.CheckStatusCode(HttpStatusCode.NoContent);

        var searchByParticipantResponse = SearchManager.SearchByParticipant(Client, new ParticipantSearchRequest { BusinessName = "AB" }, 10, 0);
        searchByParticipantResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var searchByDisputeStatusResponse = SearchManager.SearchByDisputeStatus(Client, new DisputeStatusSearchRequest { Owner = 1 });
        searchByDisputeStatusResponse.CheckStatusCode();

        var searchByHearingResponse = SearchManager.SearchByHearing(Client, new HearingSearchRequest { HearingType = (byte)HearingType.ConferenceCall });
        searchByHearingResponse.CheckStatusCode();

        var searchByCrossAppResponse = SearchManager.SearchByCrossApp(Client, new CrossApplicationSearchRequest { DisputeGuid = Data.Dispute.DisputeGuid, TenancyAddress = "Main street" });
        searchByCrossAppResponse.CheckStatusCode();

        var searchByClaimsResponse = SearchManager.SearchByClaims(Client, new ClaimsSearchRequest { ClaimCodes = new[] { 10, 20 } });
        searchByClaimsResponse.CheckStatusCode();

        var searchDisputeMessageOwners = SearchManager.SearchDisputeMessageOwners(Client, new DisputeMessageOwnerSearchRequest { CreatedBy = new[] { 1 } });
        searchDisputeMessageOwners.CheckStatusCode();

        var searchDisputeStatusOwners = SearchManager.SearchDisputeStatusOwners(Client, new DisputeStatusOwnerSearchRequest { OwnedBy = new[] { 1 } });
        searchDisputeStatusOwners.CheckStatusCode();

        var searchDisputeNoteOwners = SearchManager.SearchDisputeNoteOwners(Client, new DisputeNoteOwnerSearchRequest { OwnedBy = new[] { 1 } });
        searchDisputeNoteOwners.CheckStatusCode();

        var searchDisputeDocumentOwners = SearchManager.SearchDisputeDocumentOwners(Client, new DisputeDocumentOwnerSearchRequest { OwnedBy = new[] { 1 } });
        searchDisputeDocumentOwners.CheckStatusCode();

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        searchByFileNumberResponse = SearchManager.SearchByFileNumber(Client, new FileNumberSearchRequest { FileNumber = Data.Dispute.FileNumber.Value });
        searchByFileNumberResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchByDisputeInfoResponse = SearchManager.SearchByDisputeInfo(Client, new DisputeInfoSearchRequest { DisputeType = 1 }, 10, 0);
        searchByDisputeInfoResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchByAccessCodeResponse = SearchManager.SearchByAccessCode(Client, new AccessCodeSearchRequest { AccessCode = "ABCDE" });
        searchByAccessCodeResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchByParticipantResponse = SearchManager.SearchByParticipant(Client, new ParticipantSearchRequest { BusinessName = "ABC" }, 10, 0);
        searchByParticipantResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchByDisputeStatusResponse = SearchManager.SearchByDisputeStatus(Client, new DisputeStatusSearchRequest { Owner = 1 });
        searchByDisputeStatusResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchByHearingResponse = SearchManager.SearchByHearing(Client, new HearingSearchRequest { HearingType = (byte)HearingType.ConferenceCall });
        searchByHearingResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchByCrossAppResponse = SearchManager.SearchByCrossApp(Client, new CrossApplicationSearchRequest { DisputeGuid = Data.Dispute.DisputeGuid, TenancyAddress = "Main street" });
        searchByCrossAppResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchByClaimsResponse = SearchManager.SearchByClaims(Client, new ClaimsSearchRequest { ClaimCodes = new[] { 10, 20 } });
        searchByClaimsResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchDisputeMessageOwners = SearchManager.SearchDisputeMessageOwners(Client, new DisputeMessageOwnerSearchRequest { CreatedBy = new[] { 1 } });
        searchDisputeMessageOwners.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchDisputeStatusOwners = SearchManager.SearchDisputeStatusOwners(Client, new DisputeStatusOwnerSearchRequest { OwnedBy = new[] { 1 } });
        searchDisputeStatusOwners.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchDisputeNoteOwners = SearchManager.SearchDisputeNoteOwners(Client, new DisputeNoteOwnerSearchRequest { OwnedBy = new[] { 1 } });
        searchDisputeNoteOwners.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchDisputeDocumentOwners = SearchManager.SearchDisputeDocumentOwners(Client, new DisputeDocumentOwnerSearchRequest { OwnedBy = new[] { 1 } });
        searchDisputeDocumentOwners.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        searchByFileNumberResponse = SearchManager.SearchByFileNumber(Client, new FileNumberSearchRequest { FileNumber = Data.Dispute.FileNumber.Value });
        searchByFileNumberResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchByDisputeInfoResponse = SearchManager.SearchByDisputeInfo(Client, new DisputeInfoSearchRequest { DisputeType = 1 }, 10, 0);
        searchByDisputeInfoResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchByAccessCodeResponse = SearchManager.SearchByAccessCode(Client, new AccessCodeSearchRequest { AccessCode = "ABCDE" });
        searchByAccessCodeResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchByParticipantResponse = SearchManager.SearchByParticipant(Client, new ParticipantSearchRequest { BusinessName = "ABC" }, 10, 0);
        searchByParticipantResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchByDisputeStatusResponse = SearchManager.SearchByDisputeStatus(Client, new DisputeStatusSearchRequest { Owner = 1 });
        searchByDisputeStatusResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchByHearingResponse = SearchManager.SearchByHearing(Client, new HearingSearchRequest { HearingType = (byte)HearingType.ConferenceCall });
        searchByHearingResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchByCrossAppResponse = SearchManager.SearchByCrossApp(Client, new CrossApplicationSearchRequest { DisputeGuid = Data.Dispute.DisputeGuid, TenancyAddress = "Main street" });
        searchByCrossAppResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchByClaimsResponse = SearchManager.SearchByClaims(Client, new ClaimsSearchRequest { ClaimCodes = new[] { 10, 20 } });
        searchByClaimsResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchDisputeMessageOwners = SearchManager.SearchDisputeMessageOwners(Client, new DisputeMessageOwnerSearchRequest { CreatedBy = new[] { 1 } });
        searchDisputeMessageOwners.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchDisputeStatusOwners = SearchManager.SearchDisputeStatusOwners(Client, new DisputeStatusOwnerSearchRequest { OwnedBy = new[] { 1 } });
        searchDisputeStatusOwners.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchDisputeNoteOwners = SearchManager.SearchDisputeNoteOwners(Client, new DisputeNoteOwnerSearchRequest { OwnedBy = new[] { 1 } });
        searchDisputeNoteOwners.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchDisputeDocumentOwners = SearchManager.SearchDisputeDocumentOwners(Client, new DisputeDocumentOwnerSearchRequest { OwnedBy = new[] { 1 } });
        searchDisputeDocumentOwners.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        searchByFileNumberResponse = SearchManager.SearchByFileNumber(Client, new FileNumberSearchRequest { FileNumber = Data.Dispute.FileNumber.Value });
        searchByFileNumberResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchByDisputeInfoResponse = SearchManager.SearchByDisputeInfo(Client, new DisputeInfoSearchRequest { DisputeType = 1 }, 10, 0);
        searchByDisputeInfoResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchByAccessCodeResponse = SearchManager.SearchByAccessCode(Client, new AccessCodeSearchRequest { AccessCode = "ABCDE" });
        searchByAccessCodeResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchByParticipantResponse = SearchManager.SearchByParticipant(Client, new ParticipantSearchRequest { BusinessName = "ABC" }, 10, 0);
        searchByParticipantResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchByDisputeStatusResponse = SearchManager.SearchByDisputeStatus(Client, new DisputeStatusSearchRequest { Owner = 1 });
        searchByDisputeStatusResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchByHearingResponse = SearchManager.SearchByHearing(Client, new HearingSearchRequest { HearingType = (byte)HearingType.ConferenceCall });
        searchByHearingResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchByCrossAppResponse = SearchManager.SearchByCrossApp(Client, new CrossApplicationSearchRequest { DisputeGuid = Data.Dispute.DisputeGuid, TenancyAddress = "Main street" });
        searchByCrossAppResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchByClaimsResponse = SearchManager.SearchByClaims(Client, new ClaimsSearchRequest { ClaimCodes = new[] { 10, 20 } });
        searchByClaimsResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchDisputeMessageOwners = SearchManager.SearchDisputeMessageOwners(Client, new DisputeMessageOwnerSearchRequest { CreatedBy = new[] { 1 } });
        searchDisputeMessageOwners.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchDisputeStatusOwners = SearchManager.SearchDisputeStatusOwners(Client, new DisputeStatusOwnerSearchRequest { OwnedBy = new[] { 1 } });
        searchDisputeStatusOwners.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchDisputeNoteOwners = SearchManager.SearchDisputeNoteOwners(Client, new DisputeNoteOwnerSearchRequest { OwnedBy = new[] { 1 } });
        searchDisputeNoteOwners.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        searchDisputeDocumentOwners = SearchManager.SearchDisputeDocumentOwners(Client, new DisputeDocumentOwnerSearchRequest { OwnedBy = new[] { 1 } });
        searchDisputeDocumentOwners.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}