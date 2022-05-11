using System.Collections.Generic;
using System.Net;
using CM.Business.Entities.Models.Parties;
using CM.Common.Utilities;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Theory]
    [InlineData(Users.Admin, Users.Admin, HttpStatusCode.OK, 1)]
    [InlineData(Users.User, Users.User, HttpStatusCode.OK, 2)]
    [InlineData(Users.User2, Users.User2, HttpStatusCode.Unauthorized, 3)]
    [InlineData(null, null, HttpStatusCode.Unauthorized, 4)]
    [InlineData(Users.RemoteOffice, Users.RemoteOffice, HttpStatusCode.Unauthorized, 5)]
    public void CheckClaimGroupParticipantSecurity(string userName, string password, HttpStatusCode httpStatusCode, int participantOrder)
    {
        if (userName == null)
        {
            var auth = Client.Authenticate(Data.Participant.AccessCode);
            Assert.True(auth.ResponseObject is string);
        }
        else
        {
            Client.Authenticate(userName, password);
        }

        var claimGroupParticipantPostResponse = ClaimManager.CreateClaimGroupParticipant(
            Client,
            Data.ClaimGroups[0].ClaimGroupId,
            new List<ClaimGroupParticipantRequest>
            {
                new()
                {
                    ParticipantId = Data.Participant.ParticipantId,
                    GroupParticipantRole = (byte)ParticipantRole.Applicant, GroupPrimaryContactId = 1
                }
            });
        claimGroupParticipantPostResponse.ResponseMessage.StatusCode.Should().Be(httpStatusCode);

        var claimGroupParticipantPatchResponse = ClaimManager.UpdateClaimGroupParticipant(
            Client,
            Data.ClaimGroupParticipants[0].ClaimGroupParticipantId,
            new ClaimGroupParticipantRequest
            {
                GroupParticipantRole = (byte)ParticipantRole.Respondent
            });
        claimGroupParticipantPatchResponse.ResponseMessage.StatusCode.Should().Be(httpStatusCode);

        var claimGroupParticipantDeleteResponse = ClaimManager.DeleteClaimGroupParticipant(Client, Data.ClaimGroupParticipants[participantOrder].ClaimGroupParticipantId);
        claimGroupParticipantDeleteResponse.StatusCode.Should().Be(httpStatusCode);

        var disputeClaimGroupParticipantsPatchResponse = ClaimManager.GetDisputeClaimGroupParticipants(Client, Data.Dispute.DisputeGuid);
        disputeClaimGroupParticipantsPatchResponse.ResponseMessage.StatusCode.Should().Be(httpStatusCode);
    }
}