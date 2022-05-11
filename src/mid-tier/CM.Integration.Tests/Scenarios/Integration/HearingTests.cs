using System;
using System.Collections.Generic;
using System.Net;
using CM.Business.Entities.Models.ConferenceBridge;
using CM.Business.Entities.Models.Dispute;
using CM.Business.Entities.Models.DisputeHearing;
using CM.Business.Entities.Models.Hearing;
using CM.Business.Entities.Models.HearingAuditLog;
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
    public void GetHearing()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        var staff1UserRequest = new UserLoginRequest
        {
            Username = "staff_123",
            Password = "staff_123",
            SystemUserRoleId = (int)Roles.StaffUser,
            Scheduler = true,
            IsActive = true,
            AcceptsTextMessages = true,
            AdminAccess = false
        };

        var staffUser1 = UserManager.CreateUser(Client, staff1UserRequest);

        Client.Authenticate(staff1UserRequest.Username, staff1UserRequest.Password);

        var staffUser1RoleRequest = new InternalUserRoleRequest
        {
            RoleGroupId = (int)RoleGroup.Arbitrator,
            RoleSubtypeId = 21,
            IsActive = true
        };
        UserManager.CreateRoleGroup(Client, staffUser1.ResponseObject.SystemUserId, staffUser1RoleRequest);

        var conferenceBridge1Request = new ConferenceBridgeRequest
        {
            PreferredOwner = staffUser1.ResponseObject.SystemUserId,
            PreferredStartTime = new DateTime(2012, 12, 12, 9, 30, 0),
            PreferredEndTime = new DateTime(2012, 12, 12, 10, 30, 0),
            DialInNumber1 = "1-800-888-8888",
            DialInDescription1 = "Conf Bridge1",
            ParticipantCode = "12345#" + DateTime.Now.Millisecond,
            ModeratorCode = "98765#" + DateTime.Now.Millisecond
        };

        var conferenceBridge1Response = ConferenceBridgeManager.CreateConferenceBridge(Client, conferenceBridge1Request);

        var tomorrowDate = DateTime.Today;
        var hearing1Request = new HearingRequest
        {
            HearingOwner = staffUser1.ResponseObject.SystemUserId,
            HearingType = (byte)HearingType.ConferenceCall,
            HearingPriority = (byte)HearingPriority.Emergency,
            ConferenceBridgeId = conferenceBridge1Response.ResponseObject.ConferenceBridgeId,
            HearingStartDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 4, 30, 0, DateTimeKind.Utc),
            HearingEndDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.AddDays(1).Day, 5, 30, 0, DateTimeKind.Utc),
            LocalStartDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 9, 30, 0),
            LocalEndDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.AddDays(1).Day, 10, 30, 0),
            HearingNote = "Get Hearing Test"
        };
        var hearing1Response = HearingManager.CreateHearing(Client, hearing1Request);

        var partyRequest = new List<ParticipantRequest>();
        var party1 = RequestExamples.GetParticipantPostRequest_1();
        var party2 = RequestExamples.GetParticipantPostRequest_2();
        partyRequest.Add(party1);
        partyRequest.Add(party2);

        var dispute1 = DisputeManager.CreateDispute(Client);
        var parties1 = ParticipantManager.CreateParticipant(Client, dispute1.ResponseObject.DisputeGuid, partyRequest);
        var claimGroup1 = ClaimManager.CreateClaimGroup(Client, dispute1.ResponseObject.DisputeGuid);
        ClaimManager.CreateClaimGroupParticipant(Client, claimGroup1.ResponseObject.ClaimGroupId, new List<ClaimGroupParticipantRequest> { new() { ParticipantId = parties1.ResponseObject[0].ParticipantId, GroupParticipantRole = (byte)ParticipantRole.Applicant, GroupPrimaryContactId = parties1.ResponseObject[0].ParticipantId } });
        ClaimManager.CreateClaimGroupParticipant(Client, claimGroup1.ResponseObject.ClaimGroupId, new List<ClaimGroupParticipantRequest> { new() { ParticipantId = parties1.ResponseObject[1].ParticipantId, GroupParticipantRole = (byte)ParticipantRole.Respondent, GroupPrimaryContactId = parties1.ResponseObject[1].ParticipantId } });
        ClaimManager.CreateClaimGroupParticipant(Client, claimGroup1.ResponseObject.ClaimGroupId, new List<ClaimGroupParticipantRequest> { new() { ParticipantId = parties1.ResponseObject[1].ParticipantId, GroupParticipantRole = (byte)ParticipantRole.Respondent, GroupPrimaryContactId = parties1.ResponseObject[0].ParticipantId } });

        var dispute2 = DisputeManager.CreateDispute(Client);
        var parties2 = ParticipantManager.CreateParticipant(Client, dispute2.ResponseObject.DisputeGuid, partyRequest);
        var claimGroup2 = ClaimManager.CreateClaimGroup(Client, dispute2.ResponseObject.DisputeGuid);
        ClaimManager.CreateClaimGroupParticipant(Client, claimGroup2.ResponseObject.ClaimGroupId, new List<ClaimGroupParticipantRequest> { new() { ParticipantId = parties2.ResponseObject[0].ParticipantId, GroupParticipantRole = (byte)ParticipantRole.Applicant, GroupPrimaryContactId = parties2.ResponseObject[0].ParticipantId } });
        ClaimManager.CreateClaimGroupParticipant(Client, claimGroup2.ResponseObject.ClaimGroupId, new List<ClaimGroupParticipantRequest> { new() { ParticipantId = parties2.ResponseObject[1].ParticipantId, GroupParticipantRole = (byte)ParticipantRole.Respondent, GroupPrimaryContactId = parties2.ResponseObject[1].ParticipantId } });

        DisputeHearingManager.CreateDisputeHearing(Client, new DisputeHearingRequest { DisputeGuid = dispute1.ResponseObject.DisputeGuid, HearingId = hearing1Response.ResponseObject.HearingId, DisputeHearingRole = (byte)DisputeHearingRole.Active });
        DisputeHearingManager.CreateDisputeHearing(Client, new DisputeHearingRequest { DisputeGuid = dispute2.ResponseObject.DisputeGuid, HearingId = hearing1Response.ResponseObject.HearingId, DisputeHearingRole = (byte)DisputeHearingRole.Active });
        DisputeHearingManager.CreateDisputeHearing(Client, new DisputeHearingRequest { DisputeGuid = dispute2.ResponseObject.DisputeGuid, HearingId = hearing1Response.ResponseObject.HearingId, DisputeHearingRole = (byte)DisputeHearingRole.Secondary });

        HearingParticipationManager.CreateHearingParticipation(Client, hearing1Response.ResponseObject.HearingId, new HearingParticipationRequest { ParticipantId = parties1.ResponseObject[0].ParticipantId, DisputeGuid = dispute1.ResponseObject.DisputeGuid });
        HearingParticipationManager.CreateHearingParticipation(Client, hearing1Response.ResponseObject.HearingId, new HearingParticipationRequest { ParticipantId = parties1.ResponseObject[1].ParticipantId, DisputeGuid = dispute1.ResponseObject.DisputeGuid });
        HearingParticipationManager.CreateHearingParticipation(Client, hearing1Response.ResponseObject.HearingId, new HearingParticipationRequest { ParticipantId = parties2.ResponseObject[1].ParticipantId, DisputeGuid = dispute2.ResponseObject.DisputeGuid });

        var hearingGetResponse = HearingManager.GetHearing(Client, hearing1Response.ResponseObject.HearingId);

        hearingGetResponse.ResponseObject.HearingOwner.Should().Be(staffUser1.ResponseObject.SystemUserId);
        hearingGetResponse.ResponseObject.ConferenceBridgeId.Should().Be(conferenceBridge1Response.ResponseObject.ConferenceBridgeId);
        hearingGetResponse.ResponseObject.HearingStartDateTime.Should().Be(new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 4, 30, 0, DateTimeKind.Utc).ToCmDateTimeString());
        hearingGetResponse.ResponseObject.HearingEndDateTime.Should().Be(new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.AddDays(1).Day, 5, 30, 0, DateTimeKind.Utc).ToCmDateTimeString());
        hearingGetResponse.ResponseObject.LocalStartDateTime.Should().Be(new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 9, 30, 0));
        hearingGetResponse.ResponseObject.LocalEndDateTime.Should().Be(new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.AddDays(1).Day, 10, 30, 0));
        hearingGetResponse.ResponseObject.HearingParticipations.Count.Should().Be(3);

        //// TODO: Tigran. Need to fix this
        hearingGetResponse.ResponseObject.HearingParticipations[0].ParticipantId.Should().Be(parties1.ResponseObject[0].ParticipantId);
        hearingGetResponse.ResponseObject.HearingParticipations[1].ParticipantId.Should().Be(parties1.ResponseObject[1].ParticipantId);
        hearingGetResponse.ResponseObject.HearingParticipations[2].ParticipantId.Should().Be(parties2.ResponseObject[1].ParticipantId);
        hearingGetResponse.ResponseObject.AssociatedDisputes.Count.Should().Be(2);
        hearingGetResponse.ResponseObject.AssociatedDisputes[0].DisputeGuid.Should().Be(dispute1.ResponseObject.DisputeGuid);
        hearingGetResponse.ResponseObject.AssociatedDisputes[1].DisputeGuid.Should().Be(dispute2.ResponseObject.DisputeGuid);

        var hearingAuditLogs = HearingAuditLogManager.GetHearingAuditLogs(Client, new HearingAuditLogGetRequest { SearchType = 1, HearingId = hearing1Response.ResponseObject.HearingId });
        hearingAuditLogs.ResponseObject.TotalAvailableRecords.Should().Be(3);

        hearingAuditLogs = HearingAuditLogManager.GetHearingAuditLogs(Client, new HearingAuditLogGetRequest { SearchType = 8, StartDate = DateTime.UtcNow.AddDays(-1), EndDate = DateTime.UtcNow.AddDays(1) });
        hearingAuditLogs.ResponseObject.TotalAvailableRecords.Should().Be(2);
    }

    [Fact]
    public void ReassignHearing()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        var staff1UserRequest = new UserLoginRequest
        {
            Username = "user1_hearing",
            Password = "user1_hearing",
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
            Username = "user2_hearing",
            Password = "user2_hearing",
            SystemUserRoleId = (int)Roles.StaffUser,
            Scheduler = true,
            IsActive = true,
            AcceptsTextMessages = true,
            AdminAccess = false
        };

        var staffUser2 = UserManager.CreateUser(Client, staff2UserRequest);
        staffUser2.CheckStatusCode();

        var staffUser1RoleRequest = new InternalUserRoleRequest
        {
            RoleGroupId = (int)RoleGroup.Arbitrator,
            RoleSubtypeId = 21,
            IsActive = true
        };
        UserManager.CreateRoleGroup(Client, staffUser1.ResponseObject.SystemUserId, staffUser1RoleRequest);
        UserManager.CreateRoleGroup(Client, staffUser2.ResponseObject.SystemUserId, staffUser1RoleRequest);

        Client.Authenticate(staff1UserRequest.Username, staff1UserRequest.Password);

        // STEP Create Hearings
        var tomorrowDate = DateTime.Today.AddDays(1);

        var hearing1Request = new HearingRequest
        {
            HearingOwner = staffUser1.ResponseObject.SystemUserId,
            HearingType = (byte)HearingType.FaceToFace,
            HearingPriority = (byte)HearingPriority.Duty,
            HearingStartDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 5, 30, 0, DateTimeKind.Utc),
            HearingEndDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 6, 30, 0, DateTimeKind.Utc),
            LocalStartDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 9, 30, 0),
            LocalEndDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 10, 30, 0),
            HearingNote = "Hearing1"
        };
        var hearing1Response = HearingManager.CreateHearing(Client, hearing1Request);
        hearing1Response.CheckStatusCode();

        var hearing2Request = new HearingRequest
        {
            HearingOwner = staffUser2.ResponseObject.SystemUserId,
            HearingType = (byte)HearingType.FaceToFace,
            HearingPriority = (byte)HearingPriority.Emergency,
            HearingStartDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 5, 30, 0, DateTimeKind.Utc),
            HearingEndDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 6, 30, 0, DateTimeKind.Utc),
            LocalStartDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 9, 30, 0),
            LocalEndDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 10, 30, 0),
            HearingNote = "Hearing2"
        };
        var hearing2Response = HearingManager.CreateHearing(Client, hearing2Request);
        hearing2Response.CheckStatusCode();

        var reassignHearing = HearingManager.ReassignHearing(Client, new ReassignRequest { FirstHearingId = hearing1Response.ResponseObject.HearingId, SecondHearingId = hearing2Response.ResponseObject.HearingId });
        reassignHearing.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        var hearing1 = HearingManager.GetHearing(Client, hearing1Response.ResponseObject.HearingId);
        var hearing2 = HearingManager.GetHearing(Client, hearing2Response.ResponseObject.HearingId);
        hearing1.ResponseObject.HearingOwner.Should().Be(staffUser2.ResponseObject.SystemUserId);
        hearing2.ResponseObject.HearingOwner.Should().Be(staffUser1.ResponseObject.SystemUserId);
        hearing1.ResponseObject.HearingPriority.Should().Be((byte)HearingPriority.Standard);
        hearing2.ResponseObject.HearingPriority.Should().Be((byte)HearingPriority.Duty);
    }

    [Fact]
    public void RescheduleHearing()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        var staff1UserRequest = new UserLoginRequest
        {
            Username = "user3_hearing",
            Password = "user3_hearing",
            SystemUserRoleId = (int)Roles.StaffUser,
            Scheduler = true,
            IsActive = true,
            AcceptsTextMessages = true,
            AdminAccess = false
        };

        var staffUser1 = UserManager.CreateUser(Client, staff1UserRequest);

        var staff2UserRequest = new UserLoginRequest
        {
            Username = "user4_hearing",
            Password = "user4_hearing",
            SystemUserRoleId = (int)Roles.StaffUser,
            Scheduler = true,
            IsActive = true,
            AcceptsTextMessages = true,
            AdminAccess = false
        };

        var staffUser2 = UserManager.CreateUser(Client, staff2UserRequest);

        Client.Authenticate(staff1UserRequest.Username, staff1UserRequest.Password);

        var staffUser1RoleRequest = new InternalUserRoleRequest
        {
            RoleGroupId = (int)RoleGroup.Arbitrator,
            RoleSubtypeId = 21,
            IsActive = true
        };
        UserManager.CreateRoleGroup(Client, staffUser1.ResponseObject.SystemUserId, staffUser1RoleRequest);
        UserManager.CreateRoleGroup(Client, staffUser2.ResponseObject.SystemUserId, staffUser1RoleRequest);

        // STEP Create Hearings
        var tomorrowDate = DateTime.Today.AddDays(1);

        var hearing1Request = new HearingRequest
        {
            HearingOwner = staffUser1.ResponseObject.SystemUserId,
            HearingType = (byte)HearingType.FaceToFace,
            HearingPriority = (byte)HearingPriority.Duty,
            HearingStartDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 5, 30, 0, DateTimeKind.Utc),
            HearingEndDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 6, 30, 0, DateTimeKind.Utc),
            LocalStartDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 9, 30, 0),
            LocalEndDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 10, 30, 0),
            HearingNote = "Hearing1"
        };
        var hearing1Response = HearingManager.CreateHearing(Client, hearing1Request);
        hearing1Response.CheckStatusCode();

        var hearing2Request = new HearingRequest
        {
            HearingOwner = staffUser2.ResponseObject.SystemUserId,
            HearingType = (byte)HearingType.FaceToFace,
            HearingPriority = (byte)HearingPriority.Standard,
            HearingStartDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 5, 30, 0, DateTimeKind.Utc),
            HearingEndDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 6, 30, 0, DateTimeKind.Utc),
            LocalStartDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 9, 30, 0),
            LocalEndDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 10, 30, 0),
            HearingNote = "Hearing2"
        };
        var hearing2Response = HearingManager.CreateHearing(Client, hearing2Request);
        hearing2Response.CheckStatusCode();

        // STEP DISPUTE HEARINGS
        var disputeRequest1 = new DisputeRequest
        {
            OwnerSystemUserId = staffUser1.ResponseObject.SystemUserId,
            DisputeType = (byte)DisputeType.Rta,
            DisputeSubType = (byte)DisputeSubType.ApplicantIsLandlord,
            DisputeUrgency = (byte)DisputeUrgency.Regular,
            TenancyAddress = "3350 IntSched01 St",
            TenancyGeozoneId = 3
        };
        var disputeResponse1 = DisputeManager.CreateDisputeWithData(Client, disputeRequest1);
        disputeResponse1.CheckStatusCode();

        var disputeRequest2 = new DisputeRequest
        {
            OwnerSystemUserId = staffUser1.ResponseObject.SystemUserId,
            DisputeType = (byte)DisputeType.Rta,
            DisputeSubType = (byte)DisputeSubType.ApplicantIsLandlord,
            DisputeUrgency = (byte)DisputeUrgency.Regular,
            TenancyAddress = "3350 IntSched01 St",
            TenancyGeozoneId = 3
        };
        var disputeResponse2 = DisputeManager.CreateDisputeWithData(Client, disputeRequest2);
        disputeResponse2.CheckStatusCode();

        var disputeHearing1Request = new DisputeHearingRequest
        {
            HearingId = hearing1Response.ResponseObject.HearingId,
            DisputeGuid = disputeResponse1.ResponseObject.DisputeGuid,
            DisputeHearingRole = (byte)DisputeHearingRole.Active,
            SharedHearingLinkType = 1,
            DisputeHearingStatus = (byte)DisputeHearingStatus.Active
        };
        var disputeHearing1Response = DisputeHearingManager.CreateDisputeHearing(Client, disputeHearing1Request);
        disputeHearing1Response.CheckStatusCode();

        var disputeHearing2Request = new DisputeHearingRequest
        {
            HearingId = hearing1Response.ResponseObject.HearingId,
            DisputeGuid = disputeResponse2.ResponseObject.DisputeGuid,
            DisputeHearingRole = (byte)DisputeHearingRole.Secondary,
            SharedHearingLinkType = 1,
            DisputeHearingStatus = (byte)DisputeHearingStatus.Active
        };
        var disputeHearing2Response = DisputeHearingManager.CreateDisputeHearing(Client, disputeHearing2Request);
        disputeHearing2Response.CheckStatusCode();

        var rescheduleHearing = HearingManager.RescheduleHearing(Client, new RescheduleRequest { FirstHearingId = hearing1Response.ResponseObject.HearingId, SecondHearingId = hearing2Response.ResponseObject.HearingId });
        rescheduleHearing.CheckStatusCode();

        var hearing1 = HearingManager.GetHearing(Client, hearing1Response.ResponseObject.HearingId);
        var hearing2 = HearingManager.GetHearing(Client, hearing2Response.ResponseObject.HearingId);
        hearing1.ResponseObject.AssociatedDisputes.Count.Should().Be(0);
        hearing2.ResponseObject.AssociatedDisputes.Count.Should().Be(2);
        hearing1.ResponseObject.HearingPriority.Should().Be((byte)hearing2Response.ResponseObject.HearingPriority);
        hearing2.ResponseObject.HearingPriority.Should().Be((byte)hearing1Response.ResponseObject.HearingPriority);
    }
}