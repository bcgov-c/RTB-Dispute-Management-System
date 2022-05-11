using System.Collections.Generic;
using System.Net;
using CM.Business.Entities.Models.Dispute;
using CM.Business.Entities.Models.DisputeFlag;
using CM.Business.Entities.Models.Parties;
using CM.Business.Entities.Models.User;
using CM.Common.Utilities;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Integration;

public partial class IntegrationTests
{
    [Fact]
    public void GetDisputeFlags()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        var staff1UserRequest = new UserLoginRequest
        {
            Username = "staff_df",
            Password = "staff_df",
            SystemUserRoleId = (int)Roles.StaffUser,
            Scheduler = true,
            IsActive = true,
            AcceptsTextMessages = true,
            AdminAccess = false
        };

        var staffUser1 = UserManager.CreateUser(Client, staff1UserRequest);
        staffUser1.CheckStatusCode();

        Client.Authenticate(staff1UserRequest.Username, staff1UserRequest.Password);

        var disputeRequest = new DisputeRequest
        {
            OwnerSystemUserId = staffUser1.ResponseObject.SystemUserId,
            DisputeType = (byte)DisputeType.Rta,
            DisputeSubType = (byte)DisputeSubType.ApplicantIsLandlord,
            DisputeUrgency = (byte)DisputeUrgency.Regular,
            TenancyAddress = "3350 IntSched01 St",
            TenancyCity = "IntSched01",
            TenancyZipPostal = "T1T 1T1",
            TenancyGeozoneId = 3
        };
        var disputeResponse = DisputeManager.CreateDisputeWithData(Client, disputeRequest);
        disputeResponse.CheckStatusCode();

        var participant1Request = new ParticipantRequest
        {
            ParticipantType = (byte)ParticipantType.Business,
            ParticipantStatus = (byte)ParticipantStatus.ValidatedAndParticipating,
            FirstName = "IntSched01",
            LastName = "Participant01",
            Address = "P01 Street",
            City = "P01 City",
            ProvinceState = "BC",
            PostalZip = "P1P 1P1",
            Country = "Canada",
            AcceptedTou = true
        };

        var partyRequest = new List<ParticipantRequest> { participant1Request };
        var participantResponse = ParticipantManager.CreateParticipant(Client, disputeResponse.ResponseObject.DisputeGuid, partyRequest);
        participantResponse.CheckStatusCode();

        var disputeFlagPostResponseFalse = DisputeFlagManager.CreateDisputeFlag(Client, disputeResponse.ResponseObject.DisputeGuid, new PostDisputeFlagRequest
        {
            FlagType = 2,
            IsPublic = true,
            FlagParticipantId = participantResponse.ResponseObject[0].ParticipantId
        });
        disputeFlagPostResponseFalse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var disputeFlagPostResponse = DisputeFlagManager.CreateDisputeFlag(Client, disputeResponse.ResponseObject.DisputeGuid, new PostDisputeFlagRequest
        {
            FlagTitle = "Title-1",
            FlagStatus = 1,
            FlagType = 2,
            IsPublic = true,
            FlagParticipantId = participantResponse.ResponseObject[0].ParticipantId
        });
        disputeFlagPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        var disputeFlagPostResponse1 = DisputeFlagManager.CreateDisputeFlag(Client, disputeResponse.ResponseObject.DisputeGuid, new PostDisputeFlagRequest
        {
            FlagTitle = "Title-2",
            FlagStatus = 1,
            FlagType = 2,
            IsPublic = true,
            FlagParticipantId = participantResponse.ResponseObject[0].ParticipantId
        });
        disputeFlagPostResponse1.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        var disputeFlagPatchResponse = DisputeFlagManager.UpdateDisputeFlag(Client, disputeFlagPostResponse1.ResponseObject.DisputeFlagId, new PatchDisputeFlagRequest { FlagTitle = "Test Changed" });
        disputeFlagPatchResponse.ResponseObject.IsPublic.Should().Be(true);
        disputeFlagPatchResponse.ResponseObject.FlagTitle.Should().Be("Test Changed");

        var disputeFlagGetResponse = DisputeFlagManager.GetDisputeFlag(Client, disputeFlagPostResponse.ResponseObject.DisputeFlagId);
        disputeFlagGetResponse.ResponseObject.FlagTitle.Should().Be("Title-1");

        var disputeFlagsGetResponse = DisputeFlagManager.GetDisputeFlags(Client, disputeResponse.ResponseObject.DisputeGuid);
        disputeFlagsGetResponse.ResponseObject.Count.Should().Be(2);

        var disputeFlagDeleteResponse = DisputeFlagManager.DeleteDisputeFlag(Client, disputeFlagPostResponse.ResponseObject.DisputeFlagId);
        disputeFlagDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        disputeFlagsGetResponse = DisputeFlagManager.GetDisputeFlags(Client, disputeResponse.ResponseObject.DisputeGuid);
        disputeFlagsGetResponse.ResponseObject.Count.Should().Be(1);

        var disputeFlagsGetLinkedResponse = DisputeFlagManager.GetLinkedDisputeFlags(Client, disputeResponse.ResponseObject.DisputeGuid);
        disputeFlagsGetLinkedResponse.ResponseObject.Count.Should().Be(1);
    }
}