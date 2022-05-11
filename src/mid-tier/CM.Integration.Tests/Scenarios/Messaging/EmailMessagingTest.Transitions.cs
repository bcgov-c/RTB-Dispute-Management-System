using System.Diagnostics;
using System.Linq;
using CM.Common.Utilities;
using CM.Integration.Tests.Infrastructure;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Messaging;

[Collection("Fixture")]
public partial class EmailMessagingTest : IntegrationTestBase, IAsyncLifetime
{
    [Fact]
    public void SendEmailUseCase_01_ParticipatoryApplicationSubmitted()
    {
        var hearing = SetupHearing(ReminderPeriod.ParticipatoryHearingReminderPeriod);
        var dispute = SetupDispute(ExternalUser.SystemUserId);
        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        var applicant = SetupApplicant(dispute, true, claimGroup.ResponseObject.ClaimGroupId);
        var singleApplicant = applicant.ResponseObject.FirstOrDefault();
        Debug.Assert(singleApplicant != null, nameof(singleApplicant) + " != null");
        SetupNotice(dispute.ResponseObject.DisputeGuid, singleApplicant.ParticipantId, hearing.ResponseObject.HearingId);
        SetDisputeStatus(dispute, DisputeStage.ApplicationInProgress, DisputeStatuses.UpdateRequired);

        TriggerEmailWithDisputeStatus(
            dispute,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.SavedNotSubmitted,
            DisputeStage.ApplicationScreening,
            DisputeStatuses.Received,
            DisputeProcess.ParticipatoryHearing);

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }

    [Fact]
    public void SendEmailUseCase_03_DisputeAbandonedForNoPaymentWithEmail()
    {
        var dispute = SetupDispute(ExternalUser.SystemUserId);
        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        SetupApplicant(dispute, true, claimGroup.ResponseObject.ClaimGroupId);

        TriggerEmailWithDisputeStatus(
            dispute,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.PaymentRequired,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.AbandonedNoPayment,
            DisputeProcess.ParticipatoryHearing);

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }

    [Fact]
    public void SendEmailUseCase_04_ParticipatoryDisputePaymentWaitingForFeeWaiverProof()
    {
        var dispute = SetupDispute(ExternalUser.SystemUserId);
        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        SetupApplicant(dispute, true, claimGroup.ResponseObject.ClaimGroupId);
        SetupEvidenceGroup(claimGroup.ResponseObject.ClaimGroupId);
        SetDisputeStatus(dispute, DisputeStage.ApplicationInProgress, DisputeStatuses.UpdateRequired);

        TriggerEmailWithDisputeStatus(
            dispute,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.SavedNotSubmitted,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.FeeWaiverProofRequired,
            DisputeProcess.ParticipatoryHearing);

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }

    [Fact]
    public void SendEmailUseCase_05_ParticipatoryDisputeWaitingForOfficePayment()
    {
        var hearing = SetupHearing(ReminderPeriod.ParticipatoryHearingReminderPeriod);
        var dispute = SetupDispute(ExternalUser.SystemUserId);

        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        var applicant = SetupApplicant(dispute, true, claimGroup.ResponseObject.ClaimGroupId);
        var singleApplicant = applicant.ResponseObject.FirstOrDefault();
        Debug.Assert(singleApplicant != null, nameof(singleApplicant) + " != null");
        SetupNotice(dispute.ResponseObject.DisputeGuid, singleApplicant.ParticipantId, hearing.ResponseObject.HearingId);

        SetupEvidenceGroup(claimGroup.ResponseObject.ClaimGroupId);

        SetDisputeStatus(dispute, DisputeStage.ApplicationInProgress, DisputeStatuses.UpdateRequired);

        TriggerEmailWithDisputeStatus(
            dispute,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.SavedNotSubmitted,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.OfficePaymentRequired,
            DisputeProcess.ParticipatoryHearing);

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }

    [Fact]
    public void SendEmailUseCase_08_DisputeWithdrawn()
    {
        var dispute = SetupDispute(ExternalUser.SystemUserId);
        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        SetupApplicant(dispute, true, claimGroup.ResponseObject.ClaimGroupId);
        SetupApplicant(dispute, false, claimGroup.ResponseObject.ClaimGroupId);
        SetupRespondent(dispute, true, claimGroup.ResponseObject.ClaimGroupId);
        SetDisputeStatus(dispute, DisputeStage.ApplicationInProgress, DisputeStatuses.UpdateRequired);

        TriggerEmailWithDisputeStatus(
            dispute,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.SavedNotSubmitted,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.Withdrawn,
            DisputeProcess.ParticipatoryHearing);

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }

    [Fact]
    public void SendEmailUseCase_09_DisputeCancelled()
    {
        var dispute = SetupDispute(ExternalUser.SystemUserId);
        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        SetupApplicant(dispute, true, claimGroup.ResponseObject.ClaimGroupId);
        SetupApplicant(dispute, false, claimGroup.ResponseObject.ClaimGroupId);
        SetupRespondent(dispute, true, claimGroup.ResponseObject.ClaimGroupId);
        SetDisputeStatus(dispute, DisputeStage.ApplicationInProgress, DisputeStatuses.UpdateRequired);

        TriggerEmailWithDisputeStatus(
            dispute,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.SavedNotSubmitted,
            DisputeStage.ApplicationScreening,
            DisputeStatuses.CancelledByRtb,
            DisputeProcess.ParticipatoryHearing);

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }

    [Fact]
    public void SendEmailUseCase_10_ParticipatoryUpdateSubmitted()
    {
        var dispute = SetupDispute(ExternalUser.SystemUserId);
        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        SetupApplicant(dispute, true, claimGroup.ResponseObject.ClaimGroupId);

        TriggerEmailWithDisputeStatus(
            dispute,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.UpdateRequired,
            DisputeStage.ApplicationScreening,
            DisputeStatuses.Received,
            DisputeProcess.ParticipatoryHearing);

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }

    [Fact]
    public void SendEmailUseCase_11_DirectRequestApplicationSubmitted()
    {
        var dispute = SetupDispute(ExternalUser.SystemUserId);
        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        SetupApplicant(dispute, true, claimGroup.ResponseObject.ClaimGroupId);
        SetDisputeStatus(dispute, DisputeStage.ApplicationInProgress, DisputeStatuses.UpdateRequired);

        TriggerEmailWithDisputeStatus(
            dispute,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.SavedNotSubmitted,
            DisputeStage.ApplicationScreening,
            DisputeStatuses.Received,
            DisputeProcess.NonParticipatoryHearing);

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }

    [Fact]
    public void SendEmailUseCase_12_DirectRequestOfficePaymentRequired()
    {
        var hearing = SetupHearing(ReminderPeriod.ParticipatoryHearingReminderPeriod);
        var dispute = SetupDispute(ExternalUser.SystemUserId);

        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        var applicant = SetupApplicant(dispute, true, claimGroup.ResponseObject.ClaimGroupId);

        var singleApplicant = applicant.ResponseObject.FirstOrDefault();
        Debug.Assert(singleApplicant != null, nameof(singleApplicant) + " != null");
        SetupNotice(dispute.ResponseObject.DisputeGuid, singleApplicant.ParticipantId, hearing.ResponseObject.HearingId);
        SetupEvidenceGroup(claimGroup.ResponseObject.ClaimGroupId);
        SetDisputeStatus(dispute, DisputeStage.ApplicationInProgress, DisputeStatuses.UpdateRequired);

        TriggerEmailWithDisputeStatus(
            dispute,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.SavedNotSubmitted,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.OfficePaymentRequired,
            DisputeProcess.NonParticipatoryHearing);

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }

    [Fact]
    public void SendEmailUseCase_13_DirectRequestUpdateSubmitted()
    {
        var dispute = SetupDispute(ExternalUser.SystemUserId);
        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        SetupApplicant(dispute, true, claimGroup.ResponseObject.ClaimGroupId);
        SetupEvidenceGroup(claimGroup.ResponseObject.ClaimGroupId);

        TriggerEmailWithDisputeStatus(
            dispute,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.UpdateRequired,
            DisputeStage.ApplicationScreening,
            DisputeStatuses.Received,
            DisputeProcess.NonParticipatoryHearing);

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }

    [Fact]
    public void SendEmailUseCase_14_PaymentSubmitted()
    {
        var dispute = SetupDispute(ExternalUser.SystemUserId);
        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        var applicant = SetupApplicant(dispute, true, claimGroup.ResponseObject.ClaimGroupId);
        var singleApplicant = applicant.ResponseObject.FirstOrDefault();
        Debug.Assert(singleApplicant != null, nameof(singleApplicant) + " != null");
        var disputeFee = SetupDisputeFee(dispute.ResponseObject.DisputeGuid, singleApplicant.ParticipantId);
        SetupPaymentTransaction(disputeFee.ResponseObject.DisputeFeeId, singleApplicant.ParticipantId);

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }

    [Fact]
    public void SendEmailUseCase_16_IntakeAbandonedNoService()
    {
        var dispute = SetupDispute(ExternalUser.SystemUserId);
        var claimGroup = SetupClaimGroup(dispute.ResponseObject.DisputeGuid);
        SetupApplicant(dispute, true, claimGroup.ResponseObject.ClaimGroupId);
        SetDisputeStatus(dispute, DisputeStage.ApplicationInProgress, DisputeStatuses.UpdateRequired);

        TriggerEmailWithDisputeStatus(
            dispute,
            DisputeStage.ServingDocuments,
            DisputeStatuses.WaitingForProofOfService,
            DisputeStage.ServingDocuments,
            DisputeStatuses.AbandonedApplicantInaction,
            DisputeProcess.ParticipatoryHearing);

        WaitForEmail(dispute.ResponseObject.DisputeGuid);
    }
}