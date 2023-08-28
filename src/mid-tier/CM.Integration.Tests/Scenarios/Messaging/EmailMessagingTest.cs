using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Claim;
using CM.Business.Entities.Models.ConferenceBridge;
using CM.Business.Entities.Models.Dispute;
using CM.Business.Entities.Models.DisputeHearing;
using CM.Business.Entities.Models.Hearing;
using CM.Business.Entities.Models.InternalUserRole;
using CM.Business.Entities.Models.Notice;
using CM.Business.Entities.Models.Parties;
using CM.Business.Entities.Models.Payment;
using CM.Business.Entities.Models.User;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;
using CM.Integration.Tests.Fixtures;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Infrastructure;
using CM.Integration.Tests.Utils;
using Npgsql;
using Polly;
using Xunit.Abstractions;

namespace CM.Integration.Tests.Scenarios.Messaging;

public partial class EmailMessagingTest
{
    public EmailMessagingTest(TestContext context, ITestOutputHelper testOutput)
        : base(context, testOutput)
    {
    }

    private UserLoginResponse StaffUser { get; set; }

    private UserLoginResponse ExternalUser { get; set; }

    private ConferenceBridgeResponse ConferenceBridge { get; set; }

    public Task DisposeAsync()
    {
        Thread.Sleep(5000);

        return Task.CompletedTask;
    }

    public Task InitializeAsync()
    {
        using (var conn = new NpgsqlConnection(ConnectionString))
        {
            conn.Open();
            Checkpoint.Reset(conn)
                .Wait();
        }

        SeedData();

        return Task.CompletedTask;
    }

    private DisputeStatusResponse SetDisputeStatus(EntityWithStatus<DisputeResponse> dispute, DisputeStage newStage, DisputeStatuses newStatus)
    {
        var disputeStatusRequest2 = new DisputeStatusPostRequest
        {
            Stage = (byte)newStage,
            Status = (byte)newStatus,
            Process = (byte)DisputeProcess.ParticipatoryHearing
        };

        var disputeStatusResponse2 =
            DisputeManager.CreateDisputeStatus(Client, dispute.ResponseObject.DisputeGuid, disputeStatusRequest2);
        disputeStatusResponse2.CheckStatusCode();

        return disputeStatusResponse2.ResponseObject;
    }

    private void TriggerEmailWithDisputeStatus(
        EntityWithStatus<DisputeResponse> dispute,
        DisputeStage oldStage,
        DisputeStatuses oldStatus,
        DisputeStage newStage,
        DisputeStatuses newStatus,
        DisputeProcess process)
    {
        var disputeStatusRequest1 = new DisputeStatusPostRequest
        {
            Stage = (byte)oldStage,
            Status = (byte)oldStatus,
            Process = (byte)process
        };

        var disputeStatusResponse1 =
            DisputeManager.CreateDisputeStatus(Client, dispute.ResponseObject.DisputeGuid, disputeStatusRequest1);
        disputeStatusResponse1.CheckStatusCode();

        var disputeStatusRequest2 = new DisputeStatusPostRequest
        {
            Stage = (byte)newStage,
            Status = (byte)newStatus,
            Process = (byte)process
        };

        var disputeStatusResponse2 =
            DisputeManager.CreateDisputeStatus(Client, dispute.ResponseObject.DisputeGuid, disputeStatusRequest2);
        disputeStatusResponse2.CheckStatusCode();
    }

    private void SetupJob(string jobName)
    {
        Client.Authenticate(Users.Admin, Users.Admin);
        var response = TestManager.CreateRunJob(Client, jobName);
        response.CheckStatusCode();
    }

    private EntityWithStatus<DisputeResponse> SetupDispute(int userId, DisputeUrgency disputeUrgency = DisputeUrgency.Regular)
    {
        Client.Authenticate(ExternalUser.Username, ExternalUser.Username);

        var dispute = new DisputeRequest
        {
            OwnerSystemUserId = userId,
            DisputeSubType = (byte)DisputeSubType.ApplicantIsLandlord,
            DisputeType = (byte)DisputeType.Rta,
            TenancyAddress = FakerInstance.Address.FullAddress()
                .Truncate(79),
            TenancyCity = FakerInstance.Address.City().Truncate(49),
            TenancyCountry = FakerInstance.Address.Country(),
            TenancyZipPostal = FakerInstance.Address.ZipCode().Truncate(6),
            SubmittedDate = FakerInstance.Date.Past(),
            DisputeUrgency = (byte?)disputeUrgency,
            TenancyGeozoneId = 6,
            CreationMethod = (byte?)DisputeCreationMethod.Online
        };

        var disputeResponse = DisputeManager.CreateDisputeWithData(Client, dispute);
        disputeResponse.CheckStatusCode();
        Client.SetDisputeGuidHeaderToken(disputeResponse.ResponseObject.DisputeGuid);

        return disputeResponse;
    }

    private EntityWithStatus<List<ParticipantResponse>> SetupApplicant(
        EntityWithStatus<DisputeResponse> disputeResponse, bool isPrimaryApplicant, int claimGroupId)
    {
        var participantRequest = new ParticipantRequest
        {
            ParticipantType = (byte)ParticipantType.Business,
            ParticipantStatus = (byte)ParticipantStatus.ValidatedAndParticipating,
            PackageDeliveryMethod = (byte)NoticePackageDeliveryMethod.Email,
            FirstName = FakerInstance.Name.FirstName(),
            LastName = FakerInstance.Name.LastName(),
            Address = FakerInstance.Address.FullAddress()
                .Truncate(125),
            City = FakerInstance.Address.City(),
            ProvinceState = FakerInstance.Address.State(),
            PostalZip = FakerInstance.Address.ZipCode("### ###"),
            Country = "Canada",
            AcceptedTou = true,
            Email = "rtb.dms.test@gmail.com"
        };

        var partyRequest = new List<ParticipantRequest> { participantRequest };
        var participant =
            ParticipantManager.CreateParticipant(Client, disputeResponse.ResponseObject.DisputeGuid, partyRequest);
        participant.CheckStatusCode();

        if (isPrimaryApplicant)
        {
            var firstParticipant = participant.ResponseObject.FirstOrDefault();
            Debug.Assert(firstParticipant != null, nameof(firstParticipant) + " != null");
            SetupClaimGroupParticipant(claimGroupId, firstParticipant.ParticipantId, ParticipantRole.Applicant);
        }

        return participant;
    }

    private void SetupRespondent(EntityWithStatus<DisputeResponse> disputeResponse, bool isPrimaryApplicant, int claimGroupId)
    {
        var participantRequest = new ParticipantRequest
        {
            ParticipantType = (byte)ParticipantType.Individual,
            ParticipantStatus = (byte)ParticipantStatus.ValidatedAndParticipating,
            PackageDeliveryMethod = (byte)NoticePackageDeliveryMethod.Email,
            FirstName = FakerInstance.Name.FirstName(),
            LastName = FakerInstance.Name.LastName(),
            Address = FakerInstance.Address.FullAddress()
                .Truncate(125),
            City = FakerInstance.Address.City(),
            ProvinceState = FakerInstance.Address.State(),
            PostalZip = FakerInstance.Address.ZipCode("### ###"),
            Country = "Canada",
            AcceptedTou = true,
            Email = "rtb.dms.test@gmail.com"
        };

        var partyRequest = new List<ParticipantRequest> { participantRequest };

        var participantResponse =
            ParticipantManager.CreateParticipant(Client, disputeResponse.ResponseObject.DisputeGuid, partyRequest);
        participantResponse.CheckStatusCode();

        if (isPrimaryApplicant)
        {
            var participant = participantResponse.ResponseObject.FirstOrDefault();
            Debug.Assert(participant != null, nameof(participant) + " != null");
            SetupClaimGroupParticipant(claimGroupId, participant.ParticipantId, ParticipantRole.Respondent);
        }
    }

    private void SetupNotice(Guid disputeGuid, int participantId, int hearingId, DateTime? serviceDeadlineDate = null, DateTime? secondServiceDeadlineDate = null)
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        var noticeRequest = new NoticePostRequest
        {
            NoticeDeliveryMethod = (byte)NoticeDeliveryMethods.Email,
            NoticeType = (byte)NoticeTypes.GeneratedDisputeNotice,
            NoticeTitle = "Notice Title",
            NoticeDeliveredTo = participantId,
            HearingId = hearingId,
            NoticeDeliveredDate = DateTime.UtcNow.AddDays(-1),
            HasServiceDeadline = serviceDeadlineDate.HasValue
        };

        if (serviceDeadlineDate.HasValue)
        {
            noticeRequest.ServiceDeadlineDate = serviceDeadlineDate.Value;
        }

        if (secondServiceDeadlineDate.HasValue)
        {
            noticeRequest.SecondServiceDeadlineDate = secondServiceDeadlineDate.Value;
        }

        var noticeResponse = NoticeManager.CreateNotice(Client, disputeGuid, noticeRequest);
        noticeResponse.CheckStatusCode();
    }

    private EntityWithStatus<HearingResponse> SetupHearing(ReminderPeriod reminderPeriod)
    {
        Client.Authenticate(StaffUser.Username, StaffUser.Username);

        var tomorrowDate = DateTime.UtcNow.Date.AddDays((int)reminderPeriod);

        var hearingRequest = new HearingRequest
        {
            HearingOwner = StaffUser.SystemUserId,
            HearingType = (byte)HearingType.ConferenceCall,
            HearingPriority = (byte)HearingPriority.Emergency,
            ConferenceBridgeId = ConferenceBridge.ConferenceBridgeId,
            HearingStartDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 5, 30, 0, DateTimeKind.Utc),
            HearingEndDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 6, 30, 0, DateTimeKind.Utc),
            LocalStartDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 9, 30, 0),
            LocalEndDateTime = new DateTime(tomorrowDate.Year, tomorrowDate.Month, tomorrowDate.Day, 10, 30, 0),
            HearingNote = FakerInstance.Lorem.Sentence(5),
        };

        var hearingResponse = HearingManager.CreateHearing(Client, hearingRequest);
        hearingResponse.CheckStatusCode();

        return hearingResponse;
    }

    private void SetupDisputeHearing(Guid disputeGuid, int hearingId, int conferenceBridgeId, SharedHearingLinkType sharedHearingLinkType = SharedHearingLinkType.Single)
    {
        Client.Authenticate(StaffUser.Username, StaffUser.Username);

        var disputeHearingRequest = new DisputeHearingRequest
        {
            DisputeGuid = disputeGuid,
            HearingId = hearingId,
            DisputeHearingRole = (byte)DisputeHearingRole.Active,
            NoticeConferenceBridgeId = conferenceBridgeId,
            DisputeHearingStatus = (byte)DisputeHearingStatus.Active,
            SharedHearingLinkType = (byte)sharedHearingLinkType
        };

        var disputeHearingResponse = DisputeHearingManager.CreateDisputeHearing(Client, disputeHearingRequest);
        disputeHearingResponse.CheckStatusCode();
    }

    private EntityWithStatus<ClaimGroupResponse> SetupClaimGroup(Guid disputeGuid)
    {
        var claimGroupResponse = ClaimManager.CreateClaimGroup(Client, disputeGuid);
        claimGroupResponse.CheckStatusCode();

        return claimGroupResponse;
    }

    private EntityWithStatus<ClaimResponse> SetupClaim(int claimGroupId)
    {
        var claimResponse = ClaimManager.CreateClaim(Client, claimGroupId, new ClaimRequest { ClaimTitle = "Test", ClaimCode = 208 });
        claimResponse.CheckStatusCode();

        return claimResponse;
    }

    private void SetupClaimGroupParticipant(int claimGroupId, int participantId, ParticipantRole participantRole)
    {
        var claimGroupParticipantRequest = new List<ClaimGroupParticipantRequest>
        {
            new()
            {
                GroupParticipantRole = (byte)participantRole,
                GroupPrimaryContactId = participantId,
                ParticipantId = participantId
            }
        };

        var claimGroupParticipantResponse =
            ClaimManager.CreateClaimGroupParticipant(Client, claimGroupId, claimGroupParticipantRequest);
        claimGroupParticipantResponse.CheckStatusCode();
    }

    private void SetupEvidenceGroup(int claimGroupId)
    {
        var claimRequest = new ClaimRequest();
        var claimResponse = ClaimManager.CreateClaim(Client, claimGroupId, claimRequest);
        claimResponse.CheckStatusCode();
    }

    private void WaitForEmail(Guid disputeGuid)
    {
        var retryPolicy = Policy.Handle<Exception>()
            .WaitAndRetry(new[]
            {
                TimeSpan.FromSeconds(2),
                TimeSpan.FromSeconds(10),
                TimeSpan.FromSeconds(50)
            });

        retryPolicy.Execute(() =>
        {
            var response = EmailMessageManager.GetDisputeEmailMessages(Client, disputeGuid);
            var count = response.ResponseObject.TotalAvailableCount;

            if (count < 1)
            {
                throw new Exception();
            }

            var message = response.ResponseObject.EmailMessages.FirstOrDefault();
            Debug.Assert(message != null, nameof(message) + " != null");
            TestOutput.WriteLine("{0},{1},{2}", message.Retries, message.SendStatus, message.SentDate);
        });
    }

    private EntityWithStatus<DisputeFeeResponse> SetupDisputeFee(Guid disputeGuid, int payorId)
    {
        var disputeFeeRequest = new DisputeFeeRequest
        {
            PayorId = payorId,
            IsActive = true,
            FeeType = (byte)DisputeFeeType.Intake,
            AmountDue = 100,
            FeeDescription = "Description"
        };

        var disputeFeeResponse = DisputeFeeManager.CreateDisputeFee(Client, disputeGuid, disputeFeeRequest);
        disputeFeeResponse.CheckStatusCode();

        return disputeFeeResponse;
    }

    private void SetupPaymentTransaction(int disputeFeeId, int payorId)
    {
        var paymentTransactionRequest = new PaymentTransactionRequest
        {
            TransactionMethod = (byte)PaymentMethod.Office,
            TransactionBy = payorId,
            PaymentStatus = (byte)PaymentStatus.ApprovedOrPaid,
            TransactionAmount = 100
        };

        var paymentTransactionResponse =
            PaymentManager.CreatePayment(Client, disputeFeeId, paymentTransactionRequest);
        paymentTransactionResponse.CheckStatusCode();
    }

    private async void SetDisputeStatusCreatedDate(DisputeStatusResponse disputeStatusResponse)
    {
        var unitOfWork = Context.GetService<IUnitOfWork>();
        var status = await unitOfWork.DisputeStatusRepository.GetByIdAsync(disputeStatusResponse.DisputeStatusId);
        status.StatusStartDate = DateTime.UtcNow.AddDays(-3);
        unitOfWork.DisputeStatusRepository.Update(status);
        var completeResult = await unitOfWork.Complete();
        completeResult.AssertSuccess();
    }

    private void SeedData()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        var staffUserName = FakerInstance.Random.String2(30);

        var staffUserRequest = new UserLoginRequest
        {
            Username = staffUserName,
            Password = staffUserName,
            SystemUserRoleId = (int)Roles.StaffUser,
            Scheduler = true,
            IsActive = true,
            AcceptsTextMessages = true,
            AdminAccess = false
        };

        var staffUser = UserManager.CreateUser(Client, staffUserRequest);
        staffUser.CheckStatusCode();

        StaffUser = staffUser.ResponseObject;

        var staffUserRoleRequest = new InternalUserRoleRequest
        {
            RoleGroupId = (byte)RoleGroup.Arbitrator,
            RoleSubtypeId = (byte)RoleSubType.Level1,
            IsActive = true
        };

        var staffUserRole =
            UserManager.CreateRoleGroup(Client, staffUser.ResponseObject.SystemUserId, staffUserRoleRequest);
        staffUserRole.CheckStatusCode();

        var externalUserName = FakerInstance.Random.String2(30);

        var externalUserRequest = new UserLoginRequest
        {
            Username = externalUserName,
            Password = externalUserName,
            SystemUserRoleId = (int)Roles.ExternalUser,
            Scheduler = false,
            IsActive = true,
            AcceptsTextMessages = true,
            AdminAccess = false
        };

        var externalUser = UserManager.CreateUser(Client, externalUserRequest);
        externalUser.CheckStatusCode();

        ExternalUser = externalUser.ResponseObject;

        Client.Authenticate(StaffUser.Username, StaffUser.Username);

        var conferenceBridgeRequest = new ConferenceBridgeRequest
        {
            PreferredOwner = StaffUser.SystemUserId,
            PreferredStartTime = new DateTime(2012, 12, 12, 9, 30, 0),
            PreferredEndTime = new DateTime(2012, 12, 12, 10, 30, 0),
            DialInNumber1 = FakerInstance.Phone.PhoneNumber("1-800-###-####"),
            DialInDescription1 = FakerInstance.Lorem.Sentence(2),
            ParticipantCode = "1111111#",
            ModeratorCode = "1111119#"
        };

        var conferenceBridgeResponse =
            ConferenceBridgeManager.CreateConferenceBridge(Client, conferenceBridgeRequest);
        conferenceBridgeResponse.CheckStatusCode();
        ConferenceBridge = conferenceBridgeResponse.ResponseObject;
    }
}