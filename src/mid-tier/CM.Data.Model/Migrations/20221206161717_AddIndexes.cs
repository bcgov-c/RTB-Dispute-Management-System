using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CM.Data.Model.Migrations
{
    public partial class AddIndexes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_TrialParticipants_DisputeGuid",
                table: "TrialParticipants",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_TrialOutcomes_TrialDisputeGuid",
                table: "TrialOutcomes",
                column: "TrialDisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_TrialInterventions_TrialDisputeGuid",
                table: "TrialInterventions",
                column: "TrialDisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_TrialInterventions_TrialParticipantGuid",
                table: "TrialInterventions",
                column: "TrialParticipantGuid");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_DateTaskCompleted",
                table: "Tasks",
                column: "DateTaskCompleted");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_TaskActivityType",
                table: "Tasks",
                column: "TaskActivityType");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_TaskStatus",
                table: "Tasks",
                column: "TaskStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_TaskSubType",
                table: "Tasks",
                column: "TaskSubType");

            migrationBuilder.CreateIndex(
                name: "IX_SystemUserRoles_RoleName",
                table: "SystemUserRoles",
                column: "RoleName");

            migrationBuilder.CreateIndex(
                name: "IX_SystemSettings_Key",
                table: "SystemSettings",
                column: "Key");

            migrationBuilder.CreateIndex(
                name: "IX_SubstitutedServices_DisputeGuid",
                table: "SubstitutedServices",
                column: "DisputeGuid");

            migrationBuilder.CreateIndex(
                name: "IX_SubstitutedServices_RequestSource",
                table: "SubstitutedServices",
                column: "RequestSource");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleBlocks_BlockEnd",
                table: "ScheduleBlocks",
                column: "BlockEnd");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleBlocks_BlockStart",
                table: "ScheduleBlocks",
                column: "BlockStart");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleBlocks_BlockType",
                table: "ScheduleBlocks",
                column: "BlockType");

            migrationBuilder.CreateIndex(
                name: "IX_Participants_ParticipantStatus",
                table: "Participants",
                column: "ParticipantStatus");

            migrationBuilder.CreateIndex(
                name: "IX_OutcomeDocFiles_FileType",
                table: "OutcomeDocFiles",
                column: "FileType");

            migrationBuilder.CreateIndex(
                name: "IX_OutcomeDocDeliveries_DeliveryDate",
                table: "OutcomeDocDeliveries",
                column: "DeliveryDate");

            migrationBuilder.CreateIndex(
                name: "IX_OutcomeDocDeliveries_DeliveryMethod",
                table: "OutcomeDocDeliveries",
                column: "DeliveryMethod");

            migrationBuilder.CreateIndex(
                name: "IX_OutcomeDocDeliveries_IsDelivered",
                table: "OutcomeDocDeliveries",
                column: "IsDelivered");

            migrationBuilder.CreateIndex(
                name: "IX_OutcomeDocDeliveries_ReadyForDelivery",
                table: "OutcomeDocDeliveries",
                column: "ReadyForDelivery");

            migrationBuilder.CreateIndex(
                name: "IX_NoticeServices_IsServed",
                table: "NoticeServices",
                column: "IsServed");

            migrationBuilder.CreateIndex(
                name: "IX_Notices_NoticeAssociatedTo",
                table: "Notices",
                column: "NoticeAssociatedTo");

            migrationBuilder.CreateIndex(
                name: "IX_Notices_NoticeType",
                table: "Notices",
                column: "NoticeType");

            migrationBuilder.CreateIndex(
                name: "IX_InternalUserRoles_EngagementType",
                table: "InternalUserRoles",
                column: "EngagementType");

            migrationBuilder.CreateIndex(
                name: "IX_InternalUserRoles_RoleGroupId",
                table: "InternalUserRoles",
                column: "RoleGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_InternalUserRoles_RoleSubtypeId",
                table: "InternalUserRoles",
                column: "RoleSubtypeId");

            migrationBuilder.CreateIndex(
                name: "IX_DisputeStatuses_DisputeStatusId",
                table: "DisputeStatuses",
                column: "DisputeStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_DisputeStatuses_IsActive",
                table: "DisputeStatuses",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_DisputesLastModified_LastModifiedDate",
                table: "DisputesLastModified",
                column: "LastModifiedDate");

            migrationBuilder.CreateIndex(
                name: "IX_Disputes_InitialPaymentDate",
                table: "Disputes",
                column: "InitialPaymentDate");

            migrationBuilder.CreateIndex(
                name: "IX_Disputes_TenancyCity",
                table: "Disputes",
                column: "TenancyCity");

            migrationBuilder.CreateIndex(
                name: "IX_DisputeHearings_DisputeHearingRole",
                table: "DisputeHearings",
                column: "DisputeHearingRole");

            migrationBuilder.CreateIndex(
                name: "IX_DisputeFees_DatePaid",
                table: "DisputeFees",
                column: "DatePaid");

            migrationBuilder.CreateIndex(
                name: "IX_DisputeFees_IsPaid",
                table: "DisputeFees",
                column: "IsPaid");

            migrationBuilder.CreateIndex(
                name: "IX_ConferenceBridges_PreferredEndTime",
                table: "ConferenceBridges",
                column: "PreferredEndTime");

            migrationBuilder.CreateIndex(
                name: "IX_ConferenceBridges_PreferredStartTime",
                table: "ConferenceBridges",
                column: "PreferredStartTime");

            migrationBuilder.CreateIndex(
                name: "IX_CommonFiles_FileType",
                table: "CommonFiles",
                column: "FileType");

            migrationBuilder.CreateIndex(
                name: "IX_CMSParticipants_CMS_Sequence_Number",
                table: "CMSParticipants",
                column: "CMS_Sequence_Number");

            migrationBuilder.CreateIndex(
                name: "IX_CMSParticipants_Participant_Type",
                table: "CMSParticipants",
                column: "Participant_Type");

            migrationBuilder.CreateIndex(
                name: "IX_CMSParticipants_Request_ID",
                table: "CMSParticipants",
                column: "Request_ID");

            migrationBuilder.CreateIndex(
                name: "IX_CMSFiles_File_Number",
                table: "CMSFiles",
                column: "File_Number");

            migrationBuilder.CreateIndex(
                name: "IX_CMSFiles_File_Type",
                table: "CMSFiles",
                column: "File_Type");

            migrationBuilder.CreateIndex(
                name: "IX_CMSData_File_Number",
                table: "CMSData",
                column: "File_Number");

            migrationBuilder.CreateIndex(
                name: "IX_CMSData_Request_ID",
                table: "CMSData",
                column: "Request_ID");

            migrationBuilder.CreateIndex(
                name: "IX_Claims_ClaimStatus",
                table: "Claims",
                column: "ClaimStatus");

            migrationBuilder.CreateIndex(
                name: "IX_ClaimGroupParticipants_GroupParticipantRole",
                table: "ClaimGroupParticipants",
                column: "GroupParticipantRole");

            migrationBuilder.CreateIndex(
                name: "IX_ClaimGroupParticipants_GroupPrimaryContactId",
                table: "ClaimGroupParticipants",
                column: "GroupPrimaryContactId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TrialParticipants_DisputeGuid",
                table: "TrialParticipants");

            migrationBuilder.DropIndex(
                name: "IX_TrialOutcomes_TrialDisputeGuid",
                table: "TrialOutcomes");

            migrationBuilder.DropIndex(
                name: "IX_TrialInterventions_TrialDisputeGuid",
                table: "TrialInterventions");

            migrationBuilder.DropIndex(
                name: "IX_TrialInterventions_TrialParticipantGuid",
                table: "TrialInterventions");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_DateTaskCompleted",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_TaskActivityType",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_TaskStatus",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_TaskSubType",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_SystemUserRoles_RoleName",
                table: "SystemUserRoles");

            migrationBuilder.DropIndex(
                name: "IX_SystemSettings_Key",
                table: "SystemSettings");

            migrationBuilder.DropIndex(
                name: "IX_SubstitutedServices_DisputeGuid",
                table: "SubstitutedServices");

            migrationBuilder.DropIndex(
                name: "IX_SubstitutedServices_RequestSource",
                table: "SubstitutedServices");

            migrationBuilder.DropIndex(
                name: "IX_ScheduleBlocks_BlockEnd",
                table: "ScheduleBlocks");

            migrationBuilder.DropIndex(
                name: "IX_ScheduleBlocks_BlockStart",
                table: "ScheduleBlocks");

            migrationBuilder.DropIndex(
                name: "IX_ScheduleBlocks_BlockType",
                table: "ScheduleBlocks");

            migrationBuilder.DropIndex(
                name: "IX_Participants_ParticipantStatus",
                table: "Participants");

            migrationBuilder.DropIndex(
                name: "IX_OutcomeDocFiles_FileType",
                table: "OutcomeDocFiles");

            migrationBuilder.DropIndex(
                name: "IX_OutcomeDocDeliveries_DeliveryDate",
                table: "OutcomeDocDeliveries");

            migrationBuilder.DropIndex(
                name: "IX_OutcomeDocDeliveries_DeliveryMethod",
                table: "OutcomeDocDeliveries");

            migrationBuilder.DropIndex(
                name: "IX_OutcomeDocDeliveries_IsDelivered",
                table: "OutcomeDocDeliveries");

            migrationBuilder.DropIndex(
                name: "IX_OutcomeDocDeliveries_ReadyForDelivery",
                table: "OutcomeDocDeliveries");

            migrationBuilder.DropIndex(
                name: "IX_NoticeServices_IsServed",
                table: "NoticeServices");

            migrationBuilder.DropIndex(
                name: "IX_Notices_NoticeAssociatedTo",
                table: "Notices");

            migrationBuilder.DropIndex(
                name: "IX_Notices_NoticeType",
                table: "Notices");

            migrationBuilder.DropIndex(
                name: "IX_InternalUserRoles_EngagementType",
                table: "InternalUserRoles");

            migrationBuilder.DropIndex(
                name: "IX_InternalUserRoles_RoleGroupId",
                table: "InternalUserRoles");

            migrationBuilder.DropIndex(
                name: "IX_InternalUserRoles_RoleSubtypeId",
                table: "InternalUserRoles");

            migrationBuilder.DropIndex(
                name: "IX_DisputeStatuses_DisputeStatusId",
                table: "DisputeStatuses");

            migrationBuilder.DropIndex(
                name: "IX_DisputeStatuses_IsActive",
                table: "DisputeStatuses");

            migrationBuilder.DropIndex(
                name: "IX_DisputesLastModified_LastModifiedDate",
                table: "DisputesLastModified");

            migrationBuilder.DropIndex(
                name: "IX_Disputes_InitialPaymentDate",
                table: "Disputes");

            migrationBuilder.DropIndex(
                name: "IX_Disputes_TenancyCity",
                table: "Disputes");

            migrationBuilder.DropIndex(
                name: "IX_DisputeHearings_DisputeHearingRole",
                table: "DisputeHearings");

            migrationBuilder.DropIndex(
                name: "IX_DisputeFees_DatePaid",
                table: "DisputeFees");

            migrationBuilder.DropIndex(
                name: "IX_DisputeFees_IsPaid",
                table: "DisputeFees");

            migrationBuilder.DropIndex(
                name: "IX_ConferenceBridges_PreferredEndTime",
                table: "ConferenceBridges");

            migrationBuilder.DropIndex(
                name: "IX_ConferenceBridges_PreferredStartTime",
                table: "ConferenceBridges");

            migrationBuilder.DropIndex(
                name: "IX_CommonFiles_FileType",
                table: "CommonFiles");

            migrationBuilder.DropIndex(
                name: "IX_CMSParticipants_CMS_Sequence_Number",
                table: "CMSParticipants");

            migrationBuilder.DropIndex(
                name: "IX_CMSParticipants_Participant_Type",
                table: "CMSParticipants");

            migrationBuilder.DropIndex(
                name: "IX_CMSParticipants_Request_ID",
                table: "CMSParticipants");

            migrationBuilder.DropIndex(
                name: "IX_CMSFiles_File_Number",
                table: "CMSFiles");

            migrationBuilder.DropIndex(
                name: "IX_CMSFiles_File_Type",
                table: "CMSFiles");

            migrationBuilder.DropIndex(
                name: "IX_CMSData_File_Number",
                table: "CMSData");

            migrationBuilder.DropIndex(
                name: "IX_CMSData_Request_ID",
                table: "CMSData");

            migrationBuilder.DropIndex(
                name: "IX_Claims_ClaimStatus",
                table: "Claims");

            migrationBuilder.DropIndex(
                name: "IX_ClaimGroupParticipants_GroupParticipantRole",
                table: "ClaimGroupParticipants");

            migrationBuilder.DropIndex(
                name: "IX_ClaimGroupParticipants_GroupPrimaryContactId",
                table: "ClaimGroupParticipants");
        }
    }
}
