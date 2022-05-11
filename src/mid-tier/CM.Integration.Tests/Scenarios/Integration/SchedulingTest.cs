using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using CM.Business.Entities.Models.ConferenceBridge;
using CM.Business.Entities.Models.Dispute;
using CM.Business.Entities.Models.DisputeHearing;
using CM.Business.Entities.Models.Hearing;
using CM.Business.Entities.Models.InternalUserRole;
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
    public void IntScheduler()
    {
        // Authenticate Admin/Admin
        Client.Authenticate(Users.Admin, Users.Admin);

        // STEP1 - Create Staff Users
        var staff1UserRequest = new UserLoginRequest
        {
            Username = "ArbSched",
            Password = "ArbSched",
            SystemUserRoleId = (int)Roles.StaffUser,
            Scheduler = true,
            IsActive = true,
            AcceptsTextMessages = true,
            AdminAccess = false
        };

        var staffUser1 = UserManager.CreateUser(Client, staff1UserRequest);
        staffUser1.CheckStatusCode();

        var staff2UserRequest = new UserLoginRequest
        {
            Username = "ArbNoSched",
            Password = "ArbNoSched",
            SystemUserRoleId = (int)Roles.StaffUser,
            Scheduler = false,
            IsActive = true,
            AcceptsTextMessages = true,
            AdminAccess = false
        };

        var staffUser2 = UserManager.CreateUser(Client, staff2UserRequest);
        staffUser2.CheckStatusCode();

        var staffUser1RoleRequest = new InternalUserRoleRequest
        {
            RoleGroupId = 2,
            RoleSubtypeId = 21,
            IsActive = true
        };
        var staffUser1Role = UserManager.CreateRoleGroup(Client, staffUser1.ResponseObject.SystemUserId, staffUser1RoleRequest);
        staffUser1Role.CheckStatusCode();

        // STEP2 - Create Role Groups
        var staffUser2RoleRequest = new InternalUserRoleRequest
        {
            RoleGroupId = 2,
            RoleSubtypeId = 22,
            IsActive = true
        };
        var staffUser2Role = UserManager.CreateRoleGroup(Client, staffUser2.ResponseObject.SystemUserId, staffUser2RoleRequest);
        staffUser2Role.CheckStatusCode();

        // Logout Admin/Admin
        UserManager.Logout(Client);

        // Authenticate Admin/Admin
        Client.Authenticate(Users.User, Users.User);

        // STEP3 - Create Dispute and Participant
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

        // Authenticate Admin/Admin
        Client.Authenticate(staff1UserRequest.Username, staff1UserRequest.Password);
        Client.SetDisputeGuidHeaderToken(disputeResponse.ResponseObject.DisputeGuid);

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

        // STEP4 - Create Conference Bridges
        var conferenceBridge1Request = new ConferenceBridgeRequest
        {
            PreferredOwner = staffUser1.ResponseObject.SystemUserId,
            PreferredStartTime = new DateTime(2012, 12, 12, 9, 30, 0),
            PreferredEndTime = new DateTime(2012, 12, 12, 10, 30, 0),
            DialInNumber1 = "1-800-888-8888",
            DialInDescription1 = "IntSched01 Bridge1",
            ParticipantCode = "1111111#",
            ModeratorCode = "1111119#"
        };

        var conferenceBridge1Response = ConferenceBridgeManager.CreateConferenceBridge(Client, conferenceBridge1Request);
        conferenceBridge1Response.CheckStatusCode();

        var conferenceBridge2Request = new ConferenceBridgeRequest
        {
            PreferredStartTime = new DateTime(2012, 12, 12, 9, 30, 0),
            PreferredEndTime = new DateTime(2012, 12, 12, 10, 30, 0),
            DialInNumber1 = "1-800-888-8888",
            DialInDescription1 = "IntSched01 Bridge1",
            ParticipantCode = "2222221#",
            ModeratorCode = "2222229#"
        };

        var conferenceBridge2Response = ConferenceBridgeManager.CreateConferenceBridge(Client, conferenceBridge2Request);
        conferenceBridge2Response.CheckStatusCode();

        var conferenceBridge3Request = new ConferenceBridgeRequest
        {
            DialInNumber1 = "1-800-888-8888",
            DialInDescription1 = "IntSched01 Bridge1",
            ParticipantCode = "3333331#",
            ModeratorCode = "3333339#"
        };

        var conferenceBridge3Response = ConferenceBridgeManager.CreateConferenceBridge(Client, conferenceBridge3Request);
        conferenceBridge3Response.CheckStatusCode();

        // STEP5 - Create Hearings
        var tomorrowDate = DateTime.Today.AddDays(1);

        var hearing1Request = new HearingRequest
        {
            HearingOwner = staffUser1.ResponseObject.SystemUserId,
            HearingType = (byte)HearingType.ConferenceCall,
            HearingPriority = (byte)HearingPriority.Emergency,
            ConferenceBridgeId = conferenceBridge1Response.ResponseObject.ConferenceBridgeId,
            HearingStartDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 5, 30, 0, DateTimeKind.Utc),
            HearingEndDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 6, 30, 0, DateTimeKind.Utc),
            LocalStartDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 9, 30, 0),
            LocalEndDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 10, 30, 0),
            HearingNote = "IntSched01 Hearing1"
        };
        var hearing1Response = HearingManager.CreateHearing(Client, hearing1Request);
        hearing1Response.CheckStatusCode();

        var hearing2Request = new HearingRequest
        {
            HearingOwner = staffUser1.ResponseObject.SystemUserId,
            HearingType = (byte)HearingType.ConferenceCall,
            HearingPriority = (byte)HearingPriority.Standard,
            ConferenceBridgeId = conferenceBridge1Response.ResponseObject.ConferenceBridgeId,
            HearingStartDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 5, 30, 0, DateTimeKind.Utc),
            HearingEndDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 6, 30, 0, DateTimeKind.Utc),
            LocalStartDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 9, 30, 0),
            LocalEndDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 10, 30, 0),
            HearingNote = "IntSched01 Hearing2"
        };
        var hearing2Response = HearingManager.CreateHearing(Client, hearing2Request);
        hearing2Response.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var hearing3Request = new HearingRequest
        {
            HearingOwner = staffUser2.ResponseObject.SystemUserId,
            HearingType = (byte)HearingType.ConferenceCall,
            HearingPriority = (byte)HearingPriority.Deferred,
            ConferenceBridgeId = conferenceBridge2Response.ResponseObject.ConferenceBridgeId,
            HearingStartDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 5, 30, 0, DateTimeKind.Utc),
            HearingEndDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 6, 30, 0, DateTimeKind.Utc),
            LocalStartDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 9, 30, 0),
            LocalEndDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 10, 30, 0),
            HearingNote = "IntSched01 Hearing3"
        };
        var hearing3Response = HearingManager.CreateHearing(Client, hearing3Request);
        hearing3Response.CheckStatusCode();

        var hearing4Request = new HearingRequest
        {
            HearingOwner = staffUser1.ResponseObject.SystemUserId,
            HearingType = (byte)HearingType.ConferenceCall,
            HearingPriority = (byte)HearingPriority.Duty,
            ConferenceBridgeId = conferenceBridge3Response.ResponseObject.ConferenceBridgeId,
            HearingStartDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 6, 30, 0, DateTimeKind.Utc),
            HearingEndDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 7, 30, 0, DateTimeKind.Utc),
            LocalStartDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 10, 30, 0),
            LocalEndDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 11, 30, 0),
            HearingNote = "IntSched01 Hearing4"
        };
        var hearing4Response = HearingManager.CreateHearing(Client, hearing4Request);
        hearing4Response.CheckStatusCode();

        var hearing1PatchRequest = new HearingRequest
        {
            HearingNote = "IntSched01 Hearing1 Patched"
        };
        var hearing1PatchResponse = HearingManager.PatchHearing(Client, hearing1Response.ResponseObject.HearingId, hearing1PatchRequest);
        hearing1PatchResponse.CheckStatusCode();

        var hearing1PatchRequest1 = new HearingRequest
        {
            HearingEndDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 7, 30, 0, DateTimeKind.Utc),
            LocalEndDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 11, 30, 0)
        };
        var hearing1PatchResponse1 = HearingManager.PatchHearing(Client, hearing1Response.ResponseObject.HearingId, hearing1PatchRequest1);
        hearing1PatchResponse1.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var hearing4PatchRequest = new HearingRequest
        {
            HearingEndDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 8, 30, 0, DateTimeKind.Utc),
            LocalEndDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 12, 30, 0)
        };
        var hearing4PatchResponse = HearingManager.PatchHearing(Client, hearing4Response.ResponseObject.HearingId, hearing4PatchRequest);
        hearing4PatchResponse.CheckStatusCode();

        // STEP7 - Create Dispute Hearings
        var disputeHearing1Request = new DisputeHearingRequest
        {
            HearingId = hearing1Response.ResponseObject.HearingId,
            DisputeGuid = disputeResponse.ResponseObject.DisputeGuid,
            DisputeHearingRole = (byte)DisputeHearingRole.Active,
            SharedHearingLinkType = 1,
            DisputeHearingStatus = (byte)DisputeHearingStatus.Active
        };
        var disputeHearing1Response = DisputeHearingManager.CreateDisputeHearing(Client, disputeHearing1Request);
        disputeHearing1Response.CheckStatusCode();

        var disputeHearing2Request = new DisputeHearingRequest
        {
            HearingId = 999999,
            DisputeGuid = disputeResponse.ResponseObject.DisputeGuid,
            DisputeHearingRole = (byte)DisputeHearingRole.Active,
            SharedHearingLinkType = 1,
            DisputeHearingStatus = (byte)DisputeHearingStatus.Active
        };
        var disputeHearing2Response = DisputeHearingManager.CreateDisputeHearing(Client, disputeHearing2Request);
        disputeHearing2Response.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var disputeHearing3Request = new DisputeHearingRequest
        {
            HearingId = hearing1Response.ResponseObject.HearingId,
            DisputeGuid = new Guid("698ea87b-dbd8-4f48-851a-adfe50d70fbf"),
            DisputeHearingRole = (byte)DisputeHearingRole.Active,
            SharedHearingLinkType = 1,
            DisputeHearingStatus = (byte)DisputeHearingStatus.Active
        };
        var disputeHearing3Response = DisputeHearingManager.CreateDisputeHearing(Client, disputeHearing3Request);
        disputeHearing3Response.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        UserManager.Logout(Client);

        Client.Authenticate(staff2UserRequest.Username, staff2UserRequest.Password);

        // STEP8 - Ensure that user account without scheduler rights cannot access hearing API
        var conferenceBridge4Request = new ConferenceBridgeRequest
        {
            DialInNumber1 = "1-800-888-8888",
            DialInDescription1 = "IntSched01 Bridge4",
            ParticipantCode = "4444441#",
            ModeratorCode = "4444449#"
        };

        var conferenceBridge4Response = ConferenceBridgeManager.CreateConferenceBridge(Client, conferenceBridge4Request);
        conferenceBridge4Response.CheckStatusCode();

        var hearing5Request = new HearingRequest
        {
            HearingOwner = staffUser1.ResponseObject.SystemUserId,
            HearingType = (byte)HearingType.ConferenceCall,
            HearingPriority = (byte)HearingPriority.Emergency,
            HearingStartDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 10, 30, 0, DateTimeKind.Utc),
            HearingEndDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 11, 30, 0, DateTimeKind.Utc),
            LocalStartDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 14, 30, 0),
            LocalEndDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 15, 30, 0),
            HearingNote = "IntSched01 Hearing5"
        };
        var hearing5Response = HearingManager.CreateHearing(Client, hearing5Request);
        hearing5Response.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var hearing1PatchRequest2 = new HearingRequest
        {
            HearingNote = "IntSched01 Hearing1 Patched ArbNoSched"
        };
        var hearing1PatchResponse2 = HearingManager.PatchHearing(Client, hearing1Response.ResponseObject.HearingId, hearing1PatchRequest2);
        hearing1PatchResponse2.CheckStatusCode();

        // STEP9 - Add Hearing Participation Records
        var hearingParticipation1Request = new HearingParticipationRequest
        {
            ParticipantId = participantResponse.ResponseObject.FirstOrDefault()?.ParticipantId,
            ParticipationStatus = (byte)ParticipantStatus.NotAvailable,
            ParticipationComment = "IntSched01 Participation 01",
            DisputeGuid = disputeResponse.ResponseObject.DisputeGuid
        };

        var hearingParticipation1Response = HearingParticipationManager.CreateHearingParticipation(Client, hearing1Response.ResponseObject.HearingId, hearingParticipation1Request);
        hearingParticipation1Response.CheckStatusCode();

        var hearingParticipation2Request = new HearingParticipationRequest
        {
            ParticipantId = null,
            OtherParticipantTitle = "IntSched01 OtherParticipant02",
            ParticipationStatus = (byte)ParticipantStatus.NotValidated,
            ParticipationComment = "IntSched01 Participation 02",
            DisputeGuid = disputeResponse.ResponseObject.DisputeGuid
        };

        var hearingParticipation2Response = HearingParticipationManager.CreateHearingParticipation(Client, hearing1Response.ResponseObject.HearingId, hearingParticipation2Request);
        hearingParticipation2Response.CheckStatusCode();

        var hearingParticipation3Request = new HearingParticipationRequest
        {
            ParticipantId = participantResponse.ResponseObject.FirstOrDefault()?.ParticipantId,
            ParticipationStatus = (byte)ParticipantStatus.NotAvailable,
            ParticipationComment = "IntSched01 Participation 03",
            DisputeGuid = disputeResponse.ResponseObject.DisputeGuid
        };

        var hearingParticipation3Response = HearingParticipationManager.CreateHearingParticipation(Client, 999999, hearingParticipation3Request);
        hearingParticipation3Response.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var hearingParticipation4Request = new HearingParticipationRequest
        {
            ParticipantId = 999999,
            ParticipationStatus = (byte)ParticipantStatus.NotAvailable,
            ParticipationComment = "IntSched01 Participation 04",
            DisputeGuid = disputeResponse.ResponseObject.DisputeGuid
        };

        var hearingParticipation4Response = HearingParticipationManager.CreateHearingParticipation(Client, hearing1Response.ResponseObject.HearingId, hearingParticipation4Request);
        hearingParticipation4Response.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        // STEP10 - Get hearing records and validate the returns
        var disputeHearingsResponse = DisputeHearingManager.GetDisputeHearings(Client, disputeResponse.ResponseObject.DisputeGuid);
        disputeHearingsResponse.CheckStatusCode();
        disputeHearingsResponse.ResponseObject.Count.Should().Be(1);
        disputeHearingsResponse.ResponseObject.FirstOrDefault()?.AssociatedDisputes.Count.Should().Be(1);
        disputeHearingsResponse.ResponseObject.FirstOrDefault()?.HearingParticipations.Count.Should().Be(2);

        var hearingsResponse = HearingManager.GetHearing(Client, hearing1Response.ResponseObject.HearingId);
        hearingsResponse.CheckStatusCode();
        disputeHearingsResponse.ResponseObject.Count.Should().Be(1);
        disputeHearingsResponse.ResponseObject.FirstOrDefault()?.AssociatedDisputes.Count.Should().Be(1);
        disputeHearingsResponse.ResponseObject.FirstOrDefault()?.HearingParticipations.Count.Should().Be(2);

        // Logout ArbNoSched/ArbNoSched
        UserManager.Logout(Client);

        // Authenticate ArbSched/ArbSched
        Client.Authenticate(staff1UserRequest.Username, staff1UserRequest.Password);

        // STEP11 - Clean up all records using DELETE endpoints
        var hearingParticipationDeleteResponse1 = HearingParticipationManager.DeleteHearingParticipation(Client, hearingParticipation1Response.ResponseObject.HearingParticipationId);
        hearingParticipationDeleteResponse1.StatusCode.Should().Be(HttpStatusCode.OK);

        var hearingParticipationDeleteResponse2 = HearingParticipationManager.DeleteHearingParticipation(Client, hearingParticipation2Response.ResponseObject.HearingParticipationId);
        hearingParticipationDeleteResponse2.StatusCode.Should().Be(HttpStatusCode.OK);

        var disputeHearingDeleteResponse2 = DisputeHearingManager.DeleteDisputeHearing(Client, disputeHearing1Response.ResponseObject.DisputeHearingId);
        disputeHearingDeleteResponse2.StatusCode.Should().Be(HttpStatusCode.OK);

        var hearingDeleteResponse1 = HearingManager.DeleteHearing(Client, hearing1Response.ResponseObject.HearingId);
        hearingDeleteResponse1.StatusCode.Should().Be(HttpStatusCode.OK);

        var hearingDeleteResponse4 = HearingManager.DeleteHearing(Client, hearing4Response.ResponseObject.HearingId);
        hearingDeleteResponse4.StatusCode.Should().Be(HttpStatusCode.OK);

        var participantToDelete = participantResponse.ResponseObject.FirstOrDefault();
        Assert.NotNull(participantToDelete);
        var participantDeleteResponse = ParticipantManager.DeleteParticipant(Client, participantToDelete.ParticipantId);
        participantDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}