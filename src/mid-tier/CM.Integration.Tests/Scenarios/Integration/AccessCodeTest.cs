using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using CM.Business.Entities.Models.AccessCode;
using CM.Business.Entities.Models.Dispute;
using CM.Business.Entities.Models.Parties;
using CM.Common.Utilities;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Infrastructure;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Integration;

public partial class IntegrationTests : IntegrationTestBase
{
    [Fact]
    public void AccessCodePostClosedDispute()
    {
        Client.Authenticate(Users.User, Users.User);

        var disputeResult = DisputeManager.CreateDispute(Client);
        disputeResult.CheckStatusCode();

        var partyRequest = new List<ParticipantRequest> { RequestExamples.GetParticipantPostRequest_1() };

        var partyResult = ParticipantManager.CreateParticipant(Client, disputeResult.ResponseObject.DisputeGuid, partyRequest);
        partyResult.CheckStatusCode();

        var singleParty = partyResult.ResponseObject.FirstOrDefault();
        Debug.Assert(singleParty != null, nameof(singleParty) + " != null");
        var result = Client.PostAsync<DisputeClosedResponse>(RouteHelper.PostAccessCode + singleParty.AccessCode, null);
        result.CheckStatusCode();
    }

    [Fact]
    public void AccessCodeFileInfo()
    {
        Client.Authenticate(Users.User, Users.User);

        var disputeRequest = new DisputeRequest
        {
            OwnerSystemUserId = 2,
            DisputeType = (byte)DisputeType.Rta,
            DisputeSubType = (byte)DisputeSubType.ApplicantIsLandlord,
            DisputeUrgency = (byte)DisputeUrgency.Regular,
            TenancyAddress = "3350 IntSched01 St",
            TenancyCity = "IntSched01",
            TenancyZipPostal = "T1T 1T1",
            TenancyGeozoneId = 3
        };

        var dispute = DisputeManager.CreateDisputeWithData(Client, disputeRequest);
        dispute.CheckStatusCode();

        var partyRequest = new List<ParticipantRequest>();
        var party1 = RequestExamples.GetParticipantPostRequest_1();
        var party2 = RequestExamples.GetParticipantPostRequest_2();
        partyRequest.Add(party1);
        partyRequest.Add(party2);
        var parties = ParticipantManager.CreateParticipant(Client, dispute.ResponseObject.DisputeGuid, partyRequest);
        parties.CheckStatusCode();

        var claimGroupPostResponse = ClaimManager.CreateClaimGroup(Client, dispute.ResponseObject.DisputeGuid);
        claimGroupPostResponse.CheckStatusCode();

        var claimGroupParticipant = ClaimManager.CreateClaimGroupParticipant(Client, claimGroupPostResponse.ResponseObject.ClaimGroupId, new List<ClaimGroupParticipantRequest>
        {
            new()
            {
                ParticipantId = parties.ResponseObject[0].ParticipantId,
                GroupParticipantRole = (byte)ParticipantRole.Applicant,
                GroupPrimaryContactId = parties.ResponseObject[0].ParticipantId
            }
        });
        claimGroupParticipant.CheckStatusCode();

        claimGroupParticipant = ClaimManager.CreateClaimGroupParticipant(Client, claimGroupPostResponse.ResponseObject.ClaimGroupId, new List<ClaimGroupParticipantRequest>
        {
            new()
            {
                ParticipantId = parties.ResponseObject[1].ParticipantId,
                GroupParticipantRole = (byte)ParticipantRole.Respondent,
                GroupPrimaryContactId = parties.ResponseObject[1].ParticipantId
            }
        });
        claimGroupParticipant.CheckStatusCode();

        var disputeStatus = DisputeManager.CreateDisputeStatus(Client, dispute.ResponseObject.DisputeGuid, new DisputeStatusPostRequest
        {
            Stage = (byte)DisputeStage.ApplicationInProgress,
            Status = (byte)DisputeStatuses.PaymentRequired,
            EvidenceOverride = 0
        });

        disputeStatus.CheckStatusCode();

        var ac1Result = AccessCodeManager.AccessCodeLogin(Client, parties.ResponseObject[0].AccessCode);
        ac1Result.CheckStatusCode();
        ac1Result.ResponseObject.GetType().Should().Be(typeof(string));

        var ac2Result = AccessCodeManager.AccessCodeLogin(Client, parties.ResponseObject[1].AccessCode);
        ac2Result.CheckStatusCode();
        ac2Result.ResponseObject.GetType().Should().Be(typeof(string));

        disputeStatus = DisputeManager.CreateDisputeStatus(Client, dispute.ResponseObject.DisputeGuid, new DisputeStatusPostRequest
        {
            Stage = (byte)DisputeStage.DecisionAndPostSupport,
            Status = (byte)DisputeStatuses.Deleted,
            EvidenceOverride = 0
        });
        disputeStatus.CheckStatusCode();

        var ac3Result = AccessCodeManager.AccessCodeClosedDispute(Client, parties.ResponseObject[0].AccessCode);
        ac3Result.CheckStatusCode();
        ac3Result.ResponseObject.GetType().Should().Be(typeof(DisputeClosedResponse));

        disputeStatus = DisputeManager.CreateDisputeStatus(Client, dispute.ResponseObject.DisputeGuid, new DisputeStatusPostRequest
        {
            Stage = (byte)DisputeStage.ApplicationInProgress,
            Status = (byte)DisputeStatuses.PaymentRequired,
            EvidenceOverride = 1
        });
        disputeStatus.CheckStatusCode();

        var ac4Result = AccessCodeManager.AccessCodeLogin(Client, parties.ResponseObject[0].AccessCode);
        ac4Result.CheckStatusCode();
        ac4Result.ResponseObject.GetType().Should().Be(typeof(string));

        Client.Authenticate(parties.ResponseObject[0].AccessCode);

        var fileInfo = AccessCodeManager.GetAccessCodeFileInfo(Client);
        fileInfo.CheckStatusCode();
        fileInfo.ResponseObject.DisputeGuid.Should().Be(dispute.ResponseObject.DisputeGuid);
        fileInfo.ResponseObject.ClaimGroups[0].Participants.Count.Should().Be(parties.ResponseObject.Count);
        fileInfo.ResponseObject.TokenParticipantId.Should().Be(parties.ResponseObject[0].ParticipantId);
    }
}