using System;
using System.Collections.Generic;
using System.Diagnostics;
using CM.Business.Entities.Models.Claim;
using CM.Business.Entities.Models.ConferenceBridge;
using CM.Business.Entities.Models.Dispute;
using CM.Business.Entities.Models.DisputeHearing;
using CM.Business.Entities.Models.Hearing;
using CM.Business.Entities.Models.InternalUserRole;
using CM.Business.Entities.Models.Notice;
using CM.Business.Entities.Models.OfficeUser;
using CM.Business.Entities.Models.Parties;
using CM.Business.Entities.Models.Payment;
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
    public void ExternalUpdateDisputeDetails()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        var disputeRequest = new DisputeRequest
        {
            OwnerSystemUserId = 1,
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

        var userRequest = new UserLoginRequest
        {
            AcceptsTextMessages = true,
            IsActive = true,
            AdminAccess = true,
            Username = "ExternalUpdateDisputeDetails",
            Password = "newAdmin-123456",
            Scheduler = true,
            SystemUserRoleId = 1
        };

        var newAdmin = UserManager.CreateUser(Client, userRequest);

        Client.Authenticate(userRequest.Username, userRequest.Password);
        Client.SetDisputeGuidHeaderToken(dispute.ResponseObject.DisputeGuid);

        var internalUserRole = InternalUserManager.CreateInternalUserRole(Client, newAdmin.ResponseObject.SystemUserId, new InternalUserRoleRequest { IsActive = true, RoleGroupId = (byte)RoleGroup.Arbitrator });
        internalUserRole.CheckStatusCode();

        var conferenceBridge1Request = new ConferenceBridgeRequest
        {
            PreferredOwner = newAdmin.ResponseObject.SystemUserId,
            PreferredStartTime = new DateTime(2012, 12, 12, 9, 30, 0),
            PreferredEndTime = new DateTime(2012, 12, 12, 10, 30, 0),
            DialInNumber1 = "1-800-888-8888",
            DialInDescription1 = "IntSched01 Bridge1",
            ParticipantCode = "1212121#",
            ModeratorCode = "1212129#"
        };
        var conferenceBridge1Response = ConferenceBridgeManager.CreateConferenceBridge(Client, conferenceBridge1Request);
        conferenceBridge1Response.CheckStatusCode();

        var tomorrowDate = DateTime.Today.AddDays(1);
        var hearing1Request = new HearingRequest
        {
            HearingOwner = newAdmin.ResponseObject.SystemUserId,
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

        var createDisputeHearingResponse = DisputeHearingManager.CreateDisputeHearing(Client, new DisputeHearingRequest { DisputeGuid = dispute.ResponseObject.DisputeGuid, HearingId = hearing1Response.ResponseObject.HearingId, DisputeHearingRole = (byte)DisputeHearingRole.Active });
        createDisputeHearingResponse.CheckStatusCode();

        var claimGroupPostResponse = ClaimManager.CreateClaimGroup(Client, dispute.ResponseObject.DisputeGuid);
        claimGroupPostResponse.CheckStatusCode();

        var claimPostResponse = ClaimManager.CreateClaim(Client, claimGroupPostResponse.ResponseObject.ClaimGroupId, new ClaimRequest { ClaimTitle = "CT-1", ClaimCode = 1, ClaimType = 1 });
        claimPostResponse.CheckStatusCode();

        claimPostResponse = ClaimManager.CreateClaim(Client, claimGroupPostResponse.ResponseObject.ClaimGroupId, new ClaimRequest { ClaimTitle = "CT-2", ClaimCode = 1, ClaimType = 1 });
        claimPostResponse.CheckStatusCode();

        var noticePostResponse = NoticeManager.CreateNotice(Client, dispute.ResponseObject.DisputeGuid, new NoticePostRequest { NoticeTitle = "NT-1", NoticeType = (byte)NoticeTypes.GeneratedDisputeNotice });
        noticePostResponse.CheckStatusCode();

        var partyRequest = new List<ParticipantRequest>();
        var party1 = RequestExamples.GetParticipantPostRequest_1();
        var party2 = RequestExamples.GetParticipantPostRequest_2();
        partyRequest.Add(party1);
        partyRequest.Add(party2);
        var parties = ParticipantManager.CreateParticipant(Client, dispute.ResponseObject.DisputeGuid, partyRequest);
        parties.CheckStatusCode();

        var disputeFeePostResponse = DisputeFeeManager.CreateDisputeFee(Client, dispute.ResponseObject.DisputeGuid, new DisputeFeeRequest { AmountDue = 1, IsActive = true, FeeType = (byte)DisputeFeeType.Intake, PayorId = parties.ResponseObject[0].ParticipantId });
        disputeFeePostResponse.CheckStatusCode();

        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        Debug.Assert(dispute.ResponseObject.FileNumber != null, "dispute.ResponseObject.FileNumber != null");
        var disputeDetails1 = ExternalUpdateManager.GetDisputeDetails(Client, new OfficeUserGetDisputeRequest { SearchMethod = 1, FileNumber = dispute.ResponseObject.FileNumber.Value });
        disputeDetails1.CheckStatusCode();
        disputeDetails1.ResponseObject.Claims.Count.Should().Be(2);
        disputeDetails1.ResponseObject.CurrentNoticeId.Should().Be(noticePostResponse.ResponseObject.NoticeId);
        disputeDetails1.ResponseObject.TokenParticipantId.Should().Be(null);
        disputeDetails1.ResponseObject.DisputeFees.Count.Should().Be(1);

        var disputeDetails2 = ExternalUpdateManager.GetDisputeDetails(Client, new OfficeUserGetDisputeRequest { SearchMethod = 2, AccessCode = parties.ResponseObject[0].AccessCode });
        disputeDetails2.CheckStatusCode();
        disputeDetails2.ResponseObject.Claims.Count.Should().Be(2);
        disputeDetails2.ResponseObject.CurrentNoticeId.Should().Be(noticePostResponse.ResponseObject.NoticeId);
        disputeDetails2.ResponseObject.TokenParticipantId.Should().Be(parties.ResponseObject[0].ParticipantId);
        disputeDetails2.ResponseObject.DisputeFees.Count.Should().Be(1);
    }
}