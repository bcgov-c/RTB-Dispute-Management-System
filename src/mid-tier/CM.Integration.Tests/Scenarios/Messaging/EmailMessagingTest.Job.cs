using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Messaging;

public partial class EmailMessagingTest
{
    [Fact]
    public void SendEmailUseCase_02_Job_ParticipatoryHearingReminder()
    {
        var hearing = SetupHearing(ReminderPeriod.ParticipatoryHearingReminderPeriod);
        var dispute = SetupDispute(ExternalUser.SystemUserId);
        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        SetupApplicant(dispute, true, claimGroup.ResponseObject.ClaimGroupId);
        SetupRespondent(dispute, true, claimGroup.ResponseObject.ClaimGroupId);
        SetupDisputeHearing(dispute.ResponseObject.DisputeGuid, hearing.ResponseObject.HearingId, ConferenceBridge.ConferenceBridgeId);
        SetupJob("HearingReminderJob");

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }

    [Fact]
    public void SendEmailUseCase_03_Job_DisputeAbandonedForNoPaymentWithEmail()
    {
        var dispute = SetupDispute(ExternalUser.SystemUserId);
        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        SetupApplicant(dispute, true, claimGroup.ResponseObject.ClaimGroupId);

        var disputeStatus = SetDisputeStatus(dispute, DisputeStage.ApplicationInProgress, DisputeStatuses.PaymentRequired);
        SetDisputeStatusCreatedDate(disputeStatus);
        SetupJob("DisputeAbandonedForNoPaymentJob");

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }

    [Fact]
    public void SendEmailUseCase_06_Job_ParticipatoryApplicantEvidenceReminder()
    {
        var hearing = SetupHearing(ReminderPeriod.ParticipatoryApplicantEvidenceReminderPeriod);
        var dispute = SetupDispute(ExternalUser.SystemUserId);
        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        SetupApplicant(dispute, true, claimGroup.ResponseObject.ClaimGroupId);
        SetupDisputeHearing(dispute.ResponseObject.DisputeGuid, hearing.ResponseObject.HearingId, ConferenceBridge.ConferenceBridgeId);
        SetDisputeStatus(dispute, DisputeStage.ApplicationInProgress, DisputeStatuses.UpdateRequired);

        SetupJob("ApplicantEvidenceReminderJob");

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }

    [Fact]
    public void SendEmailUseCase_07_Job_ParticipatoryRespondentEvidenceReminder()
    {
        var hearing = SetupHearing(ReminderPeriod.ParticipatoryRespondentEvidenceReminderPeriod);
        var dispute = SetupDispute(StaffUser.SystemUserId);
        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        SetupRespondent(dispute, true, claimGroup.ResponseObject.ClaimGroupId);
        SetupDisputeHearing(dispute.ResponseObject.DisputeGuid, hearing.ResponseObject.HearingId, ConferenceBridge.ConferenceBridgeId);
        SetDisputeStatus(dispute, DisputeStage.ApplicationInProgress, DisputeStatuses.UpdateRequired);

        SetupJob("RespondentEvidenceReminderJob");

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }

    [Fact]
    public void SendEmailUseCase_26_Job_EmergencyParticipatoryRespondentReminder()
    {
        var hearing = SetupHearing(ReminderPeriod.ParticipatoryEmergRespondentEvidenceReminderPeriod);
        var dispute = SetupDispute(StaffUser.SystemUserId, DisputeUrgency.Emergency);
        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        SetupRespondent(dispute, true, claimGroup.ResponseObject.ClaimGroupId);
        SetupDisputeHearing(dispute.ResponseObject.DisputeGuid, hearing.ResponseObject.HearingId, ConferenceBridge.ConferenceBridgeId);
        SetDisputeStatus(dispute, DisputeStage.ApplicationInProgress, DisputeStatuses.UpdateRequired);

        SetupJob("RespondentEmergEvidenceReminderJob");

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }

    [Fact]
    public void SendEmailUseCase_29_Job_ArsDeclarationDeadlineReminder()
    {
        var dispute = SetupDispute(StaffUser.SystemUserId, DisputeUrgency.Emergency);
        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        var participant = SetupApplicant(dispute, true, claimGroup.ResponseObject.ClaimGroupId);
        var hearing = SetupHearing(ReminderPeriod.ParticipatoryHearingReminderPeriod);

        var serviceDeadlineDate = DateTime.UtcNow.AddHours(49);
        SetupNotice(dispute.ResponseObject.DisputeGuid,
                    participant.ResponseObject.FirstOrDefault().ParticipantId,
                    hearing.ResponseObject.HearingId,
                    serviceDeadlineDate);

        SetDisputeStatus(dispute, DisputeStage.ServingDocuments, DisputeStatuses.WaitingForProofOfService);

        SetupJob("ArsDeclarationDeadlineReminderJob");

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }

    [Fact]
    public void SendEmailUseCase_30_Job_ArsDeclarationDeadlineMissed()
    {
        var dispute = SetupDispute(StaffUser.SystemUserId, DisputeUrgency.Emergency);
        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        var participant = SetupApplicant(dispute, true, claimGroup.ResponseObject.ClaimGroupId);
        var hearing = SetupHearing(ReminderPeriod.ParticipatoryHearingReminderPeriod);

        var serviceDeadlineDate = DateTime.UtcNow.AddHours(-47);
        SetupNotice(dispute.ResponseObject.DisputeGuid,
                    participant.ResponseObject.FirstOrDefault().ParticipantId,
                    hearing.ResponseObject.HearingId,
                    serviceDeadlineDate);
        SetDisputeStatus(dispute, DisputeStage.ServingDocuments, DisputeStatuses.WaitingForProofOfService);

        SetupJob("ArsDeclarationDeadlineMissedJob");

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }

    [Fact]
    public void SendEmailUseCase_31_Job_ArsReinstatementDeadlineReminder()
    {
        var serviceDeadlineDate = DateTime.UtcNow.AddHours(-47);
        var secondServiceDeadlineDate = DateTime.UtcNow.AddHours(49);

        var dispute = SetupDispute(StaffUser.SystemUserId, DisputeUrgency.Emergency);
        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        var participant = SetupApplicant(dispute, true, claimGroup.ResponseObject.ClaimGroupId);
        var hearing = SetupHearing(ReminderPeriod.ParticipatoryHearingReminderPeriod);
        SetupNotice(dispute.ResponseObject.DisputeGuid,
                    participant.ResponseObject.FirstOrDefault().ParticipantId,
                    hearing.ResponseObject.HearingId,
                    serviceDeadlineDate,
                    secondServiceDeadlineDate);
        SetDisputeStatus(dispute, DisputeStage.ServingDocuments, DisputeStatuses.Dismissed);

        SetupJob("ArsReinstatementDeadlineReminderJob");

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }

    [Fact]
    public async void SendEmailUseCase_32_Job_ArsReinstatementDeadlineMissed()
    {
        var dispute = SetupDispute(StaffUser.SystemUserId, DisputeUrgency.Emergency);
        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        var participant = SetupApplicant(dispute, true, claimGroup.ResponseObject.ClaimGroupId);
        var hearing = SetupHearing(ReminderPeriod.ParticipatoryHearingReminderPeriod);

        var serviceDeadlineDate = DateTime.UtcNow.AddHours(-47);
        var secondServiceDeadlineDate = DateTime.UtcNow.AddSeconds(20);
        SetupNotice(dispute.ResponseObject.DisputeGuid,
                    participant.ResponseObject.FirstOrDefault().ParticipantId,
                    hearing.ResponseObject.HearingId,
                    serviceDeadlineDate,
                    secondServiceDeadlineDate);

        SetDisputeStatus(dispute, DisputeStage.ApplicationScreening, DisputeStatuses.UpdateRequired);
        SetDisputeStatus(dispute, DisputeStage.ServingDocuments, DisputeStatuses.Dismissed);
        await Task.Delay(TimeSpan.FromSeconds(50));
        SetupJob("ArsReinstatementDeadlineMissedJob");

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }

    [Fact]
    public void SendEmailUseCase_01_Job_MhvAppCnFirstSchedule()
    {
        var dispute = SetupDispute(StaffUser.SystemUserId, DisputeUrgency.Regular);
        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        var claim = SetupClaim(claimGroup.ResponseObject.ClaimGroupId);
        var participant = SetupApplicant(dispute, true, claimGroup.ResponseObject.ClaimGroupId);
        var hearing = SetupHearing(ReminderPeriod.MhvAppCnFirstScheduleReminderPeriod);
        SetupDisputeHearing(dispute.ResponseObject.DisputeGuid,
            hearing.ResponseObject.HearingId,
            ConferenceBridge.ConferenceBridgeId,
            SharedHearingLinkType.Single);

        var serviceDeadlineDate = DateTime.UtcNow;
        SetupNotice(dispute.ResponseObject.DisputeGuid,
                    participant.ResponseObject.FirstOrDefault().ParticipantId,
                    hearing.ResponseObject.HearingId,
                    serviceDeadlineDate);

        SetDisputeStatus(dispute, DisputeStage.HearingPending, DisputeStatuses.OpenForSubmissions);

        SetupJob("MhvAppCnFirstScheduleJob");

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }

    [Fact]
    public void SendEmailUseCase_02_Job_MhvAppNotLinkedFirstSchedule()
    {
        var dispute = SetupDispute(StaffUser.SystemUserId, DisputeUrgency.Regular);
        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        var claim = SetupClaim(claimGroup.ResponseObject.ClaimGroupId);
        var participant = SetupApplicant(dispute, true, claimGroup.ResponseObject.ClaimGroupId);
        var hearing = SetupHearing(ReminderPeriod.MhvAppNotLinkedFirstScheduleReminderPeriod);
        SetupDisputeHearing(dispute.ResponseObject.DisputeGuid,
                            hearing.ResponseObject.HearingId,
                            ConferenceBridge.ConferenceBridgeId,
                            SharedHearingLinkType.Single);

        var serviceDeadlineDate = DateTime.UtcNow;
        SetupNotice(dispute.ResponseObject.DisputeGuid,
                    participant.ResponseObject.FirstOrDefault().ParticipantId,
                    hearing.ResponseObject.HearingId,
                    serviceDeadlineDate);

        SetDisputeStatus(dispute, DisputeStage.HearingPending, DisputeStatuses.OpenForSubmissions);

        SetupJob("MhvAppNotLinkedFirstScheduleJob");

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }

    [Fact]
    public void SendEmailUseCase_03_Job_MhvAppLinkedFirstSchedule()
    {
        var dispute = SetupDispute(StaffUser.SystemUserId, DisputeUrgency.Regular);
        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        var claim = SetupClaim(claimGroup.ResponseObject.ClaimGroupId);
        var participant = SetupApplicant(dispute, true, claimGroup.ResponseObject.ClaimGroupId);
        var hearing = SetupHearing(ReminderPeriod.MhvAppLinkedFirstScheduleReminderPeriod);
        SetupDisputeHearing(dispute.ResponseObject.DisputeGuid,
                            hearing.ResponseObject.HearingId,
                            ConferenceBridge.ConferenceBridgeId,
                            SharedHearingLinkType.Cross);

        var serviceDeadlineDate = DateTime.UtcNow;
        SetupNotice(dispute.ResponseObject.DisputeGuid,
                    participant.ResponseObject.FirstOrDefault().ParticipantId,
                    hearing.ResponseObject.HearingId,
                    serviceDeadlineDate);

        SetDisputeStatus(dispute, DisputeStage.HearingPending, DisputeStatuses.OpenForSubmissions);

        SetupJob("MhvAppLinkedFirstScheduleJob");

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }

    [Fact]
    public void SendEmailUseCase_04_Job_MhvAppCnFinalSchedule()
    {
        var dispute = SetupDispute(StaffUser.SystemUserId, DisputeUrgency.Regular);
        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        var claim = SetupClaim(claimGroup.ResponseObject.ClaimGroupId);
        var participant = SetupApplicant(dispute, true, claimGroup.ResponseObject.ClaimGroupId);
        var hearing = SetupHearing(ReminderPeriod.MhvAppCnFinalScheduleReminderPeriod);
        SetupDisputeHearing(dispute.ResponseObject.DisputeGuid,
                            hearing.ResponseObject.HearingId,
                            ConferenceBridge.ConferenceBridgeId,
                            SharedHearingLinkType.Single);

        var serviceDeadlineDate = DateTime.UtcNow;
        SetupNotice(dispute.ResponseObject.DisputeGuid,
                    participant.ResponseObject.FirstOrDefault().ParticipantId,
                    hearing.ResponseObject.HearingId,
                    serviceDeadlineDate);

        SetDisputeStatus(dispute, DisputeStage.HearingPending, DisputeStatuses.OpenForSubmissions);

        SetupJob("MhvAppCnFinalScheduleJob");

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }

    [Fact]
    public void SendEmailUseCase_05_Job_MhvAppNotLinkedFinalSchedule()
    {
        var dispute = SetupDispute(StaffUser.SystemUserId, DisputeUrgency.Regular);
        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        var claim = SetupClaim(claimGroup.ResponseObject.ClaimGroupId);
        var participant = SetupApplicant(dispute, true, claimGroup.ResponseObject.ClaimGroupId);
        var hearing = SetupHearing(ReminderPeriod.MhvAppNotLinkedFinalScheduleReminderPeriod);
        SetupDisputeHearing(dispute.ResponseObject.DisputeGuid,
            hearing.ResponseObject.HearingId,
            ConferenceBridge.ConferenceBridgeId,
            SharedHearingLinkType.Single);

        var serviceDeadlineDate = DateTime.UtcNow;
        SetupNotice(dispute.ResponseObject.DisputeGuid,
                    participant.ResponseObject.FirstOrDefault().ParticipantId,
                    hearing.ResponseObject.HearingId,
                    serviceDeadlineDate);

        SetDisputeStatus(dispute, DisputeStage.HearingPending, DisputeStatuses.OpenForSubmissions);

        SetupJob("MhvAppNotLinkedFinalScheduleJob");

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }

    [Fact]
    public void SendEmailUseCase_06_Job_MhvAppLinkedFinalSchedule()
    {
        var dispute = SetupDispute(StaffUser.SystemUserId, DisputeUrgency.Regular);
        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        var claim = SetupClaim(claimGroup.ResponseObject.ClaimGroupId);
        var participant = SetupApplicant(dispute, true, claimGroup.ResponseObject.ClaimGroupId);
        var hearing = SetupHearing(ReminderPeriod.MhvAppLinkedFinalScheduleReminderPeriod);
        SetupDisputeHearing(dispute.ResponseObject.DisputeGuid,
            hearing.ResponseObject.HearingId,
            ConferenceBridge.ConferenceBridgeId,
            SharedHearingLinkType.Cross);

        var serviceDeadlineDate = DateTime.UtcNow;
        SetupNotice(dispute.ResponseObject.DisputeGuid,
                    participant.ResponseObject.FirstOrDefault().ParticipantId,
                    hearing.ResponseObject.HearingId,
                    serviceDeadlineDate);

        SetDisputeStatus(dispute, DisputeStage.HearingPending, DisputeStatuses.OpenForSubmissions);

        SetupJob("MhvAppLinkedFinalScheduleJob");

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }
}