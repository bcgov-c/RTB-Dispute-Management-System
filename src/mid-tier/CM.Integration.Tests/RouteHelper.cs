namespace CM.Integration.Tests;

public static class RouteHelper
{
    public const string BaseUrl = "http://localhost:50228/";

    public const string Logout = "api/users/logout";
    public const string Authenticate = "api/users/authenticate";

    // AuditLog
    public const string GetAuditLog = "api/audit/itemdata/";
    public const string GetAuditLogs = "api/audit/logitems/";

    // Access Code
    public const string GetAccessCodeFileInfo = "api/accesscodefileinfo/";

    // Dispute
    public const string PostDispute = "api/dispute/newdispute";
    public const string PostDisputeStatus = "api/dispute/status/";
    public const string PatchDispute = "api/dispute/";
    public const string GetDisputeList = "api/dispute/disputelist";
    public const string GetDispute = "api/dispute/";
    public const string GetDisputeStatuses = "api/dispute/disputestatuses/";
    public const string PostIntakeQuestion = "api/dispute/intakequestions/";
    public const string PatchIntakeQuestion = "api/dispute/intakequestions/";
    public const string GetIntakeQuestion = "api/dispute/intakequestions/";

    // Participant
    public const string PostAccessCode = "api/accesscodelogin/";
    public const string PostParticipant = "api/parties/participant/";
    public const string DeleteParticipant = "api/parties/participant/";
    public const string PatchParticipant = "api/parties/participant/";
    public const string GetParticipant = "api/parties/participant/";
    public const string GetDisputeParticipants = "api/parties/disputeparticipants/";

    // External Update
    public const string PatchExternalParticipant = "api/externalupdate/participant/";
    public const string PatchExternalNoticeService = "api/externalupdate/noticeservice/";
    public const string PostExternalDisputeStatus = "api/externalupdate/disputestatus/";
    public const string PostExternalDispute = "api/externalupdate/newdispute";
    public const string PostExternalTransaction = "api/externalupdate/paymenttransaction/";
    public const string GetExternalDisputeDetails = "api/externalupdate/disputedetails?";
    public const string PatchExternalDisputeInfo = "api/externalupdate/disputeinfo/";
    public const string PostExternalNotice = "api/externalupdate/notice/";

    // File Package
    public const string PostFilePackage = "api/filepackage/";
    public const string PatchFilePackage = "api/filepackage/";
    public const string DeleteFilePackage = "api/filepackage/";
    public const string GetFilePackage = "api/filepackage/";
    public const string GetDisputeFilePackages = "api/disputefilepackages/";

    // File Package Service
    public const string PostFilePackageService = "api/filepackageservice/";
    public const string PatchFilePackageService = "api/filepackageservice/";
    public const string DeleteFilePackageService = "api/filepackageservice/";

    // Link File
    public const string PostLinkFile = "api/linkfile/";
    public const string DeleteLinkFile = "api/linkfile/";
    public const string GetDisputeLinkFiles = "api/disputelinkfiles/";

    // Common File
    public const string PostCommonFile = "api/commonfiles";
    public const string GetCommonFiles = "api/commonfiles";
    public const string PatchCommonFiles = "api/commonfiles/";
    public const string DeleteCommonFile = "api/commonfiles/";

    public const string PostUser = "api/userlogin/create";
    public const string UpdateUser = "api/userlogin/update/";
    public const string ResetUser = "api/userlogin/reset/";
    public const string PostRoleGroup = "api/internaluserrole/";
    public const string GetUserInfo = "api/users/currentuserinfo";
    public const string GetInternalUsers = "api/users/internaluserslist";
    public const string PatchInternalUserStatus = "api/users/internaluserstatus/";
    public const string GetSessionInfo = "api/users/sessioninformation";
    public const string PostExtendSession = "api/users/extendsession";
    public const string GetDisputeUsers = "api/users/disputeuserlist/";
    public const string PostInternalUser = "api/internaluserprofile/";
    public const string PatchInternalUser = "api/internaluserprofile/";
    public const string PostInternalUserRole = "api/internaluserrole/";
    public const string PatchInternalUserRole = "api/internaluserrole/";

    // Conference Bridge
    public const string PostConferenceBridge = "api/conferencebridge";
    public const string PatchConferenceBridge = "api/conferencebridge/";
    public const string GetConferenceBridge = "api/conferencebridge/";
    public const string GetConferenceBridges = "api/conferencebridges";

    // Hearing
    public const string PostHearing = "api/hearing";
    public const string PatchHearing = "api/hearing/";
    public const string GetHearing = "api/hearing/";
    public const string DeleteHearing = "api/hearing/";
    public const string ReassignHearing = "api/hearing/reassign";
    public const string RescheduleHearing = "api/hearing/reschedule";
    public const string PostImportSchedule = "api/importschedule";
    public const string GetImportSchedule = "api/importhistoryrecord/";
    public const string GetImportSchedules = "api/importhistoryrecords/";
    public const string GetAvailableStaff = "api/availablestaff/";
    public const string GetAvailableConferenceBridges = "api/availableconferencebridges/";

    // hearing Participation
    public const string PostHearingParticipant = "api/hearingparticipation/";
    public const string PatchHearingParticipation = "api/hearingparticipation/";
    public const string DeleteHearingParticipant = "api/hearingparticipation/";

    public const string PostDisputeHearing = "api/disputehearing";
    public const string GetDisputeHearings = "api/disputehearings/";
    public const string DeleteDisputeHearing = "api/disputehearing/";
    public const string PatchDisputeHearing = "api/disputehearing/";
    public const string GetDisputeHearingsHistory = "api/disputehearinghistory?";

    // Note
    public const string PostNote = "api/note/";
    public const string PatchNote = "api/note/";
    public const string DeleteNote = "api/note/";
    public const string GetNote = "api/note/";
    public const string GetDisputeNotes = "api/disputenotes/";

    // Task
    public const string PostTask = "api/task/";
    public const string PatchTask = "api/task/";
    public const string DeleteTask = "api/task/";
    public const string GetTask = "api/task/";
    public const string GetDisputeTasks = "api/disputetasks/";
    public const string GetOwnerTasks = "api/ownertasks/";
    public const string GetUnassignedTasks = "api/unassignedtasks";

    // Notice
    public const string PostNotice = "api/notice/";
    public const string PatchNotice = "api/notice/";
    public const string DeleteNotice = "api/notice/";
    public const string GetNotice = "api/notice/";
    public const string GetDisputeNotices = "api/disputenotices/";

    // Notice Service
    public const string PostNoticeService = "api/noticeservice/";
    public const string PatchNoticeService = "api/noticeservice/";
    public const string DeleteNoticeService = "api/noticeservice/";

    // Amendment
    public const string PostAmendment = "api/amendment/";
    public const string PatchAmendment = "api/amendment/";
    public const string GetAmendment = "api/amendment/";
    public const string GetDisputeAmendments = "api/disputeamendments/";

    // Email Template
    public const string PostEmailTemplate = "api/emailtemplate";
    public const string PatchEmailTemplate = "api/emailtemplate/";
    public const string DeleteEmailTemplate = "api/emailtemplate/";
    public const string GetEmailTemplate = "api/emailtemplate/";
    public const string GetEmailTemplates = "api/emailtemplates";

    // ClaimGroupParticipant
    public const string PostClaimGroup = "api/parties/claimGroup/";
    public const string PostClaimGroupParticipant = "api/parties/claimGroupParticipant/";
    public const string PatchClaimGroupParticipant = "api/parties/claimGroupParticipant/";
    public const string DeleteClaimGroupParticipant = "api/parties/claimGroupParticipant/";
    public const string GetDisputeClaimGroupParticipants = "api/parties/disputeclaimgroupparticipants/";

    // Claim
    public const string PostClaim = "api/issues/claim/";
    public const string PatchClaim = "api/issues/claim/";
    public const string DeleteClaim = "api/issues/claim/";
    public const string GetClaim = "api/issues/claim/";
    public const string GetDisputeClaims = "api/issues/disputeclaims/";
    public const string PostClaimDetail = "api/issues/claimdetail/";
    public const string PatchClaimDetail = "api/issues/claimdetail/";
    public const string DeleteClaimDetail = "api/issues/claimdetail/";

    // Remedy
    public const string PostRemedy = "api/issues/remedy/";
    public const string PatchRemedy = "api/issues/remedy/";
    public const string DeleteRemedy = "api/issues/remedy/";
    public const string PostRemedyDetail = "api/issues/remedydetail/";
    public const string PatchRemedyDetail = "api/issues/remedydetail/";
    public const string DeleteRemedyDetail = "api/issues/remedydetail/";

    // Dispute Fee
    public const string PostDisputeFee = "api/disputefee/";
    public const string PatchDisputeFee = "api/disputefee/";
    public const string DeleteDisputeFee = "api/disputefee/";
    public const string GetDisputeFee = "api/disputefee/";
    public const string GetDisputeFees = "api/disputefees/";

    // Dispute Flag
    public const string PostDisputeFlag = "api/disputeflag/";
    public const string PatchDisputeFlag = "api/disputeflag/";
    public const string DeleteDisputeFlag = "api/disputeflag/";
    public const string GetDisputeFlag = "api/disputeflag/";
    public const string GetDisputeFlags = "api/disputeflags/";
    public const string GetLinkedDisputeFlags = "api/linkeddisputeflags/";

    // Payment
    public const string PostPaymentTransaction = "api/paytransaction/";
    public const string PatchPaymentTransaction = "api/paytransaction/";
    public const string DeletePaymentTransaction = "api/paytransaction/";
    public const string PostPaymentTransactionExternalUpdate = "api/externalupdate/paymenttransaction/";
    public const string CheckPaymentTransaction = "api/checkbamboratransactions/";

    // Email Message
    public const string PostEmailMessage = "api/emailmessage/";
    public const string DeleteEmailMessage = "api/emailmessage/";
    public const string PatchEmailMessage = "api/emailmessage/";
    public const string GetEmailMessage = "api/emailmessage/";
    public const string GetDisputeEmailMessages = "api/disputeemailmessages/";

    // EmailAttachment
    public const string PostEmailAttachment = "api/emailattachment/";
    public const string GetEmailAttachments = "api/disputeemailattachments/";
    public const string DeleteEmailAttachment = "api/emailattachment/";

    // File
    public const string PostFile = "api/file/";
    public const string DeleteFile = "api/file/";
    public const string GetFile = "file/";
    public const string PostPdfFromHtml = "api/file/PDFfromhtml/";
    public const string FileUpload = "api/file-upload/";

    // File Description
    public const string PostFileDescription = "api/filedescription/";
    public const string PatchFileDescription = "api/filedescription/";
    public const string DeleteFileDescription = "api/filedescription/";
    public const string GetFileDescription = "api/filedescription/";
    public const string GetDisputeFileDescriptions = "api/disputefiledescriptions/";

    // File Info
    public const string PatchFileInfo = "api/fileinfo/";
    public const string GetFileInfo = "api/fileinfo/";
    public const string GetDisputeFileInfos = "api/disputefiles/";

    // Cms Archive
    public const string CmsArchiveSearch = "api/cmsarchive";
    public const string GetRecordCmsArchive = "api/cmsarchive/cmsrecord/";
    public const string PostNoteCmsArchive = "api/cmsarchive/cmsrecordnote/";
    public const string GetFileCmsArchive = "api/cmsarchive/file/";
    public const string PatchRecordCmsArchive = "api/cmsarchive/cmsrecord/";

    // Search
    public const string SearchByFileNumber = "api/search/disputefilenumber?";
    public const string SearchByDisputeInfo = "api/search/disputeInfo?";
    public const string SearchByAccessCode = "api/search/accesscode?";
    public const string SearchByParticipant = "api/search/participants?";
    public const string SearchByDisputeStatus = "api/search/disputestatus?";
    public const string SearchByHearing = "api/search/hearing?";
    public const string SearchByCrossApp = "api/search/crossapplication?";
    public const string SearchByClaims = "api/search/claims?";
    public const string SearchDisputeMessageOwners = "api/search/disputemessageowners?";
    public const string SearchDisputeStatusOwners = "api/search/disputestatusowners?";
    public const string SearchDisputeNoteOwners = "api/search/disputenoteowners?";
    public const string SearchDisputeDocumentOwners = "api/search/disputedocumentowners?";

    // Dashboard
    public const string AssignedHearings = "api/assignedhearings/";
    public const string UnAssignedHearings = "api/unassignedhearings";
    public const string AssignedDisputes = "api/assigneddisputes/";
    public const string UnAssignedDisputes = "api/unassigneddisputes";

    // Test
    public const string PostRunJob = "api/test/runjob/";

    // Autotext
    public const string PostAutotext = "api/autotext";
    public const string PatchAutotext = "api/autotext/";
    public const string DeleteAutotext = "api/autotext/";
    public const string GetAutotext = "api/autotext/";
    public const string GetAllAutotext = "api/autotext";

    // OutcomeDocContent
    public const string PostOutcomeDocContent = "api/outcomedoccontent/";
    public const string PatchOutcomeDocContent = "api/outcomedoccontent/";
    public const string DeleteOutcomeDocContent = "api/outcomedoccontent/";

    // OutcomeDocFile
    public const string PostOutcomeDocFile = "api/outcomedocfile/";
    public const string PatchOutcomeDocFile = "api/outcomedocfile/";
    public const string DeleteOutcomeDocFile = "api/outcomedocfile/";

    // OutcomeDocGroup
    public const string PostOutcomeDocGroup = "api/outcomedocgroup/";
    public const string PatchOutcomeDocGroup = "api/outcomedocgroup/";
    public const string DeleteOutcomeDocGroup = "api/outcomedocgroup/";
    public const string GetOutcomeDocGroup = "api/disputeoutcomedocgroup/";
    public const string GetDisputeOutcomeDocGroups = "api/disputeoutcomedocgroups/";

    // OutcomeDocRequest
    public const string PostOutcomeDocRequest = "api/outcomedocrequests/outcomedocrequest/";
    public const string PatchOutcomeDocRequest = "api/outcomedocrequests/outcomedocrequest/";
    public const string DeleteOutcomeDocRequest = "api/outcomedocrequests/outcomedocrequest/";
    public const string GetOutcomeDocRequest = "api/outcomedocrequests/outcomedocrequest/";
    public const string GetDisputeOutcomeDocRequests = "api/outcomedocrequests/outcomedocrequests/";

    // OutcomeDocReqItem
    public const string PostOutcomeDocReqItem = "api/outcomedocrequests/outcomedocrequestitem/";
    public const string PatchOutcomeDocReqItem = "api/outcomedocrequests/outcomedocrequestitem/";
    public const string DeleteOutcomeDocReqItem = "api/outcomedocrequests/outcomedocrequestitem/";

    // OutcomeDocDelivery
    public const string PostOutcomeDocDelivery = "api/outcomedocdelivery/";
    public const string PatchOutcomeDocDelivery = "api/outcomedocdelivery/";
    public const string DeleteOutcomeDocDelivery = "api/outcomedocdelivery/";
    public const string GetUndelivered = "api/outcomedocdelivery/undelivered";

    // DisputeProcessDetail
    public const string PostDisputeProcessDetail = "api/dispute/processdetail/";
    public const string PatchDisputeProcessDetail = "api/dispute/processdetail/";
    public const string DeleteDisputeProcessDetail = "api/dispute/processdetail/";
    public const string GetDisputeProcessDetail = "api/dispute/processdetail/";
    public const string GetAllDisputeProcessDetails = "api/dispute/disputeprocessdetails/";

    // Hearing Reporting
    public const string GetYearlyHearings = "api/yearlyhearingsummary/";
    public const string GetMonthlyHearings = "api/monthlyhearingsummary/";
    public const string GetDailyHearings = "api/dailyhearingdetail/";

    // Workflow Reports
    public const string GetWorkflowReports = "api/WorkflowReports/incompletedisputeitems/";

    // HearingAuditLogs
    public const string GetHearingAuditLogs = "api/audit/hearing?";

    // Custom Data Object
    public const string PostCustomObject = "api/customobject/";
    public const string PatchCustomObject = "api/customobject/";
    public const string DeleteCustomObject = "api/customobject/";
    public const string GetDisputeCustomObjects = "api/customobjects/";
    public const string GetCustomObject = "api/customobject/";

    // SchedulePeriod
    public const string PostSchedulePeriod = "api/schedulemanager/newscheduleperiod/";
    public const string PatchSchedulePeriod = "api/schedulemanager/scheduleperiod/";
    public const string GetSchedulePeriod = "api/schedulemanager/scheduleperiod/";

    // Schedule Block
    public const string PostScheduleBlock = "api/schedulemanager/scheduledblock/";
    public const string PatchScheduleBlock = "api/schedulemanager/scheduledblock/";
    public const string DeleteScheduleBlock = "api/schedulemanager/scheduledblock/";
    public const string GetScheduleBlock = "api/schedulemanager/scheduledblock/";
    public const string GetScheduleBlockByPeriod = "api/schedulemanager/scheduledblocks/";
    public const string GetScheduleBlockByDateRange = "api/schedulemanager/scheduledblocks?";

    // Schedule request
    public const string PostScheduleRequest = "api/schedulemanager/schedulerequest/newschedulerequest";
    public const string PatchScheduleRequest = "api/schedulemanager/schedulerequest/";
    public const string DeleteScheduleRequest = "api/schedulemanager/schedulerequest/";
    public const string GetScheduleRequest = "api/schedulemanager/schedulerequest/";
    public const string GetScheduleRequests = "api/schedulemanager/schedulerequest";

    // SubmissionReceipt
    public const string PostSubmissionReceipt = "api/submissionreceipt/";
    public const string PatchSubmissionReceipt = "api/submissionreceipt/";
    public const string DeleteSubmissionReceipt = "api/submissionreceipt/";
    public const string GetSubmissionReceipt = "api/submissionreceipt/";
    public const string GetSubmissionReceipts = "api/submissionreceipts/";

    // Substituted Service
    public const string PostSubstitutedService = "api/substitutedservice/";
    public const string PatchSubstitutedService = "api/substitutedservice/";
    public const string DeleteSubstitutedService = "api/substitutedservice/";
    public const string GetSubstitutedService = "api/substitutedservice/";
    public const string GetSubstitutedServices = "api/disputesubstitutedservices/";

    // External Custom Data Object
    public const string PostExternalCustomDataObject = "api/externalcustomdataobject/";
    public const string PatchExternalCustomDataObject = "api/externalcustomdataobject/";
    public const string DeleteExternalCustomDataObject = "api/externalcustomdataobject/";
    public const string GetExternalCustomDataObject = "api/externalcustomdataobject/";
    public const string GetExternalCustomDataObjects = "api/externalcustomdataobjects";

    // One time token routes
    public const string CreateToken = "ceuintake/login";
    public const string PostExternalCustomDataObjectOtt = "api/externalcustomdataobject/{0}";
    public const string PatchExternalCustomDataObjectOtt = "api/externalcustomdataobject/{0}/externalsession/{1}";
    public const string DeleteExternalCustomDataObjectOtt = "api/externalcustomdataobject/{0}/externalsession/{1}";

    // External File
    public const string PostExternalFile = "api/externalfiles/{0}";
    public const string PatchExternalFile = "api/externalfiles/{0}";
    public const string DeleteExternalFile = "api/externalfiles/{0}";
    public const string GetExternalFileByUrl = "api/externalfiles/";
    public const string GetExternalFiles = "api/externalfiles/";
    public const string PostPdfFromHtmlExternal = "api/externalfiles/PDFfromhtml/";

    // One time token routes
    public const string PostExternalFileOtt = "api/externalfiles/{0}/externalsession/{1}";
    public const string PatchExternalFileOtt = "api/externalfiles/{0}/externalsession/{1}";
    public const string DeleteExternalFileOtt = "api/externalfiles/{0}/externalsession/{1}";
    public const string PostPdfFromHtmlExternalOtt = "api/externalfiles/PDFfromhtml/{0}/externalsession/{1}";
}