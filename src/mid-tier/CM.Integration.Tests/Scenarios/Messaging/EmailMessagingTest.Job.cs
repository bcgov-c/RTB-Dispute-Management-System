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
}