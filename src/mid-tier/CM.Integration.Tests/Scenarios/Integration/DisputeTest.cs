using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using CM.Business.Entities.Models.ConferenceBridge;
using CM.Business.Entities.Models.Dispute;
using CM.Business.Entities.Models.DisputeHearing;
using CM.Business.Entities.Models.Hearing;
using CM.Business.Entities.Models.InternalUserRole;
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
    public void PostDisputeOkResponse()
    {
        Client.Authenticate(Users.User, Users.User);

        var disputeResponse = DisputeManager.CreateDispute(Client);
        disputeResponse.ResponseMessage.EnsureSuccessStatusCode();
        disputeResponse.CheckStatusCode();
    }

    [Fact]
    public void GetDisputeList()
    {
        Client.Authenticate(Users.User, Users.User);

        var dispute1 = DisputeManager.CreateDispute(Client);
        dispute1.CheckStatusCode();
        var dispute2 = DisputeManager.CreateDispute(Client);
        dispute2.CheckStatusCode();
        var dispute3 = DisputeManager.CreateDispute(Client);
        dispute3.CheckStatusCode();

        var partyRequest = new List<ParticipantRequest>();
        var party1 = RequestExamples.GetParticipantPostRequest_1();
        var party2 = RequestExamples.GetParticipantPostRequest_2();
        partyRequest.Add(party1);
        partyRequest.Add(party2);

        var parties1 = ParticipantManager.CreateParticipant(Client, dispute1.ResponseObject.DisputeGuid, partyRequest);
        parties1.CheckStatusCode();

        var claimGroup1 = ClaimManager.CreateClaimGroup(Client, dispute1.ResponseObject.DisputeGuid);
        claimGroup1.CheckStatusCode();

        ClaimManager.CreateClaimGroupParticipant(Client, claimGroup1.ResponseObject.ClaimGroupId, new List<ClaimGroupParticipantRequest>
        {
            new()
            {
                ParticipantId = parties1.ResponseObject[0].ParticipantId,
                GroupParticipantRole = (byte)ParticipantRole.Applicant,
                GroupPrimaryContactId = parties1.ResponseObject[0].ParticipantId
            }
        });
        ClaimManager.CreateClaimGroupParticipant(Client, claimGroup1.ResponseObject.ClaimGroupId, new List<ClaimGroupParticipantRequest>
        {
            new()
            {
                ParticipantId = parties1.ResponseObject[1].ParticipantId,
                GroupParticipantRole = (byte)ParticipantRole.Respondent,
                GroupPrimaryContactId = parties1.ResponseObject[1].ParticipantId
            }
        });

        var parties2 = ParticipantManager.CreateParticipant(Client, dispute2.ResponseObject.DisputeGuid, partyRequest);
        var claimGroup2 = ClaimManager.CreateClaimGroup(Client, dispute2.ResponseObject.DisputeGuid);
        ClaimManager.CreateClaimGroupParticipant(Client, claimGroup2.ResponseObject.ClaimGroupId, new List<ClaimGroupParticipantRequest>
        {
            new()
            {
                ParticipantId = parties2.ResponseObject[0].ParticipantId,
                GroupParticipantRole = (byte)ParticipantRole.Applicant,
                GroupPrimaryContactId = parties2.ResponseObject[0].ParticipantId
            }
        });
        ClaimManager.CreateClaimGroupParticipant(Client, claimGroup2.ResponseObject.ClaimGroupId, new List<ClaimGroupParticipantRequest>
        {
            new()
            {
                ParticipantId = parties2.ResponseObject[1].ParticipantId,
                GroupParticipantRole = (byte)ParticipantRole.Respondent,
                GroupPrimaryContactId = parties2.ResponseObject[1].ParticipantId
            }
        });

        var parties3 = ParticipantManager.CreateParticipant(Client, dispute3.ResponseObject.DisputeGuid, partyRequest);
        var claimGroup3 = ClaimManager.CreateClaimGroup(Client, dispute3.ResponseObject.DisputeGuid);
        ClaimManager.CreateClaimGroupParticipant(Client, claimGroup3.ResponseObject.ClaimGroupId, new List<ClaimGroupParticipantRequest>
        {
            new()
            {
                ParticipantId = parties3.ResponseObject[0].ParticipantId,
                GroupParticipantRole = (byte)ParticipantRole.Applicant,
                GroupPrimaryContactId = parties3.ResponseObject[0].ParticipantId
            }
        });
        ClaimManager.CreateClaimGroupParticipant(Client, claimGroup3.ResponseObject.ClaimGroupId, new List<ClaimGroupParticipantRequest>
        {
            new()
            {
                ParticipantId = parties3.ResponseObject[1].ParticipantId,
                GroupParticipantRole = (byte)ParticipantRole.Respondent,
                GroupPrimaryContactId = parties3.ResponseObject[1].ParticipantId
            }
        });

        var disputeFee1 = DisputeFeeManager.CreateDisputeFee(Client, dispute1.ResponseObject.DisputeGuid, new DisputeFeeRequest
        {
            AmountDue = 1,
            IsActive = true,
            FeeType = (byte)DisputeFeeType.Intake,
            PayorId = parties1.ResponseObject[0].ParticipantId
        });
        var disputeFee2 = DisputeFeeManager.CreateDisputeFee(Client, dispute2.ResponseObject.DisputeGuid, new DisputeFeeRequest
        {
            AmountDue = 1,
            IsActive = true,
            FeeType = (byte)DisputeFeeType.Intake,
            PayorId = parties2.ResponseObject[0].ParticipantId
        });
        var disputeFee3 = DisputeFeeManager.CreateDisputeFee(Client, dispute3.ResponseObject.DisputeGuid, new DisputeFeeRequest
        {
            AmountDue = 1,
            IsActive = true,
            FeeType = (byte)DisputeFeeType.Intake,
            PayorId = parties3.ResponseObject[0].ParticipantId
        });

        PaymentManager.CreatePayment(Client, disputeFee1.ResponseObject.DisputeFeeId, new PaymentTransactionRequest
        {
            TransactionMethod = (byte)PaymentMethod.Online
        });
        PaymentManager.CreatePayment(Client, disputeFee2.ResponseObject.DisputeFeeId, new PaymentTransactionRequest
        {
            TransactionMethod = (byte)PaymentMethod.Online
        });
        PaymentManager.CreatePayment(Client, disputeFee3.ResponseObject.DisputeFeeId, new PaymentTransactionRequest
        {
            TransactionMethod = (byte)PaymentMethod.Online
        });

        DisputeManager.CreateDisputeStatus(Client, dispute1.ResponseObject.DisputeGuid, new DisputeStatusPostRequest
        {
            Stage = (byte)DisputeStage.ApplicationInProgress,
            Status = (byte?)DisputeStatuses.SavedNotSubmitted,
            EvidenceOverride = 0
        });
        DisputeManager.CreateDisputeStatus(Client, dispute2.ResponseObject.DisputeGuid, new DisputeStatusPostRequest
        {
            Stage = (byte)DisputeStage.HearingPending,
            Status = (byte?)DisputeStatuses.OpenForSubmissions,
            EvidenceOverride = 0
        });
        DisputeManager.CreateDisputeStatus(Client, dispute3.ResponseObject.DisputeGuid, new DisputeStatusPostRequest
        {
            Stage = (byte)DisputeStage.DecisionAndPostSupport,
            Status = (byte?)DisputeStatuses.Closed,
            EvidenceOverride = 0
        });

        Client.Authenticate(Users.Admin, Users.Admin);
        var userRequest = new UserLoginRequest { AcceptsTextMessages = true, IsActive = true, AdminAccess = true, Username = "newAdmin", Password = "newAdmin-123456", Scheduler = true, SystemUserRoleId = 1 };
        var newAdmin = UserManager.CreateUser(Client, userRequest);
        Client.Authenticate(userRequest.Username, userRequest.Password);

        InternalUserManager.CreateInternalUserRole(Client, newAdmin.ResponseObject.SystemUserId, new InternalUserRoleRequest { IsActive = true, RoleGroupId = (byte)RoleGroup.Arbitrator });

        var conferenceBridge1Request = new ConferenceBridgeRequest
        {
            PreferredOwner = newAdmin.ResponseObject.SystemUserId,
            PreferredStartTime = new DateTime(2012, 12, 12, 9, 30, 0),
            PreferredEndTime = new DateTime(2012, 12, 12, 10, 30, 0),
            DialInNumber1 = "1-800-888-8888",
            DialInDescription1 = "IntSched01 Bridge1",
            ParticipantCode = "1212121#" + DateTime.Now.Second,
            ModeratorCode = "1212129#" + DateTime.Now.Second
        };
        var conferenceBridge1Response = ConferenceBridgeManager.CreateConferenceBridge(Client, conferenceBridge1Request);

        conferenceBridge1Response.CheckStatusCode();

        var pastDate = DateTime.Today.AddYears(-1).AddDays(1);

        var hearing2PastRequest = new HearingRequest
        {
            HearingOwner = newAdmin.ResponseObject.SystemUserId,
            HearingType = (byte)HearingType.ConferenceCall,
            HearingPriority = (byte)HearingPriority.Emergency,
            ConferenceBridgeId = conferenceBridge1Response.ResponseObject.ConferenceBridgeId,
            HearingStartDateTime = new DateTime(pastDate.Year, pastDate.Month, pastDate.Day, 5, 30, 0, DateTimeKind.Utc),
            HearingEndDateTime = new DateTime(pastDate.Year, pastDate.Month, pastDate.Day, 6, 30, 0, DateTimeKind.Utc),
            LocalStartDateTime = new DateTime(pastDate.Year, pastDate.Month, pastDate.Day, 9, 30, 0),
            LocalEndDateTime = new DateTime(pastDate.Year, pastDate.Month, pastDate.Day, 10, 30, 0),
            HearingNote = "Hearing 2 Past"
        };
        var hearing2Past = HearingManager.CreateHearing(Client, hearing2PastRequest);

        var futureDate = DateTime.Today.AddYears(1).AddDays(1);

        var hearing2FutureRequest = new HearingRequest
        {
            HearingOwner = newAdmin.ResponseObject.SystemUserId,
            HearingType = (byte)HearingType.ConferenceCall,
            HearingPriority = (byte)HearingPriority.Emergency,
            ConferenceBridgeId = conferenceBridge1Response.ResponseObject.ConferenceBridgeId,
            HearingStartDateTime = new DateTime(futureDate.Year, futureDate.Month, futureDate.Day, 5, 30, 0, DateTimeKind.Utc),
            HearingEndDateTime = new DateTime(futureDate.Year, futureDate.Month, futureDate.Day, 6, 30, 0, DateTimeKind.Utc),
            LocalStartDateTime = new DateTime(futureDate.Year, futureDate.Month, futureDate.Day, 9, 30, 0),
            LocalEndDateTime = new DateTime(futureDate.Year, futureDate.Month, futureDate.Day, 10, 30, 0),
            HearingNote = "Hearing 2 Future"
        };
        var hearing2Future = HearingManager.CreateHearing(Client, hearing2FutureRequest);

        DisputeHearingManager.CreateDisputeHearing(Client, new DisputeHearingRequest { DisputeGuid = dispute2.ResponseObject.DisputeGuid, HearingId = hearing2Past.ResponseObject.HearingId, DisputeHearingRole = (byte)DisputeHearingRole.Active });
        DisputeHearingManager.CreateDisputeHearing(Client, new DisputeHearingRequest { DisputeGuid = dispute2.ResponseObject.DisputeGuid, HearingId = hearing2Future.ResponseObject.HearingId, DisputeHearingRole = (byte)DisputeHearingRole.Active });

        var fiveDaysAgo = DateTime.Today.AddDays(-5);

        var hearing3PastRequest = new HearingRequest
        {
            HearingOwner = newAdmin.ResponseObject.SystemUserId,
            HearingType = (byte)HearingType.ConferenceCall,
            HearingPriority = (byte)HearingPriority.Emergency,
            ConferenceBridgeId = conferenceBridge1Response.ResponseObject.ConferenceBridgeId,
            HearingStartDateTime = new DateTime(fiveDaysAgo.Year, fiveDaysAgo.Month, fiveDaysAgo.Day, 5, 30, 0, DateTimeKind.Utc),
            HearingEndDateTime = new DateTime(fiveDaysAgo.Year, fiveDaysAgo.Month, fiveDaysAgo.Day, 6, 30, 0, DateTimeKind.Utc),
            LocalStartDateTime = new DateTime(fiveDaysAgo.Year, fiveDaysAgo.Month, fiveDaysAgo.Day, 9, 30, 0),
            LocalEndDateTime = new DateTime(fiveDaysAgo.Year, fiveDaysAgo.Month, fiveDaysAgo.Day, 10, 30, 0),
            HearingNote = "Hearing 3 Past"
        };
        var hearing3Past = HearingManager.CreateHearing(Client, hearing3PastRequest);

        DisputeHearingManager.CreateDisputeHearing(Client, new DisputeHearingRequest
        {
            DisputeGuid = dispute3.ResponseObject.DisputeGuid,
            HearingId = hearing3Past.ResponseObject.HearingId,
            DisputeHearingRole = (byte)DisputeHearingRole.Active
        });

        Client.Authenticate(Users.User, Users.User);

        var disputeListResponse = DisputeManager.GetDisputeList(Client);

        disputeListResponse.ResponseObject.Disputes.Count.Should().Be(3);
        disputeListResponse.ResponseObject.Disputes.ForEach(x => x.PrimaryApplicantAccessCode.Should().NotBeNullOrEmpty());
        var hearing1 = disputeListResponse.ResponseObject.Disputes.FirstOrDefault(x => x.DisputeGuid == dispute2.ResponseObject.DisputeGuid);
        Debug.Assert(hearing1 != null, nameof(hearing1) + " != null");
        hearing1.DisputeHearing.HearingNote.Should().Be("Hearing 2 Future");
        var hearing2 = disputeListResponse.ResponseObject.Disputes.FirstOrDefault(x => x.DisputeGuid == dispute3.ResponseObject.DisputeGuid);
        Debug.Assert(hearing2 != null, nameof(hearing2) + " != null");
        hearing2.DisputeHearing.HearingNote.Should().Be("Hearing 3 Past");
    }
}