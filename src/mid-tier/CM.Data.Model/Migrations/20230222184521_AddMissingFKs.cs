using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class AddMissingFKs : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Amendments_FileDescriptions_AmendFileDescriptionId",
                table: "Amendments");

            migrationBuilder.DropForeignKey(
                name: "FK_Amendments_Notices_NoticeId",
                table: "Amendments");

            migrationBuilder.DropForeignKey(
                name: "FK_ClaimDetails_Claims_ClaimId",
                table: "ClaimDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_ClaimGroupParticipants_ClaimGroups_ClaimGroupId",
                table: "ClaimGroupParticipants");

            migrationBuilder.DropForeignKey(
                name: "FK_Claims_ClaimGroups_ClaimGroupId",
                table: "Claims");

            migrationBuilder.DropForeignKey(
                name: "FK_DisputeUsers_Participants_ParticipantId",
                table: "DisputeUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_DisputeUsers_SystemUsers_SystemUserId",
                table: "DisputeUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_EmailAttachments_CommonFiles_CommonFileId",
                table: "EmailAttachments");

            migrationBuilder.DropForeignKey(
                name: "FK_EmailAttachments_EmailMessages_EmailMessageId",
                table: "EmailAttachments");

            migrationBuilder.DropForeignKey(
                name: "FK_EmailAttachments_Files_FileId",
                table: "EmailAttachments");

            migrationBuilder.DropForeignKey(
                name: "FK_EmailMessages_Participants_ParticipantId",
                table: "EmailMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_ExternalFiles_ExternalCustomDataObjects_ExternalCustomDataO~",
                table: "ExternalFiles");

            migrationBuilder.DropForeignKey(
                name: "FK_FileDescriptions_Claims_ClaimId",
                table: "FileDescriptions");

            migrationBuilder.DropForeignKey(
                name: "FK_FileDescriptions_Remedies_RemedyId",
                table: "FileDescriptions");

            migrationBuilder.DropForeignKey(
                name: "FK_FilePackages_Disputes_DisputeId",
                table: "FilePackages");

            migrationBuilder.DropForeignKey(
                name: "FK_FilePackages_Participants_CreatedParticipantParticipantId",
                table: "FilePackages");

            migrationBuilder.DropForeignKey(
                name: "FK_FilePackageServices_FileDescriptions_OtherProofFileDescript~",
                table: "FilePackageServices");

            migrationBuilder.DropForeignKey(
                name: "FK_FilePackageServices_FileDescriptions_ProofFileDescriptionId",
                table: "FilePackageServices");

            migrationBuilder.DropForeignKey(
                name: "FK_FilePackageServices_FilePackages_FilePackageId",
                table: "FilePackageServices");

            migrationBuilder.DropForeignKey(
                name: "FK_Files_FilePackages_FilePackageId",
                table: "Files");

            migrationBuilder.DropForeignKey(
                name: "FK_HearingParticipations_Hearings_HearingId",
                table: "HearingParticipations");

            migrationBuilder.DropForeignKey(
                name: "FK_HearingParticipations_Participants_ParticipantId",
                table: "HearingParticipations");

            migrationBuilder.DropForeignKey(
                name: "FK_Hearings_ConferenceBridges_ConferenceBridgeId",
                table: "Hearings");

            migrationBuilder.DropForeignKey(
                name: "FK_LinkedFiles_FileDescriptions_FileDescriptionId",
                table: "LinkedFiles");

            migrationBuilder.DropForeignKey(
                name: "FK_LinkedFiles_Files_FileId",
                table: "LinkedFiles");

            migrationBuilder.DropForeignKey(
                name: "FK_Notices_ConferenceBridges_ConferenceBridgeId",
                table: "Notices");

            migrationBuilder.DropForeignKey(
                name: "FK_Notices_FileDescriptions_NoticeFileDescriptionId",
                table: "Notices");

            migrationBuilder.DropForeignKey(
                name: "FK_Notices_Hearings_HearingId",
                table: "Notices");

            migrationBuilder.DropForeignKey(
                name: "FK_Notices_Notices_ParentNoticeId",
                table: "Notices");

            migrationBuilder.DropForeignKey(
                name: "FK_NoticeServices_FileDescriptions_OtherProofFileDescriptionId",
                table: "NoticeServices");

            migrationBuilder.DropForeignKey(
                name: "FK_NoticeServices_FileDescriptions_ProofFileDescriptionId",
                table: "NoticeServices");

            migrationBuilder.DropForeignKey(
                name: "FK_NoticeServices_Notices_NoticeId",
                table: "NoticeServices");

            migrationBuilder.DropForeignKey(
                name: "FK_OutcomeDocContents_OutcomeDocFiles_OutcomeDocFileId",
                table: "OutcomeDocContents");

            migrationBuilder.DropForeignKey(
                name: "FK_OutcomeDocDeliveries_OutcomeDocFiles_OutcomeDocFileId",
                table: "OutcomeDocDeliveries");

            migrationBuilder.DropForeignKey(
                name: "FK_OutcomeDocDeliveries_Participants_ParticipantId",
                table: "OutcomeDocDeliveries");

            migrationBuilder.DropForeignKey(
                name: "FK_OutcomeDocFiles_Files_FileId",
                table: "OutcomeDocFiles");

            migrationBuilder.DropForeignKey(
                name: "FK_OutcomeDocFiles_OutcomeDocGroups_OutcomeDocGroupId",
                table: "OutcomeDocFiles");

            migrationBuilder.DropForeignKey(
                name: "FK_OutcomeDocReqItems_OutcomeDocRequests_OutcomeDocRequestId",
                table: "OutcomeDocReqItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Participants_SystemUsers_SystemUserId",
                table: "Participants");

            migrationBuilder.DropForeignKey(
                name: "FK_PaymentTransactions_DisputeFees_DisputeFeeId",
                table: "PaymentTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Remedies_Claims_ClaimId",
                table: "Remedies");

            migrationBuilder.DropForeignKey(
                name: "FK_RemedyDetails_Remedies_RemedyId",
                table: "RemedyDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_ScheduleRequests_SystemUsers_SystemUserId",
                table: "ScheduleRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_SubstitutedServices_FileDescriptions_FailedMethod1FileDescId",
                table: "SubstitutedServices");

            migrationBuilder.DropForeignKey(
                name: "FK_SubstitutedServices_FileDescriptions_FailedMethod2FileDescId",
                table: "SubstitutedServices");

            migrationBuilder.DropForeignKey(
                name: "FK_SubstitutedServices_FileDescriptions_FailedMethod3FileDescId",
                table: "SubstitutedServices");

            migrationBuilder.DropForeignKey(
                name: "FK_SubstitutedServices_FileDescriptions_RequestMethodFileDescId",
                table: "SubstitutedServices");

            migrationBuilder.DropForeignKey(
                name: "FK_SubstitutedServices_Participants_ServiceByParticipantId",
                table: "SubstitutedServices");

            migrationBuilder.DropForeignKey(
                name: "FK_SubstitutedServices_Participants_ServiceToParticipantId",
                table: "SubstitutedServices");

            migrationBuilder.DropForeignKey(
                name: "FK_SubstitutedServices_SystemUsers_SubServiceApprovedById",
                table: "SubstitutedServices");

            migrationBuilder.DropForeignKey(
                name: "FK_SystemUsers_SystemUserRoles_SystemUserRoleId",
                table: "SystemUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_TrialDisputes_Trials_TrialGuid",
                table: "TrialDisputes");

            migrationBuilder.DropForeignKey(
                name: "FK_TrialInterventions_Trials_TrialGuid",
                table: "TrialInterventions");

            migrationBuilder.DropForeignKey(
                name: "FK_TrialOutcomes_Trials_TrialGuid",
                table: "TrialOutcomes");

            migrationBuilder.DropForeignKey(
                name: "FK_TrialParticipants_Trials_TrialGuid",
                table: "TrialParticipants");

            migrationBuilder.DropIndex(
                name: "IX_ScheduleRequests_SystemUserId",
                table: "ScheduleRequests");

            migrationBuilder.DropIndex(
                name: "IX_FilePackages_CreatedParticipantParticipantId",
                table: "FilePackages");

            migrationBuilder.DropIndex(
                name: "IX_FilePackages_DisputeId",
                table: "FilePackages");

            migrationBuilder.DropColumn(
                name: "SystemUserId",
                table: "ScheduleRequests");

            migrationBuilder.DropColumn(
                name: "CreatedParticipantParticipantId",
                table: "FilePackages");

            migrationBuilder.DropColumn(
                name: "DisputeId",
                table: "FilePackages");

            migrationBuilder.CreateIndex(
                name: "IX_Trials_AssociatedTrialGuid",
                table: "Trials",
                column: "AssociatedTrialGuid");

            migrationBuilder.CreateIndex(
                name: "IX_TrialParticipants_ParticipantId",
                table: "TrialParticipants",
                column: "ParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_TrialParticipants_SystemUserId",
                table: "TrialParticipants",
                column: "SystemUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TrialOutcomes_TrialInterventionGuid",
                table: "TrialOutcomes",
                column: "TrialInterventionGuid");

            migrationBuilder.CreateIndex(
                name: "IX_TrialOutcomes_TrialParticipantGuid",
                table: "TrialOutcomes",
                column: "TrialParticipantGuid");

            migrationBuilder.CreateIndex(
                name: "IX_TrialDisputes_DisputeOptedInByParticipantId",
                table: "TrialDisputes",
                column: "DisputeOptedInByParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_TrialDisputes_DisputeOptedInByStaffId",
                table: "TrialDisputes",
                column: "DisputeOptedInByStaffId");

            migrationBuilder.CreateIndex(
                name: "IX_SubmissionReceipts_ParticipantId",
                table: "SubmissionReceipts",
                column: "ParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceAuditLogs_FilePackageServiceId",
                table: "ServiceAuditLogs",
                column: "FilePackageServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceAuditLogs_NoticeServiceId",
                table: "ServiceAuditLogs",
                column: "NoticeServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceAuditLogs_OtherProofFileDescriptionId",
                table: "ServiceAuditLogs",
                column: "OtherProofFileDescriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceAuditLogs_ParticipantId",
                table: "ServiceAuditLogs",
                column: "ParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceAuditLogs_ProofFileDescriptionId",
                table: "ServiceAuditLogs",
                column: "ProofFileDescriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceAuditLogs_ServiceBy",
                table: "ServiceAuditLogs",
                column: "ServiceBy");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleRequests_RequestOwnerId",
                table: "ScheduleRequests",
                column: "RequestOwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleRequests_RequestSubmitter",
                table: "ScheduleRequests",
                column: "RequestSubmitter");

            migrationBuilder.CreateIndex(
                name: "IX_Remedies_PrevAwardBy",
                table: "Remedies",
                column: "PrevAwardBy");

            migrationBuilder.CreateIndex(
                name: "IX_OutcomeDocRequests_FileDescriptionId",
                table: "OutcomeDocRequests",
                column: "FileDescriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_OutcomeDocRequests_OutcomeDocGroupId",
                table: "OutcomeDocRequests",
                column: "OutcomeDocGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_OutcomeDocReqItems_FileDescriptionId",
                table: "OutcomeDocReqItems",
                column: "FileDescriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_OutcomeDocDeliveries_AssociatedEmailId",
                table: "OutcomeDocDeliveries",
                column: "AssociatedEmailId");

            migrationBuilder.CreateIndex(
                name: "IX_NoticeServices_ArchivedBy",
                table: "NoticeServices",
                column: "ArchivedBy");

            migrationBuilder.CreateIndex(
                name: "IX_NoticeServices_ArchiveServedBy",
                table: "NoticeServices",
                column: "ArchiveServedBy");

            migrationBuilder.CreateIndex(
                name: "IX_NoticeServices_ServedBy",
                table: "NoticeServices",
                column: "ServedBy");

            migrationBuilder.CreateIndex(
                name: "IX_InternalUserRoles_ManagedById",
                table: "InternalUserRoles",
                column: "ManagedById");

            migrationBuilder.CreateIndex(
                name: "IX_Hearings_HearingReservedById",
                table: "Hearings",
                column: "HearingReservedById");

            migrationBuilder.CreateIndex(
                name: "IX_Hearings_HearingReservedDisputeGuid",
                table: "Hearings",
                column: "HearingReservedDisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_Hearings_NotificationFileDescriptionId",
                table: "Hearings",
                column: "NotificationFileDescriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_HearingParticipations_ParticipationStatusBy",
                table: "HearingParticipations",
                column: "ParticipationStatusBy");

            migrationBuilder.CreateIndex(
                name: "IX_HearingParticipations_PreParticipationStatusBy",
                table: "HearingParticipations",
                column: "PreParticipationStatusBy");

            migrationBuilder.CreateIndex(
                name: "IX_FilePackageServices_ArchivedBy",
                table: "FilePackageServices",
                column: "ArchivedBy");

            migrationBuilder.CreateIndex(
                name: "IX_FilePackageServices_ArchiveServedBy",
                table: "FilePackageServices",
                column: "ArchiveServedBy");

            migrationBuilder.CreateIndex(
                name: "IX_FilePackages_CreatedBy",
                table: "FilePackages",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_ExternalErrorLogs_DisputeGuid",
                table: "ExternalErrorLogs",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_ExternalErrorLogs_ErrorOwner",
                table: "ExternalErrorLogs",
                column: "ErrorOwner");

            migrationBuilder.CreateIndex(
                name: "IX_Disputes_InitialPaymentBy",
                table: "Disputes",
                column: "InitialPaymentBy");

            migrationBuilder.CreateIndex(
                name: "IX_Disputes_OriginalNoticeId",
                table: "Disputes",
                column: "OriginalNoticeId");

            migrationBuilder.CreateIndex(
                name: "IX_Disputes_SubmittedBy",
                table: "Disputes",
                column: "SubmittedBy");

            migrationBuilder.CreateIndex(
                name: "IX_DisputeFlags_FlagOwnerId",
                table: "DisputeFlags",
                column: "FlagOwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_DisputeFlags_FlagParticipantId",
                table: "DisputeFlags",
                column: "FlagParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_DisputeFees_PayorId",
                table: "DisputeFees",
                column: "PayorId");

            migrationBuilder.CreateIndex(
                name: "IX_BulkEmailRecipients_RecipientParticipantId",
                table: "BulkEmailRecipients",
                column: "RecipientParticipantId");

            migrationBuilder.AddForeignKey(
                name: "FK_Amendments_FileDescriptions_AmendFileDescriptionId",
                table: "Amendments",
                column: "AmendFileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Amendments_Notices_NoticeId",
                table: "Amendments",
                column: "NoticeId",
                principalTable: "Notices",
                principalColumn: "NoticeId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AuditLogs_Disputes_DisputeGuid",
                table: "AuditLogs",
                column: "DisputeGuid",
                principalTable: "Disputes",
                principalColumn: "DisputeGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_BulkEmailRecipients_Participants_RecipientParticipantId",
                table: "BulkEmailRecipients",
                column: "RecipientParticipantId",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ClaimDetails_Claims_ClaimId",
                table: "ClaimDetails",
                column: "ClaimId",
                principalTable: "Claims",
                principalColumn: "ClaimId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ClaimGroupParticipants_ClaimGroups_ClaimGroupId",
                table: "ClaimGroupParticipants",
                column: "ClaimGroupId",
                principalTable: "ClaimGroups",
                principalColumn: "ClaimGroupId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ClaimGroupParticipants_Participants_GroupPrimaryContactId",
                table: "ClaimGroupParticipants",
                column: "GroupPrimaryContactId",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Claims_ClaimGroups_ClaimGroupId",
                table: "Claims",
                column: "ClaimGroupId",
                principalTable: "ClaimGroups",
                principalColumn: "ClaimGroupId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DisputeFees_Participants_PayorId",
                table: "DisputeFees",
                column: "PayorId",
                principalTable: "Participants",
                principalColumn: "ParticipantId");

            migrationBuilder.AddForeignKey(
                name: "FK_DisputeFlags_Participants_FlagParticipantId",
                table: "DisputeFlags",
                column: "FlagParticipantId",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DisputeFlags_SystemUsers_FlagOwnerId",
                table: "DisputeFlags",
                column: "FlagOwnerId",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Disputes_Notices_OriginalNoticeId",
                table: "Disputes",
                column: "OriginalNoticeId",
                principalTable: "Notices",
                principalColumn: "NoticeId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Disputes_Participants_InitialPaymentBy",
                table: "Disputes",
                column: "InitialPaymentBy",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Disputes_Participants_SubmittedBy",
                table: "Disputes",
                column: "SubmittedBy",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DisputeUsers_Participants_ParticipantId",
                table: "DisputeUsers",
                column: "ParticipantId",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DisputeUsers_SystemUsers_SystemUserId",
                table: "DisputeUsers",
                column: "SystemUserId",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EmailAttachments_CommonFiles_CommonFileId",
                table: "EmailAttachments",
                column: "CommonFileId",
                principalTable: "CommonFiles",
                principalColumn: "CommonFileId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EmailAttachments_EmailMessages_EmailMessageId",
                table: "EmailAttachments",
                column: "EmailMessageId",
                principalTable: "EmailMessages",
                principalColumn: "EmailMessageId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EmailAttachments_Files_FileId",
                table: "EmailAttachments",
                column: "FileId",
                principalTable: "Files",
                principalColumn: "FileId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EmailMessages_Participants_ParticipantId",
                table: "EmailMessages",
                column: "ParticipantId",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ExternalErrorLogs_Disputes_DisputeGuid",
                table: "ExternalErrorLogs",
                column: "DisputeGuid",
                principalTable: "Disputes",
                principalColumn: "DisputeGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ExternalErrorLogs_SystemUsers_ErrorOwner",
                table: "ExternalErrorLogs",
                column: "ErrorOwner",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ExternalFiles_ExternalCustomDataObjects_ExternalCustomDataO~",
                table: "ExternalFiles",
                column: "ExternalCustomDataObjectId",
                principalTable: "ExternalCustomDataObjects",
                principalColumn: "ExternalCustomDataObjectId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FileDescriptions_Claims_ClaimId",
                table: "FileDescriptions",
                column: "ClaimId",
                principalTable: "Claims",
                principalColumn: "ClaimId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FileDescriptions_Remedies_RemedyId",
                table: "FileDescriptions",
                column: "RemedyId",
                principalTable: "Remedies",
                principalColumn: "RemedyId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FilePackages_Disputes_DisputeGuid",
                table: "FilePackages",
                column: "DisputeGuid",
                principalTable: "Disputes",
                principalColumn: "DisputeGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FilePackages_Participants_CreatedBy",
                table: "FilePackages",
                column: "CreatedBy",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FilePackageServices_FileDescriptions_OtherProofFileDescript~",
                table: "FilePackageServices",
                column: "OtherProofFileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FilePackageServices_FileDescriptions_ProofFileDescriptionId",
                table: "FilePackageServices",
                column: "ProofFileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FilePackageServices_FilePackages_FilePackageId",
                table: "FilePackageServices",
                column: "FilePackageId",
                principalTable: "FilePackages",
                principalColumn: "FilePackageId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FilePackageServices_Participants_ArchiveServedBy",
                table: "FilePackageServices",
                column: "ArchiveServedBy",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FilePackageServices_SystemUsers_ArchivedBy",
                table: "FilePackageServices",
                column: "ArchivedBy",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Files_FilePackages_FilePackageId",
                table: "Files",
                column: "FilePackageId",
                principalTable: "FilePackages",
                principalColumn: "FilePackageId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_HearingParticipations_Hearings_HearingId",
                table: "HearingParticipations",
                column: "HearingId",
                principalTable: "Hearings",
                principalColumn: "HearingId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_HearingParticipations_Participants_ParticipantId",
                table: "HearingParticipations",
                column: "ParticipantId",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_HearingParticipations_SystemUsers_ParticipationStatusBy",
                table: "HearingParticipations",
                column: "ParticipationStatusBy",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_HearingParticipations_SystemUsers_PreParticipationStatusBy",
                table: "HearingParticipations",
                column: "PreParticipationStatusBy",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Hearings_ConferenceBridges_ConferenceBridgeId",
                table: "Hearings",
                column: "ConferenceBridgeId",
                principalTable: "ConferenceBridges",
                principalColumn: "ConferenceBridgeId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Hearings_Disputes_HearingReservedDisputeGuid",
                table: "Hearings",
                column: "HearingReservedDisputeGuid",
                principalTable: "Disputes",
                principalColumn: "DisputeGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Hearings_FileDescriptions_NotificationFileDescriptionId",
                table: "Hearings",
                column: "NotificationFileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Hearings_UserTokens_HearingReservedById",
                table: "Hearings",
                column: "HearingReservedById",
                principalTable: "UserTokens",
                principalColumn: "UserTokenId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_InternalUserRoles_SystemUsers_ManagedById",
                table: "InternalUserRoles",
                column: "ManagedById",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LinkedFiles_FileDescriptions_FileDescriptionId",
                table: "LinkedFiles",
                column: "FileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LinkedFiles_Files_FileId",
                table: "LinkedFiles",
                column: "FileId",
                principalTable: "Files",
                principalColumn: "FileId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_ConferenceBridges_ConferenceBridgeId",
                table: "Notices",
                column: "ConferenceBridgeId",
                principalTable: "ConferenceBridges",
                principalColumn: "ConferenceBridgeId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_FileDescriptions_NoticeFileDescriptionId",
                table: "Notices",
                column: "NoticeFileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_Hearings_HearingId",
                table: "Notices",
                column: "HearingId",
                principalTable: "Hearings",
                principalColumn: "HearingId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_Notices_ParentNoticeId",
                table: "Notices",
                column: "ParentNoticeId",
                principalTable: "Notices",
                principalColumn: "NoticeId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_NoticeServices_FileDescriptions_OtherProofFileDescriptionId",
                table: "NoticeServices",
                column: "OtherProofFileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_NoticeServices_FileDescriptions_ProofFileDescriptionId",
                table: "NoticeServices",
                column: "ProofFileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_NoticeServices_Notices_NoticeId",
                table: "NoticeServices",
                column: "NoticeId",
                principalTable: "Notices",
                principalColumn: "NoticeId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_NoticeServices_Participants_ArchiveServedBy",
                table: "NoticeServices",
                column: "ArchiveServedBy",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_NoticeServices_Participants_ServedBy",
                table: "NoticeServices",
                column: "ServedBy",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_NoticeServices_SystemUsers_ArchivedBy",
                table: "NoticeServices",
                column: "ArchivedBy",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OutcomeDocContents_OutcomeDocFiles_OutcomeDocFileId",
                table: "OutcomeDocContents",
                column: "OutcomeDocFileId",
                principalTable: "OutcomeDocFiles",
                principalColumn: "OutcomeDocFileId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OutcomeDocDeliveries_EmailMessages_AssociatedEmailId",
                table: "OutcomeDocDeliveries",
                column: "AssociatedEmailId",
                principalTable: "EmailMessages",
                principalColumn: "EmailMessageId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OutcomeDocDeliveries_OutcomeDocFiles_OutcomeDocFileId",
                table: "OutcomeDocDeliveries",
                column: "OutcomeDocFileId",
                principalTable: "OutcomeDocFiles",
                principalColumn: "OutcomeDocFileId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OutcomeDocDeliveries_Participants_ParticipantId",
                table: "OutcomeDocDeliveries",
                column: "ParticipantId",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OutcomeDocFiles_Files_FileId",
                table: "OutcomeDocFiles",
                column: "FileId",
                principalTable: "Files",
                principalColumn: "FileId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OutcomeDocFiles_OutcomeDocGroups_OutcomeDocGroupId",
                table: "OutcomeDocFiles",
                column: "OutcomeDocGroupId",
                principalTable: "OutcomeDocGroups",
                principalColumn: "OutcomeDocGroupId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OutcomeDocReqItems_FileDescriptions_FileDescriptionId",
                table: "OutcomeDocReqItems",
                column: "FileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OutcomeDocReqItems_OutcomeDocRequests_OutcomeDocRequestId",
                table: "OutcomeDocReqItems",
                column: "OutcomeDocRequestId",
                principalTable: "OutcomeDocRequests",
                principalColumn: "OutcomeDocRequestId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OutcomeDocRequests_FileDescriptions_FileDescriptionId",
                table: "OutcomeDocRequests",
                column: "FileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OutcomeDocRequests_OutcomeDocGroups_OutcomeDocGroupId",
                table: "OutcomeDocRequests",
                column: "OutcomeDocGroupId",
                principalTable: "OutcomeDocGroups",
                principalColumn: "OutcomeDocGroupId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Participants_SystemUsers_SystemUserId",
                table: "Participants",
                column: "SystemUserId",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentTransactions_DisputeFees_DisputeFeeId",
                table: "PaymentTransactions",
                column: "DisputeFeeId",
                principalTable: "DisputeFees",
                principalColumn: "DisputeFeeId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Remedies_Claims_ClaimId",
                table: "Remedies",
                column: "ClaimId",
                principalTable: "Claims",
                principalColumn: "ClaimId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Remedies_SystemUsers_PrevAwardBy",
                table: "Remedies",
                column: "PrevAwardBy",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RemedyDetails_Remedies_RemedyId",
                table: "RemedyDetails",
                column: "RemedyId",
                principalTable: "Remedies",
                principalColumn: "RemedyId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduleRequests_SystemUsers_RequestOwnerId",
                table: "ScheduleRequests",
                column: "RequestOwnerId",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduleRequests_SystemUsers_RequestSubmitter",
                table: "ScheduleRequests",
                column: "RequestSubmitter",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceAuditLogs_FileDescriptions_OtherProofFileDescription~",
                table: "ServiceAuditLogs",
                column: "OtherProofFileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceAuditLogs_FileDescriptions_ProofFileDescriptionId",
                table: "ServiceAuditLogs",
                column: "ProofFileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceAuditLogs_FilePackageServices_FilePackageServiceId",
                table: "ServiceAuditLogs",
                column: "FilePackageServiceId",
                principalTable: "FilePackageServices",
                principalColumn: "FilePackageServiceId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceAuditLogs_NoticeServices_NoticeServiceId",
                table: "ServiceAuditLogs",
                column: "NoticeServiceId",
                principalTable: "NoticeServices",
                principalColumn: "NoticeServiceId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceAuditLogs_Participants_ParticipantId",
                table: "ServiceAuditLogs",
                column: "ParticipantId",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceAuditLogs_Participants_ServiceBy",
                table: "ServiceAuditLogs",
                column: "ServiceBy",
                principalTable: "Participants",
                principalColumn: "ParticipantId");

            migrationBuilder.AddForeignKey(
                name: "FK_SubmissionReceipts_Participants_ParticipantId",
                table: "SubmissionReceipts",
                column: "ParticipantId",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SubstitutedServices_Disputes_DisputeGuid",
                table: "SubstitutedServices",
                column: "DisputeGuid",
                principalTable: "Disputes",
                principalColumn: "DisputeGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SubstitutedServices_FileDescriptions_FailedMethod1FileDescId",
                table: "SubstitutedServices",
                column: "FailedMethod1FileDescId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SubstitutedServices_FileDescriptions_FailedMethod2FileDescId",
                table: "SubstitutedServices",
                column: "FailedMethod2FileDescId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SubstitutedServices_FileDescriptions_FailedMethod3FileDescId",
                table: "SubstitutedServices",
                column: "FailedMethod3FileDescId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SubstitutedServices_FileDescriptions_RequestMethodFileDescId",
                table: "SubstitutedServices",
                column: "RequestMethodFileDescId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SubstitutedServices_Participants_ServiceByParticipantId",
                table: "SubstitutedServices",
                column: "ServiceByParticipantId",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SubstitutedServices_Participants_ServiceToParticipantId",
                table: "SubstitutedServices",
                column: "ServiceToParticipantId",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SubstitutedServices_SystemUsers_SubServiceApprovedById",
                table: "SubstitutedServices",
                column: "SubServiceApprovedById",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SystemUsers_SystemUserRoles_SystemUserRoleId",
                table: "SystemUsers",
                column: "SystemUserRoleId",
                principalTable: "SystemUserRoles",
                principalColumn: "SystemUserRoleId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrialDisputes_Participants_DisputeOptedInByParticipantId",
                table: "TrialDisputes",
                column: "DisputeOptedInByParticipantId",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrialDisputes_SystemUsers_DisputeOptedInByStaffId",
                table: "TrialDisputes",
                column: "DisputeOptedInByStaffId",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrialDisputes_Trials_TrialGuid",
                table: "TrialDisputes",
                column: "TrialGuid",
                principalTable: "Trials",
                principalColumn: "TrialGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrialInterventions_TrialDisputes_TrialDisputeGuid",
                table: "TrialInterventions",
                column: "TrialDisputeGuid",
                principalTable: "TrialDisputes",
                principalColumn: "TrialDisputeGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrialInterventions_TrialParticipants_TrialParticipantGuid",
                table: "TrialInterventions",
                column: "TrialParticipantGuid",
                principalTable: "TrialParticipants",
                principalColumn: "TrialParticipantGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrialInterventions_Trials_TrialGuid",
                table: "TrialInterventions",
                column: "TrialGuid",
                principalTable: "Trials",
                principalColumn: "TrialGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrialOutcomes_TrialDisputes_TrialDisputeGuid",
                table: "TrialOutcomes",
                column: "TrialDisputeGuid",
                principalTable: "TrialDisputes",
                principalColumn: "TrialDisputeGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrialOutcomes_TrialInterventions_TrialInterventionGuid",
                table: "TrialOutcomes",
                column: "TrialInterventionGuid",
                principalTable: "TrialInterventions",
                principalColumn: "TrialInterventionGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrialOutcomes_TrialParticipants_TrialParticipantGuid",
                table: "TrialOutcomes",
                column: "TrialParticipantGuid",
                principalTable: "TrialParticipants",
                principalColumn: "TrialParticipantGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrialOutcomes_Trials_TrialGuid",
                table: "TrialOutcomes",
                column: "TrialGuid",
                principalTable: "Trials",
                principalColumn: "TrialGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrialParticipants_Participants_ParticipantId",
                table: "TrialParticipants",
                column: "ParticipantId",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrialParticipants_SystemUsers_SystemUserId",
                table: "TrialParticipants",
                column: "SystemUserId",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TrialParticipants_Trials_TrialGuid",
                table: "TrialParticipants",
                column: "TrialGuid",
                principalTable: "Trials",
                principalColumn: "TrialGuid",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Trials_Trials_AssociatedTrialGuid",
                table: "Trials",
                column: "AssociatedTrialGuid",
                principalTable: "Trials",
                principalColumn: "TrialGuid",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Amendments_FileDescriptions_AmendFileDescriptionId",
                table: "Amendments");

            migrationBuilder.DropForeignKey(
                name: "FK_Amendments_Notices_NoticeId",
                table: "Amendments");

            migrationBuilder.DropForeignKey(
                name: "FK_AuditLogs_Disputes_DisputeGuid",
                table: "AuditLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_BulkEmailRecipients_Participants_RecipientParticipantId",
                table: "BulkEmailRecipients");

            migrationBuilder.DropForeignKey(
                name: "FK_ClaimDetails_Claims_ClaimId",
                table: "ClaimDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_ClaimGroupParticipants_ClaimGroups_ClaimGroupId",
                table: "ClaimGroupParticipants");

            migrationBuilder.DropForeignKey(
                name: "FK_ClaimGroupParticipants_Participants_GroupPrimaryContactId",
                table: "ClaimGroupParticipants");

            migrationBuilder.DropForeignKey(
                name: "FK_Claims_ClaimGroups_ClaimGroupId",
                table: "Claims");

            migrationBuilder.DropForeignKey(
                name: "FK_DisputeFees_Participants_PayorId",
                table: "DisputeFees");

            migrationBuilder.DropForeignKey(
                name: "FK_DisputeFlags_Participants_FlagParticipantId",
                table: "DisputeFlags");

            migrationBuilder.DropForeignKey(
                name: "FK_DisputeFlags_SystemUsers_FlagOwnerId",
                table: "DisputeFlags");

            migrationBuilder.DropForeignKey(
                name: "FK_Disputes_Notices_OriginalNoticeId",
                table: "Disputes");

            migrationBuilder.DropForeignKey(
                name: "FK_Disputes_Participants_InitialPaymentBy",
                table: "Disputes");

            migrationBuilder.DropForeignKey(
                name: "FK_Disputes_Participants_SubmittedBy",
                table: "Disputes");

            migrationBuilder.DropForeignKey(
                name: "FK_DisputeUsers_Participants_ParticipantId",
                table: "DisputeUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_DisputeUsers_SystemUsers_SystemUserId",
                table: "DisputeUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_EmailAttachments_CommonFiles_CommonFileId",
                table: "EmailAttachments");

            migrationBuilder.DropForeignKey(
                name: "FK_EmailAttachments_EmailMessages_EmailMessageId",
                table: "EmailAttachments");

            migrationBuilder.DropForeignKey(
                name: "FK_EmailAttachments_Files_FileId",
                table: "EmailAttachments");

            migrationBuilder.DropForeignKey(
                name: "FK_EmailMessages_Participants_ParticipantId",
                table: "EmailMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_ExternalErrorLogs_Disputes_DisputeGuid",
                table: "ExternalErrorLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_ExternalErrorLogs_SystemUsers_ErrorOwner",
                table: "ExternalErrorLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_ExternalFiles_ExternalCustomDataObjects_ExternalCustomDataO~",
                table: "ExternalFiles");

            migrationBuilder.DropForeignKey(
                name: "FK_FileDescriptions_Claims_ClaimId",
                table: "FileDescriptions");

            migrationBuilder.DropForeignKey(
                name: "FK_FileDescriptions_Remedies_RemedyId",
                table: "FileDescriptions");

            migrationBuilder.DropForeignKey(
                name: "FK_FilePackages_Disputes_DisputeGuid",
                table: "FilePackages");

            migrationBuilder.DropForeignKey(
                name: "FK_FilePackages_Participants_CreatedBy",
                table: "FilePackages");

            migrationBuilder.DropForeignKey(
                name: "FK_FilePackageServices_FileDescriptions_OtherProofFileDescript~",
                table: "FilePackageServices");

            migrationBuilder.DropForeignKey(
                name: "FK_FilePackageServices_FileDescriptions_ProofFileDescriptionId",
                table: "FilePackageServices");

            migrationBuilder.DropForeignKey(
                name: "FK_FilePackageServices_FilePackages_FilePackageId",
                table: "FilePackageServices");

            migrationBuilder.DropForeignKey(
                name: "FK_FilePackageServices_Participants_ArchiveServedBy",
                table: "FilePackageServices");

            migrationBuilder.DropForeignKey(
                name: "FK_FilePackageServices_SystemUsers_ArchivedBy",
                table: "FilePackageServices");

            migrationBuilder.DropForeignKey(
                name: "FK_Files_FilePackages_FilePackageId",
                table: "Files");

            migrationBuilder.DropForeignKey(
                name: "FK_HearingParticipations_Hearings_HearingId",
                table: "HearingParticipations");

            migrationBuilder.DropForeignKey(
                name: "FK_HearingParticipations_Participants_ParticipantId",
                table: "HearingParticipations");

            migrationBuilder.DropForeignKey(
                name: "FK_HearingParticipations_SystemUsers_ParticipationStatusBy",
                table: "HearingParticipations");

            migrationBuilder.DropForeignKey(
                name: "FK_HearingParticipations_SystemUsers_PreParticipationStatusBy",
                table: "HearingParticipations");

            migrationBuilder.DropForeignKey(
                name: "FK_Hearings_ConferenceBridges_ConferenceBridgeId",
                table: "Hearings");

            migrationBuilder.DropForeignKey(
                name: "FK_Hearings_Disputes_HearingReservedDisputeGuid",
                table: "Hearings");

            migrationBuilder.DropForeignKey(
                name: "FK_Hearings_FileDescriptions_NotificationFileDescriptionId",
                table: "Hearings");

            migrationBuilder.DropForeignKey(
                name: "FK_Hearings_UserTokens_HearingReservedById",
                table: "Hearings");

            migrationBuilder.DropForeignKey(
                name: "FK_InternalUserRoles_SystemUsers_ManagedById",
                table: "InternalUserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_LinkedFiles_FileDescriptions_FileDescriptionId",
                table: "LinkedFiles");

            migrationBuilder.DropForeignKey(
                name: "FK_LinkedFiles_Files_FileId",
                table: "LinkedFiles");

            migrationBuilder.DropForeignKey(
                name: "FK_Notices_ConferenceBridges_ConferenceBridgeId",
                table: "Notices");

            migrationBuilder.DropForeignKey(
                name: "FK_Notices_FileDescriptions_NoticeFileDescriptionId",
                table: "Notices");

            migrationBuilder.DropForeignKey(
                name: "FK_Notices_Hearings_HearingId",
                table: "Notices");

            migrationBuilder.DropForeignKey(
                name: "FK_Notices_Notices_ParentNoticeId",
                table: "Notices");

            migrationBuilder.DropForeignKey(
                name: "FK_NoticeServices_FileDescriptions_OtherProofFileDescriptionId",
                table: "NoticeServices");

            migrationBuilder.DropForeignKey(
                name: "FK_NoticeServices_FileDescriptions_ProofFileDescriptionId",
                table: "NoticeServices");

            migrationBuilder.DropForeignKey(
                name: "FK_NoticeServices_Notices_NoticeId",
                table: "NoticeServices");

            migrationBuilder.DropForeignKey(
                name: "FK_NoticeServices_Participants_ArchiveServedBy",
                table: "NoticeServices");

            migrationBuilder.DropForeignKey(
                name: "FK_NoticeServices_Participants_ServedBy",
                table: "NoticeServices");

            migrationBuilder.DropForeignKey(
                name: "FK_NoticeServices_SystemUsers_ArchivedBy",
                table: "NoticeServices");

            migrationBuilder.DropForeignKey(
                name: "FK_OutcomeDocContents_OutcomeDocFiles_OutcomeDocFileId",
                table: "OutcomeDocContents");

            migrationBuilder.DropForeignKey(
                name: "FK_OutcomeDocDeliveries_EmailMessages_AssociatedEmailId",
                table: "OutcomeDocDeliveries");

            migrationBuilder.DropForeignKey(
                name: "FK_OutcomeDocDeliveries_OutcomeDocFiles_OutcomeDocFileId",
                table: "OutcomeDocDeliveries");

            migrationBuilder.DropForeignKey(
                name: "FK_OutcomeDocDeliveries_Participants_ParticipantId",
                table: "OutcomeDocDeliveries");

            migrationBuilder.DropForeignKey(
                name: "FK_OutcomeDocFiles_Files_FileId",
                table: "OutcomeDocFiles");

            migrationBuilder.DropForeignKey(
                name: "FK_OutcomeDocFiles_OutcomeDocGroups_OutcomeDocGroupId",
                table: "OutcomeDocFiles");

            migrationBuilder.DropForeignKey(
                name: "FK_OutcomeDocReqItems_FileDescriptions_FileDescriptionId",
                table: "OutcomeDocReqItems");

            migrationBuilder.DropForeignKey(
                name: "FK_OutcomeDocReqItems_OutcomeDocRequests_OutcomeDocRequestId",
                table: "OutcomeDocReqItems");

            migrationBuilder.DropForeignKey(
                name: "FK_OutcomeDocRequests_FileDescriptions_FileDescriptionId",
                table: "OutcomeDocRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_OutcomeDocRequests_OutcomeDocGroups_OutcomeDocGroupId",
                table: "OutcomeDocRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_Participants_SystemUsers_SystemUserId",
                table: "Participants");

            migrationBuilder.DropForeignKey(
                name: "FK_PaymentTransactions_DisputeFees_DisputeFeeId",
                table: "PaymentTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Remedies_Claims_ClaimId",
                table: "Remedies");

            migrationBuilder.DropForeignKey(
                name: "FK_Remedies_SystemUsers_PrevAwardBy",
                table: "Remedies");

            migrationBuilder.DropForeignKey(
                name: "FK_RemedyDetails_Remedies_RemedyId",
                table: "RemedyDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_ScheduleRequests_SystemUsers_RequestOwnerId",
                table: "ScheduleRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_ScheduleRequests_SystemUsers_RequestSubmitter",
                table: "ScheduleRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceAuditLogs_FileDescriptions_OtherProofFileDescription~",
                table: "ServiceAuditLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceAuditLogs_FileDescriptions_ProofFileDescriptionId",
                table: "ServiceAuditLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceAuditLogs_FilePackageServices_FilePackageServiceId",
                table: "ServiceAuditLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceAuditLogs_NoticeServices_NoticeServiceId",
                table: "ServiceAuditLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceAuditLogs_Participants_ParticipantId",
                table: "ServiceAuditLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceAuditLogs_Participants_ServiceBy",
                table: "ServiceAuditLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_SubmissionReceipts_Participants_ParticipantId",
                table: "SubmissionReceipts");

            migrationBuilder.DropForeignKey(
                name: "FK_SubstitutedServices_Disputes_DisputeGuid",
                table: "SubstitutedServices");

            migrationBuilder.DropForeignKey(
                name: "FK_SubstitutedServices_FileDescriptions_FailedMethod1FileDescId",
                table: "SubstitutedServices");

            migrationBuilder.DropForeignKey(
                name: "FK_SubstitutedServices_FileDescriptions_FailedMethod2FileDescId",
                table: "SubstitutedServices");

            migrationBuilder.DropForeignKey(
                name: "FK_SubstitutedServices_FileDescriptions_FailedMethod3FileDescId",
                table: "SubstitutedServices");

            migrationBuilder.DropForeignKey(
                name: "FK_SubstitutedServices_FileDescriptions_RequestMethodFileDescId",
                table: "SubstitutedServices");

            migrationBuilder.DropForeignKey(
                name: "FK_SubstitutedServices_Participants_ServiceByParticipantId",
                table: "SubstitutedServices");

            migrationBuilder.DropForeignKey(
                name: "FK_SubstitutedServices_Participants_ServiceToParticipantId",
                table: "SubstitutedServices");

            migrationBuilder.DropForeignKey(
                name: "FK_SubstitutedServices_SystemUsers_SubServiceApprovedById",
                table: "SubstitutedServices");

            migrationBuilder.DropForeignKey(
                name: "FK_SystemUsers_SystemUserRoles_SystemUserRoleId",
                table: "SystemUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_TrialDisputes_Participants_DisputeOptedInByParticipantId",
                table: "TrialDisputes");

            migrationBuilder.DropForeignKey(
                name: "FK_TrialDisputes_SystemUsers_DisputeOptedInByStaffId",
                table: "TrialDisputes");

            migrationBuilder.DropForeignKey(
                name: "FK_TrialDisputes_Trials_TrialGuid",
                table: "TrialDisputes");

            migrationBuilder.DropForeignKey(
                name: "FK_TrialInterventions_TrialDisputes_TrialDisputeGuid",
                table: "TrialInterventions");

            migrationBuilder.DropForeignKey(
                name: "FK_TrialInterventions_TrialParticipants_TrialParticipantGuid",
                table: "TrialInterventions");

            migrationBuilder.DropForeignKey(
                name: "FK_TrialInterventions_Trials_TrialGuid",
                table: "TrialInterventions");

            migrationBuilder.DropForeignKey(
                name: "FK_TrialOutcomes_TrialDisputes_TrialDisputeGuid",
                table: "TrialOutcomes");

            migrationBuilder.DropForeignKey(
                name: "FK_TrialOutcomes_TrialInterventions_TrialInterventionGuid",
                table: "TrialOutcomes");

            migrationBuilder.DropForeignKey(
                name: "FK_TrialOutcomes_TrialParticipants_TrialParticipantGuid",
                table: "TrialOutcomes");

            migrationBuilder.DropForeignKey(
                name: "FK_TrialOutcomes_Trials_TrialGuid",
                table: "TrialOutcomes");

            migrationBuilder.DropForeignKey(
                name: "FK_TrialParticipants_Participants_ParticipantId",
                table: "TrialParticipants");

            migrationBuilder.DropForeignKey(
                name: "FK_TrialParticipants_SystemUsers_SystemUserId",
                table: "TrialParticipants");

            migrationBuilder.DropForeignKey(
                name: "FK_TrialParticipants_Trials_TrialGuid",
                table: "TrialParticipants");

            migrationBuilder.DropForeignKey(
                name: "FK_Trials_Trials_AssociatedTrialGuid",
                table: "Trials");

            migrationBuilder.DropIndex(
                name: "IX_Trials_AssociatedTrialGuid",
                table: "Trials");

            migrationBuilder.DropIndex(
                name: "IX_TrialParticipants_ParticipantId",
                table: "TrialParticipants");

            migrationBuilder.DropIndex(
                name: "IX_TrialParticipants_SystemUserId",
                table: "TrialParticipants");

            migrationBuilder.DropIndex(
                name: "IX_TrialOutcomes_TrialInterventionGuid",
                table: "TrialOutcomes");

            migrationBuilder.DropIndex(
                name: "IX_TrialOutcomes_TrialParticipantGuid",
                table: "TrialOutcomes");

            migrationBuilder.DropIndex(
                name: "IX_TrialDisputes_DisputeOptedInByParticipantId",
                table: "TrialDisputes");

            migrationBuilder.DropIndex(
                name: "IX_TrialDisputes_DisputeOptedInByStaffId",
                table: "TrialDisputes");

            migrationBuilder.DropIndex(
                name: "IX_SubmissionReceipts_ParticipantId",
                table: "SubmissionReceipts");

            migrationBuilder.DropIndex(
                name: "IX_ServiceAuditLogs_FilePackageServiceId",
                table: "ServiceAuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_ServiceAuditLogs_NoticeServiceId",
                table: "ServiceAuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_ServiceAuditLogs_OtherProofFileDescriptionId",
                table: "ServiceAuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_ServiceAuditLogs_ParticipantId",
                table: "ServiceAuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_ServiceAuditLogs_ProofFileDescriptionId",
                table: "ServiceAuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_ServiceAuditLogs_ServiceBy",
                table: "ServiceAuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_ScheduleRequests_RequestOwnerId",
                table: "ScheduleRequests");

            migrationBuilder.DropIndex(
                name: "IX_ScheduleRequests_RequestSubmitter",
                table: "ScheduleRequests");

            migrationBuilder.DropIndex(
                name: "IX_Remedies_PrevAwardBy",
                table: "Remedies");

            migrationBuilder.DropIndex(
                name: "IX_OutcomeDocRequests_FileDescriptionId",
                table: "OutcomeDocRequests");

            migrationBuilder.DropIndex(
                name: "IX_OutcomeDocRequests_OutcomeDocGroupId",
                table: "OutcomeDocRequests");

            migrationBuilder.DropIndex(
                name: "IX_OutcomeDocReqItems_FileDescriptionId",
                table: "OutcomeDocReqItems");

            migrationBuilder.DropIndex(
                name: "IX_OutcomeDocDeliveries_AssociatedEmailId",
                table: "OutcomeDocDeliveries");

            migrationBuilder.DropIndex(
                name: "IX_NoticeServices_ArchivedBy",
                table: "NoticeServices");

            migrationBuilder.DropIndex(
                name: "IX_NoticeServices_ArchiveServedBy",
                table: "NoticeServices");

            migrationBuilder.DropIndex(
                name: "IX_NoticeServices_ServedBy",
                table: "NoticeServices");

            migrationBuilder.DropIndex(
                name: "IX_InternalUserRoles_ManagedById",
                table: "InternalUserRoles");

            migrationBuilder.DropIndex(
                name: "IX_Hearings_HearingReservedById",
                table: "Hearings");

            migrationBuilder.DropIndex(
                name: "IX_Hearings_HearingReservedDisputeGuid",
                table: "Hearings");

            migrationBuilder.DropIndex(
                name: "IX_Hearings_NotificationFileDescriptionId",
                table: "Hearings");

            migrationBuilder.DropIndex(
                name: "IX_HearingParticipations_ParticipationStatusBy",
                table: "HearingParticipations");

            migrationBuilder.DropIndex(
                name: "IX_HearingParticipations_PreParticipationStatusBy",
                table: "HearingParticipations");

            migrationBuilder.DropIndex(
                name: "IX_FilePackageServices_ArchivedBy",
                table: "FilePackageServices");

            migrationBuilder.DropIndex(
                name: "IX_FilePackageServices_ArchiveServedBy",
                table: "FilePackageServices");

            migrationBuilder.DropIndex(
                name: "IX_FilePackages_CreatedBy",
                table: "FilePackages");

            migrationBuilder.DropIndex(
                name: "IX_ExternalErrorLogs_DisputeGuid",
                table: "ExternalErrorLogs");

            migrationBuilder.DropIndex(
                name: "IX_ExternalErrorLogs_ErrorOwner",
                table: "ExternalErrorLogs");

            migrationBuilder.DropIndex(
                name: "IX_Disputes_InitialPaymentBy",
                table: "Disputes");

            migrationBuilder.DropIndex(
                name: "IX_Disputes_OriginalNoticeId",
                table: "Disputes");

            migrationBuilder.DropIndex(
                name: "IX_Disputes_SubmittedBy",
                table: "Disputes");

            migrationBuilder.DropIndex(
                name: "IX_DisputeFlags_FlagOwnerId",
                table: "DisputeFlags");

            migrationBuilder.DropIndex(
                name: "IX_DisputeFlags_FlagParticipantId",
                table: "DisputeFlags");

            migrationBuilder.DropIndex(
                name: "IX_DisputeFees_PayorId",
                table: "DisputeFees");

            migrationBuilder.DropIndex(
                name: "IX_BulkEmailRecipients_RecipientParticipantId",
                table: "BulkEmailRecipients");

            migrationBuilder.AddColumn<int>(
                name: "SystemUserId",
                table: "ScheduleRequests",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CreatedParticipantParticipantId",
                table: "FilePackages",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DisputeId",
                table: "FilePackages",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleRequests_SystemUserId",
                table: "ScheduleRequests",
                column: "SystemUserId");

            migrationBuilder.CreateIndex(
                name: "IX_FilePackages_CreatedParticipantParticipantId",
                table: "FilePackages",
                column: "CreatedParticipantParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_FilePackages_DisputeId",
                table: "FilePackages",
                column: "DisputeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Amendments_FileDescriptions_AmendFileDescriptionId",
                table: "Amendments",
                column: "AmendFileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Amendments_Notices_NoticeId",
                table: "Amendments",
                column: "NoticeId",
                principalTable: "Notices",
                principalColumn: "NoticeId");

            migrationBuilder.AddForeignKey(
                name: "FK_ClaimDetails_Claims_ClaimId",
                table: "ClaimDetails",
                column: "ClaimId",
                principalTable: "Claims",
                principalColumn: "ClaimId");

            migrationBuilder.AddForeignKey(
                name: "FK_ClaimGroupParticipants_ClaimGroups_ClaimGroupId",
                table: "ClaimGroupParticipants",
                column: "ClaimGroupId",
                principalTable: "ClaimGroups",
                principalColumn: "ClaimGroupId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Claims_ClaimGroups_ClaimGroupId",
                table: "Claims",
                column: "ClaimGroupId",
                principalTable: "ClaimGroups",
                principalColumn: "ClaimGroupId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DisputeUsers_Participants_ParticipantId",
                table: "DisputeUsers",
                column: "ParticipantId",
                principalTable: "Participants",
                principalColumn: "ParticipantId");

            migrationBuilder.AddForeignKey(
                name: "FK_DisputeUsers_SystemUsers_SystemUserId",
                table: "DisputeUsers",
                column: "SystemUserId",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EmailAttachments_CommonFiles_CommonFileId",
                table: "EmailAttachments",
                column: "CommonFileId",
                principalTable: "CommonFiles",
                principalColumn: "CommonFileId");

            migrationBuilder.AddForeignKey(
                name: "FK_EmailAttachments_EmailMessages_EmailMessageId",
                table: "EmailAttachments",
                column: "EmailMessageId",
                principalTable: "EmailMessages",
                principalColumn: "EmailMessageId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EmailAttachments_Files_FileId",
                table: "EmailAttachments",
                column: "FileId",
                principalTable: "Files",
                principalColumn: "FileId");

            migrationBuilder.AddForeignKey(
                name: "FK_EmailMessages_Participants_ParticipantId",
                table: "EmailMessages",
                column: "ParticipantId",
                principalTable: "Participants",
                principalColumn: "ParticipantId");

            migrationBuilder.AddForeignKey(
                name: "FK_ExternalFiles_ExternalCustomDataObjects_ExternalCustomDataO~",
                table: "ExternalFiles",
                column: "ExternalCustomDataObjectId",
                principalTable: "ExternalCustomDataObjects",
                principalColumn: "ExternalCustomDataObjectId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FileDescriptions_Claims_ClaimId",
                table: "FileDescriptions",
                column: "ClaimId",
                principalTable: "Claims",
                principalColumn: "ClaimId");

            migrationBuilder.AddForeignKey(
                name: "FK_FileDescriptions_Remedies_RemedyId",
                table: "FileDescriptions",
                column: "RemedyId",
                principalTable: "Remedies",
                principalColumn: "RemedyId");

            migrationBuilder.AddForeignKey(
                name: "FK_FilePackages_Disputes_DisputeId",
                table: "FilePackages",
                column: "DisputeId",
                principalTable: "Disputes",
                principalColumn: "DisputeId");

            migrationBuilder.AddForeignKey(
                name: "FK_FilePackages_Participants_CreatedParticipantParticipantId",
                table: "FilePackages",
                column: "CreatedParticipantParticipantId",
                principalTable: "Participants",
                principalColumn: "ParticipantId");

            migrationBuilder.AddForeignKey(
                name: "FK_FilePackageServices_FileDescriptions_OtherProofFileDescript~",
                table: "FilePackageServices",
                column: "OtherProofFileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_FilePackageServices_FileDescriptions_ProofFileDescriptionId",
                table: "FilePackageServices",
                column: "ProofFileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_FilePackageServices_FilePackages_FilePackageId",
                table: "FilePackageServices",
                column: "FilePackageId",
                principalTable: "FilePackages",
                principalColumn: "FilePackageId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Files_FilePackages_FilePackageId",
                table: "Files",
                column: "FilePackageId",
                principalTable: "FilePackages",
                principalColumn: "FilePackageId");

            migrationBuilder.AddForeignKey(
                name: "FK_HearingParticipations_Hearings_HearingId",
                table: "HearingParticipations",
                column: "HearingId",
                principalTable: "Hearings",
                principalColumn: "HearingId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_HearingParticipations_Participants_ParticipantId",
                table: "HearingParticipations",
                column: "ParticipantId",
                principalTable: "Participants",
                principalColumn: "ParticipantId");

            migrationBuilder.AddForeignKey(
                name: "FK_Hearings_ConferenceBridges_ConferenceBridgeId",
                table: "Hearings",
                column: "ConferenceBridgeId",
                principalTable: "ConferenceBridges",
                principalColumn: "ConferenceBridgeId");

            migrationBuilder.AddForeignKey(
                name: "FK_LinkedFiles_FileDescriptions_FileDescriptionId",
                table: "LinkedFiles",
                column: "FileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LinkedFiles_Files_FileId",
                table: "LinkedFiles",
                column: "FileId",
                principalTable: "Files",
                principalColumn: "FileId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_ConferenceBridges_ConferenceBridgeId",
                table: "Notices",
                column: "ConferenceBridgeId",
                principalTable: "ConferenceBridges",
                principalColumn: "ConferenceBridgeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_FileDescriptions_NoticeFileDescriptionId",
                table: "Notices",
                column: "NoticeFileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_Hearings_HearingId",
                table: "Notices",
                column: "HearingId",
                principalTable: "Hearings",
                principalColumn: "HearingId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notices_Notices_ParentNoticeId",
                table: "Notices",
                column: "ParentNoticeId",
                principalTable: "Notices",
                principalColumn: "NoticeId");

            migrationBuilder.AddForeignKey(
                name: "FK_NoticeServices_FileDescriptions_OtherProofFileDescriptionId",
                table: "NoticeServices",
                column: "OtherProofFileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_NoticeServices_FileDescriptions_ProofFileDescriptionId",
                table: "NoticeServices",
                column: "ProofFileDescriptionId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_NoticeServices_Notices_NoticeId",
                table: "NoticeServices",
                column: "NoticeId",
                principalTable: "Notices",
                principalColumn: "NoticeId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OutcomeDocContents_OutcomeDocFiles_OutcomeDocFileId",
                table: "OutcomeDocContents",
                column: "OutcomeDocFileId",
                principalTable: "OutcomeDocFiles",
                principalColumn: "OutcomeDocFileId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OutcomeDocDeliveries_OutcomeDocFiles_OutcomeDocFileId",
                table: "OutcomeDocDeliveries",
                column: "OutcomeDocFileId",
                principalTable: "OutcomeDocFiles",
                principalColumn: "OutcomeDocFileId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OutcomeDocDeliveries_Participants_ParticipantId",
                table: "OutcomeDocDeliveries",
                column: "ParticipantId",
                principalTable: "Participants",
                principalColumn: "ParticipantId");

            migrationBuilder.AddForeignKey(
                name: "FK_OutcomeDocFiles_Files_FileId",
                table: "OutcomeDocFiles",
                column: "FileId",
                principalTable: "Files",
                principalColumn: "FileId");

            migrationBuilder.AddForeignKey(
                name: "FK_OutcomeDocFiles_OutcomeDocGroups_OutcomeDocGroupId",
                table: "OutcomeDocFiles",
                column: "OutcomeDocGroupId",
                principalTable: "OutcomeDocGroups",
                principalColumn: "OutcomeDocGroupId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OutcomeDocReqItems_OutcomeDocRequests_OutcomeDocRequestId",
                table: "OutcomeDocReqItems",
                column: "OutcomeDocRequestId",
                principalTable: "OutcomeDocRequests",
                principalColumn: "OutcomeDocRequestId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Participants_SystemUsers_SystemUserId",
                table: "Participants",
                column: "SystemUserId",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentTransactions_DisputeFees_DisputeFeeId",
                table: "PaymentTransactions",
                column: "DisputeFeeId",
                principalTable: "DisputeFees",
                principalColumn: "DisputeFeeId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Remedies_Claims_ClaimId",
                table: "Remedies",
                column: "ClaimId",
                principalTable: "Claims",
                principalColumn: "ClaimId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RemedyDetails_Remedies_RemedyId",
                table: "RemedyDetails",
                column: "RemedyId",
                principalTable: "Remedies",
                principalColumn: "RemedyId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduleRequests_SystemUsers_SystemUserId",
                table: "ScheduleRequests",
                column: "SystemUserId",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_SubstitutedServices_FileDescriptions_FailedMethod1FileDescId",
                table: "SubstitutedServices",
                column: "FailedMethod1FileDescId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_SubstitutedServices_FileDescriptions_FailedMethod2FileDescId",
                table: "SubstitutedServices",
                column: "FailedMethod2FileDescId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_SubstitutedServices_FileDescriptions_FailedMethod3FileDescId",
                table: "SubstitutedServices",
                column: "FailedMethod3FileDescId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_SubstitutedServices_FileDescriptions_RequestMethodFileDescId",
                table: "SubstitutedServices",
                column: "RequestMethodFileDescId",
                principalTable: "FileDescriptions",
                principalColumn: "FileDescriptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_SubstitutedServices_Participants_ServiceByParticipantId",
                table: "SubstitutedServices",
                column: "ServiceByParticipantId",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SubstitutedServices_Participants_ServiceToParticipantId",
                table: "SubstitutedServices",
                column: "ServiceToParticipantId",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SubstitutedServices_SystemUsers_SubServiceApprovedById",
                table: "SubstitutedServices",
                column: "SubServiceApprovedById",
                principalTable: "SystemUsers",
                principalColumn: "SystemUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_SystemUsers_SystemUserRoles_SystemUserRoleId",
                table: "SystemUsers",
                column: "SystemUserRoleId",
                principalTable: "SystemUserRoles",
                principalColumn: "SystemUserRoleId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TrialDisputes_Trials_TrialGuid",
                table: "TrialDisputes",
                column: "TrialGuid",
                principalTable: "Trials",
                principalColumn: "TrialGuid",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TrialInterventions_Trials_TrialGuid",
                table: "TrialInterventions",
                column: "TrialGuid",
                principalTable: "Trials",
                principalColumn: "TrialGuid",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TrialOutcomes_Trials_TrialGuid",
                table: "TrialOutcomes",
                column: "TrialGuid",
                principalTable: "Trials",
                principalColumn: "TrialGuid",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TrialParticipants_Trials_TrialGuid",
                table: "TrialParticipants",
                column: "TrialGuid",
                principalTable: "Trials",
                principalColumn: "TrialGuid",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
