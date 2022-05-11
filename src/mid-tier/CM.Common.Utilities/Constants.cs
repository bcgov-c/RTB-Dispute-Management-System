namespace CM.Common.Utilities;

public static class Constants
{
    public const int AccessCodeLength = 7;

    public const int FileUploadType = 1;

    public const int HearingDuration = 8;

    public const int UndefinedUserId = -999;

    public const int NotFoundOrIncorrect = -1;

    public const int DaysInWeek = 7;

    public const int OneRecordSaved = 1;

    public const double UnitMultiplier = 1024f;
}

public static class ServiceNames
{
    public const string MidTier = "mid-tier";

    public const string ReconciliationReportGenerator = "reconciliation-report-generator";

    public const string ReconciliationReportSender = "reconciliation-report-sender";

    public const string Pdf = "pdf";

    public const string EmailGenerator = "email-generator";

    public const string EmailNotification = "email-notification";

    public const string DataWarehouseService = "data-warehouse-service";

    public const string DataWarehouseReport = "data-warehouse-report";

    public const string PostedDecisionDataCollection = "posted-decision-data-collection";

    public const string PostedDecision = "posted-decision";

    public const string AdHocReport = "adhoc-report";
}

public static class SettingKeys
{
    public const string StorageType = "StorageType";

    public const string FileStorageRoot = "FileStorageRoot";

    public const string AwsStorageBucket = "AwsStorageBucket";

    public const string TempStorageRoot = "TempStorageRoot";

    public const string FileColdStorageRoot = "FileColdStorageRoot";

    public const string ClosedDaysForColdStorage = "ClosedDaysForColdStorage";

    public const string ColdStorageEnabled = "ColdStorageEnabled";

    public const string CommonFileStorageRoot = "CommonFileStorageRoot";

    public const string ExternalFileStorageRoot = "ExternalFileStorageRoot";

    public const string CmsFilesStorageRoot = "CmsFilesStorageRoot";

    public const string CommonFileRepositoryBaseUrl = "CommonFileRepositoryBaseUrl";

    public const string ExternalFileRepositoryBaseUrl = "ExternalFileRepositoryBaseUrl";

    public const string FileRepositoryBaseUrl = "FileRepositoryBaseUrl";

    public const string CmsFileRepositoryUrl = "CmsFileRepositoryUrl";

    public const string MerchantId = "MerchantId";

    public const string HashKey = "HashKey";

    public const string ReturnUrlIntake = "ReturnUrlIntake";

    public const string ReturnUrlAddLandlordIntake = "ReturnUrlAddLandlordIntake";

    public const string ReturnUrlDisputeAccess = "ReturnUrlDisputeAccess";

    public const string ReturnUrlOfficeSubmission = "ReturnUrlOfficeSubmission";

    public const string ReturnUrl = "ReturnUrl";

    public const string PaymentUri = "PaymentURI";

    public const string PaymentReportUri = "PaymentReportURI";

    public const string PaymentConfirmationNumberOfRetries = "PaymentConfirmationNumberOfRetries";

    public const string PaymentConfirmationDelayBetweenRetries = "PaymentConfirmationDelayBetweenRetries";

    public const string SmtpClientTimeout = "SmtpClientTimeout";

    public const string SmtpClientPort = "SmtpClientPort";

    public const string SmtpClientHost = "SmtpClientHost";

    public const string SmtpClientUsername = "SmtpClientUsername";

    public const string SmtpClientPassword = "SmtpClientPassword";

    public const string SmtpClientEnableSsl = "SmtpClientEnableSsl";

    public const string SmtpClientFromEmail = "SmtpClientFromEmail";

    public const string PdfPageHeaderHtmlKey = "PdfPageHeaderHtmlKey";

    public const string PdfPageFooterHtmlKey = "PdfPageFooterHtmlKey";

    public const string IntakeUrl = "IntakeUrl";

    public const string DisputeAccessUrl = "DisputeAccessUrl";

    public const string AdminLoginUrl = "AdminLoginUrl";

    public const string AdminSiteMinderUrl = "AdminSiteMinderUrl";

    public const string IntakeLoginUrl = "IntakeLoginUrl";

    public const string IntakeSiteMinderUrl = "IntakeSiteminderUrl";

    public const string AdditionalLandlordIntakeLoginUrl = "AdditionalLandlordIntakeLoginUrl";

    public const string AdditionalLandlordIntakeSiteminderUrl = "AdditionalLandlordIntakeSiteminderUrl";

    public const string OfficeLoginUrl = "OfficeLoginUrl";

    public const string OfficeSiteMinderUrl = "OfficeSiteminderUrl";

    public const string AccessDeniedUrl = "AccessDeniedUrl";

    public const string ThumbnailHeight = "ThumbnailHeight";

    public const string EgarmsHost = "EgarmsHost";

    public const string EgarmsUsername = "EgarmsUsername";

    public const string EgarmsPassword = "EgarmsPassword";

    public const string EgarmsFoldersRoot = "EgarmsFoldersRoot";

    public const string EgarmsFtpSubString = "EgarmsFtpSubString";

    public const string ArbScheduleEmailReportsTo = "ArbScheduleEmailReportsTo";

    public const string DisputeAbandonedDays = "DisputeAbandonedDays";

    public const string DisputeAbandonedNoPaymentDays = "DisputeAbandonedNoPaymentDays";

    public const string DisputeAbandonedNoServiceDays = "DisputeAbandonedNoServiceDays";

    public const string ParticipatoryApplicantEvidenceReminderPeriod = "ParticipatoryApplicantEvidenceReminderPeriod";

    public const string ParticipatoryRespondentEvidenceReminderPeriod = "ParticipatoryRespondentEvidenceReminderPeriod";

    public const string ParticipatoryEmergRespondentEvidenceReminderPeriod = "ParticipatoryEmergRespondentEvidenceReminderPeriod";

    public const string ParticipatoryHearingReminderPeriod = "ParticipatoryHearingReminderPeriod";

    public const string HearingReservationDuration = "HearingReservationDuration";

    public const string MaxHearingReservations = "MaxHearingReservations";

    public const string AricParticipatoryApplicantEvidenceReminderPeriod = "AricParticipatoryApplicantEvidenceReminderPeriod";

    public const string PfrParticipatoryApplicantEvidenceReminderPeriod = "PfrParticipatoryApplicantEvidenceReminderPeriod";

    public const string ExternalLoginUrl = "ExternalLoginUrl";

    public const string ExternalIntakeUiUrl = "ExternalIntakeUiUrl";

    public const string RecordingSftpHost = "RecordingSftpHost";

    public const string RecordingSftpPort = "RecordingSftpPort";

    public const string RecordingSftpKeyFile = "RecordingSftpKeyFile";

    public const string RecordingSftpUser = "RecordingSftpUser";

    public const string RecordingBatchSize = "RecordingBatchSize";

    public const string RecordingSourceDir = "RecordingSourceDir";
}

public static class ApiHeader
{
    public const string Token = "Token";

    public const string Authorization = "Authorization";

    public const string IfUnmodifiedSince = "If-Unmodified-Since";

    public const string XCsrfToken = "X-CSRF-TOKEN";

    public const string DisputeGuidToken = "DisputeGuid";
}

public static class Folders
{
    public const string ToSend = "ToSend";

    public const string Sent = "Sent";

    public const string Failed = "Failed";
}

public static class Pagination
{
    public const int DefaultPageSize = 20;
}

public static class ContextKeys
{
    public const string DisputeKey = "disputeGuid";

    public const string EntityId = "EntityId";

    public const string Guid = "Guid";
}

public static class CmCultureInfo
{
    public const string EnCulture = "en-US";
}

public static class FileMimeTypes
{
    public const string Pdf = "application/pdf";

    public const string TextCsv = "text/csv";

    public const string Excel = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
}

public static class ContentDisposition
{
    public const string Inline = "inline";
    public const string Attachment = "attachment";
}