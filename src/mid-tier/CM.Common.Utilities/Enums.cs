using System.ComponentModel;

namespace CM.Common.Utilities;

public enum Roles
{
    [Description(RoleNames.Admin)]
    StaffUser = 1,

    [Description(RoleNames.User)]
    ExternalUser = 2,

    [Description(RoleNames.Guest)]
    GuestUser = 3,

    [Description(RoleNames.AccessCode)]
    AccessCodeUser = 4,

    [Description(RoleNames.OfficePay)]
    OfficePayUser = 5,

    [Description(RoleNames.ExtendedUser)]
    ExtendedExternalUser = 6
}

public enum RoleGroup : byte
{
    InformationOfficer = 1,

    Arbitrator = 2,

    Admin = 4,

    Management = 5,

    Other = 9
}

public enum RoleSubType : byte
{
    Standard = 11,

    Senior = 12,

    Supervisor = 13,

    Level1 = 21,

    Level2 = 22,

    TeamLead = 24,

    Adjudicator = 25,

    Admin = 41
}

public enum DisputeHearingRole : byte
{
    Active = 1,

    Secondary = 2
}

public enum DisputeStage
{
    Any = -1,

    ApplicationInProgress = 0,

    ApplicationScreening = 2,

    ServingDocuments = 4,

    HearingPending = 6,

    Hearing = 8,

    DecisionAndPostSupport = 10
}

public enum DisputeStatuses
{
    Any = -1,

    SavedNotSubmitted = 0,

    UpdateRequired = 1,

    PaymentRequired = 2,

    FeeWaiverProofRequired = 3,

    OfficePaymentRequired = 4,

    OfficeUploadRequired = 5,

    PaperApplicationUpdateRequired = 6,

    Received = 20,

    AssessingApplication = 21,

    ConfirmingInformation = 22,

    ReadyForScheduling = 23,

    DocumentReadyToSend = 24,

    WaitingForDocumentsPickUp = 40,

    WaitingForProofOfService = 41,

    PartialProofOfService = 42,

    WaitingDismissalDecision = 43,

    WaitingResponse = 44,

    WaitingProcessDecision = 45,

    OpenForSubmissions = 60,

    ClosedForSubmissions = 61,

    ToBeRescheduled = 62,

    Adjourned = 63,

    AssignedForHearing = 80,

    WaitingForAllowedEvidence = 81,

    HearingToBeAdjourned = 82,

    UnknownAdjourned = 89,

    Withdrawn = 90,

    CancelledByRtb = 91,

    AbandonedNoPayment = 92,

    Dismissed = 93,

    AbandonedApplicantInaction = 94,

    ProcessDecisionRequired = 95,

    ScreeningDecisionRequired = 96,

    Deleted = 99,

    DecisionPending = 100,

    InterimDecisionPending = 101,

    DecisionReadyToSend = 102,

    Closed = 103,

    PostDecisionApplicationRequested = 104,

    ClarificationDecisionPending = 105,

    CorrectionDecisionPending = 106
}

public enum DisputeType : byte
{
    Rta = 1,

    Mhpta = 2
}

public enum DisputeSubType : byte
{
    ApplicantIsLandlord = 0,

    ApplicantIsTenant = 1
}

public enum DisputeProcess
{
    Any = -1,

    ParticipatoryHearing = 1,

    NonParticipatoryHearing = 2,

    ReviewRequest = 3,

    ReviewHearing = 4,

    JoinerRequest = 5,

    JoinerHearing = 6,

    RentIncrease = 7
}

public enum DisputeCreationMethod : byte
{
    Online = 1,

    Manual = 2,

    DataMigration = 3,

    OnlineRentIncrease = 4,

    PaperRentIncrease = 5,

    PossessionForRenovation = 6
}

public enum DisputeUrgency : byte
{
    Emergency = 1,

    Regular = 2,

    Deferred = 3
}

public enum TenancyGeoZone : byte
{
    Victoria = 1,

    Kelowna = 2,

    Burnaby = 3,

    Unknown = 9
}

public enum HearingPriority : byte
{
    Emergency = 1,

    Standard = 2,

    Deferred = 3,

    Duty = 4
}

public enum Errors
{
    [Description("TransactionRollback")]
    TransactionRollback = -1,

    ConcurrencyUpdate = -2
}

public enum SystemSettingsType : byte
{
    Payment = 0,

    PdfGeneration = 1,

    Email = 2,

    Cms = 3,

    FileManagement = 4,

    UserManagement = 5,

    AccessUrls = 6,

    EGarms = 7
}

public enum DisputeStatusName : byte
{
    Submitted = 1,

    NeedsUpdate = 2
}

public enum EvidenceOverride : byte
{
    Disabled = 0,

    Enabled = 1
}

public enum EmailStatus : byte
{
    UnSent = 0,

    Sent = 1,

    Pending = 2,

    Error = 3,

    MergeError = 4,

    NotPickedUp = 100,

    PickedUp = 101
}

public enum EmailSendMethod : byte
{
    Undefined = 0,

    Participant = 1,

    Custom = 2
}

public enum EmailMessageBodyType : byte
{
    Plain = 0,

    Html,

    Both
}

public enum AssignedTemplate
{
    CustomEmailTemplateId = 0,

    ParticipatoryDisputeWaitingForOfficePayment = 1,

    ParticipatoryDisputePaymentWaitingForFeeWaiverProof = 2,

    ParticipatoryApplicationSubmitted = 3,

    PaymentSubmitted = 4,

    ParticipatoryApplicantEvidenceReminder = 5,

    ParticipatoryRespondentEvidenceReminder = 6,

    ParticipatoryHearingReminder = 7,

    DisputeWithdrawn = 8,

    DisputeCancelled = 9,

    DisputeAbandonedForNoPaymentWithEmail = 10,

    ParticipatoryUpdateSubmitted = 11,

    EmergRespondentEvidenceReminder = 12,

    DirectRequestApplicationSubmitted = 14,

    DirectRequestOfficePaymentRequired = 15,

    DirectRequestUpdateSubmitted = 16,

    DisputeAbandonedDueToApplicantInaction = 21,

    DisputeAbandonedDueToApplicantServiceInaction = 22,

    AccessCodeRecovery = 23,

    AricParticipatoryApplicationSubmitted = 24,

    PfrParticipatoryApplicationSubmitted = 25,

    AricParticipatoryDisputeWaitingForOfficePayment = 26,

    PfrParticipatoryDisputeWaitingForOfficePayment = 27,

    AricParticipatoryUpdateSubmitted = 28,

    PfrParticipatoryUpdateSubmitted = 29,

    AricParticipatoryApplicantEvidenceReminder = 30,

    PfrParticipatoryApplicantEvidenceReminder = 31
}

public enum EmailMessageType
{
    Notification = 0,

    SystemEmail = 1,

    CustomEmail = 2,

    Manual = 99,

    Pickup = 100
}

public enum ParticipantRole : byte
{
    Applicant = 1,

    Respondent = 2
}

public enum ParticipantType : byte
{
    Business = 1,

    Individual = 2,

    AgentOrLawyer = 3,

    AdvocateOrAssistant = 4
}

public enum ParticipantStatus : byte
{
    NotAvailable = 0,

    NotValidated = 1,

    ValidatedAndParticipating = 2,

    NotParticipating = 3,

    Removed = 4,

    Deleted = 5
}

public enum ClaimStatus
{
    NotSer = 0,

    Include = 1,

    Withdrawn = 2,

    Sever = 3,

    Resolved = 4,

    Dismiss = 5,

    Removed = 6,

    Deleted = 7
}

public enum SearchSortField
{
    Submitted = 1,

    Created = 2,

    Modified = 3,

    Status = 4,

    FileCreatedDate = 5,

    None = 100
}

public enum SortDir
{
    Asc = 0,

    Desc
}

public enum PaymentMethod : byte
{
    Online = 1,

    Office = 2,

    FeeWaiver = 3
}

public enum PaymentStatus : byte
{
    Pending = 1,

    ApprovedOrPaid = 2,

    Rejected = 3,

    Cancelled = 4,

    PaidButCancelled = 5
}

public enum PaymentVerified : byte
{
    NotChecked = 0,

    Checked = 1,

    Error = 2
}

public enum PaymentProvider : byte
{
    Bambora = 1
}

public enum TransactionSiteSource
{
    Intake = 1,

    DisputeAccess = 2,

    OfficeSubmission = 3
}

public enum AttachmentType : byte
{
    Dispute = 1,

    Common = 2
}

public enum HearingType : byte
{
    ConferenceCall = 1,

    FaceToFace = 2,

    PreConferenceCall = 3,

    Other = 4
}

public enum CommonFileType : byte
{
    NotSet = 0,

    UserGuide = 1,

    Form = 2,

    ProfilePicture = 3,

    Signature = 4
}

public enum ExternalFileType : byte
{
    NotSet = 0,

    UserGuide = 1
}

public enum FileType : byte
{
    NotSet = 0,

    ExternalEvidence = 1,

    Notice = 2,

    InternalDocuments = 3,

    ExternalNonEvidence = 4,

    Other = 5,

    AnonymousExternalDocument = 7,

    ExcelDlReport = 9,

    HearingRecording = 10
}

public enum OutcomeDocFileTypes
{
    PublicDecision = 1,

    ExternalWorkingDocument = 255
}

public enum FileMethod : byte
{
    UploadNow = 100,

    UploadLater = 101,

    Method103 = 103,

    DropOf = 104
}

public enum FilePackageType : byte
{
    IntakeSubmission = 1,

    DisputeAccessSubmission = 2,

    FilePackageType3 = 3
}

public enum ApiCallType : byte
{
    Get = 1,

    Post = 2,

    Patch = 3,

    Delete = 4
}

public enum Months
{
    January = 1,

    February,

    March,

    April,

    May,

    June,

    July,

    August,

    September,

    October,

    November,

    December
}

public enum DisputeHearingHistorySearchType
{
    DisputeGuid = 1,

    HearingId = 2
}

public enum BridgeStatus
{
    Active = 1,

    Inactive = 2
}

public enum DisputeHearingStatus : byte
{
    Active = 1,

    NotActive = 2
}

public enum TokenMethod : byte
{
    InternalLogin = 1,

    SiteMinderLogin = 2
}

public enum ExternalUpdateSearchMethod : byte
{
    FileNumber = 1,

    AccessCode = 2
}

public enum NoticeTypes : byte
{
    GeneratedDisputeNotice = 1,

    UploadedDisputeNotice = 2,

    GeneratedAmendmentNotice = 3,

    UploadedAmendmentNotice = 4,

    UploadedOtherNotice = 5
}

public enum NoticeDeliveryMethods : byte
{
    Email = 1,

    PickUp = 2,

    Mail = 3,

    Fax = 4,

    UserSubmitted = 5
}

public enum DeliveryMethod : byte
{
    Email = 1,

    Pickup = 2,

    Mail = 3,

    Custom = 4
}

public enum DeliveryPriority : byte
{
    Low = 0,

    Normal = 1,

    High = 2,

    Failed = 3
}

public enum RequestDocType : byte
{
    DisputeNoticeOnly = 1,

    EvidenceOnly = 2,

    DisputeAndEvidence = 3,

    DecisionOrOrder = 4,

    NoticeOrReview = 5,

    Other = 6,

    InitialHearingApplicantDocuments = 10,

    InitialHearingRespondentDocuments = 11,

    InitialHearingDecisionsAndOrders = 12,

    ReviewHearingApplicantDocuments = 13,

    ReviewHearingRespondentDocuments = 14,

    ReviewHearingDecisionsAndOrders = 15
}

public enum NoticePackageDeliveryMethod : byte
{
    Email = 1,

    OfficePickup = 2
}

public enum ReconcileStatus : byte
{
    NotStarted = 0,

    AddingToCurrentReport = 1,

    SendingReport = 2,

    Reconciled = 3,

    FailedToGenerate = 4,

    FailedToSend = 5
}

public enum TaskSortField
{
    TaskPriority = 1,

    TaskDueDate = 2,

    CreatedDate = 3,

    TaskOwnerId = 4,

    DateTaskCompleted = 5
}

public enum DisputeFeeType : byte
{
    Intake = 1,

    ReviewRequest = 2,

    Other = 3,

    LandlordIntake = 4
}

public enum ImportStatus : byte
{
    InProgress = 1,

    Complete,

    Error
}

public enum TaskStatus : byte
{
    Incomplete = 0,

    Complete = 1
}

public enum NoteLinkedTo : byte
{
    Dispute = 0,

    Participant = 1,

    Claim = 2,

    FileDescription = 3,

    Notice = 4,

    Hearing = 5,

    File1 = 8,

    File2 = 9
}

public enum NoteType : byte
{
    Internal = 1,

    Dispute = 2
}

public enum NoteStatus : byte
{
    Inactive = 0,

    Active = 1,

    Deleted = 2
}

public enum TextType : byte
{
    Legislation = 1,

    Decision = 2,

    Email = 3
}

public enum JoinerType
{
    Parent = 0,

    Child = 1
}

public enum ParticipantTypes : byte
{
    Applicant = 1,

    Agent = 2,

    Respondent = 3
}

public enum SortByDateFields
{
    CreatedDate = 1,

    InitialPaymentDate = 2,

    SubmittedDate = 3,

    OriginalNoticeDate = 4,

    StatusStartDate = 5
}

public enum WeekDay
{
    Monday = 1,

    Tuesday = 2,

    Wednesday = 3,

    Thursday = 4,

    Friday = 5,

    Saturday = 6,

    Sunday = 7
}

public enum FactTable
{
    FDisputeSummary = 1,

    FTimeStatistics = 2,

    FHearingSummary = 3,

    FIntakeProcessing = 4
}

public enum GroupParticipantRole
{
    Applicant = 1,

    Respondent = 2
}

public enum AwardRemediesStatuses : byte
{
    AwardApp = 5,

    AwardResp = 6,

    Mediated = 7,

    Split = 8
}

public enum RemedyStatus : byte
{
    NotSet = 0,

    Open = 1,

    Withdrawn = 2,

    Dismissed = 3,

    Severed = 4,

    AwardApplicant = 5,

    AwardTenant = 6,

    Mediated = 7,

    SplitAward = 8,

    NotDecided = 21
}

public enum SharedHearingLinkType
{
    Single = 1,

    Cross = 2
}

public enum ServedBy
{
    True = 1
}

public enum FileDescriptionCategories : byte
{
    MonetaryOrderWorksheet = 1,

    TenancyAgreement,

    OtherEvidenceNotAssociatedToClaims,

    OtherEvidenceAssociatedToClaims,

    PaymentInformation,

    Nine = 9
}

public enum FileDescriptionCodes : byte
{
    MonetaryOrderWorksheet = 102,

    ProofOfDamage = 103,

    TenancyAgreement = 108,

    UtilityBills = 127
}

public enum Offices
{
    Rtbbc = 1
}

public enum TasksStatus
{
    Incomplete = 0,

    Complete = 1
}

public enum HearingChangeType
{
    CreateHearing = 1,

    ChangeOwner = 2,

    ChangeHearingInfo = 3,

    DeleteHearing = 4,

    AddDisputeLink = 5,

    ModifyDisputeLink = 6,

    DeleteDisputeLink = 7,

    HearingReservation = 20,

    HearingBook = 21,

    HearingCancel = 22,

    HoldHearing = 23
}

public enum HearingAuditLogCase
{
    CreateHearingFromSchedule = 1,

    CreateHearing = 2,

    ChangeHearingOwner = 3,

    ChangeHearing = 4,

    DeleteHearing = 5,

    CreateDisputeHearing = 6,

    ChangeDisputeHearing = 7,

    DeleteDisputeHearing = 8,

    HearingReservation = 20,

    HearingBook = 21,

    HearingCancel = 22,

    HoldHearing = 23
}

public enum TenancyUnitType
{
    Apartment = 1,

    BasementSuit = 2,

    Home = 3,

    Detached = 4
}

public enum StorageType : byte
{
    File = 1,

    Aws = 2,

    FileCold = 3
}

public enum CustomObjectType : byte
{
    AriUnits = 1,

    Tdb = 2
}

public enum ExternalCustomObjectType : byte
{
    AriUnits = 1,

    Tdb = 2
}

public enum ParticipationStatus
{
    NotSet = 0,

    Participated = 1,

    NoParticipation = 2
}

public enum PartyPatchType
{
    SoftDelete = 1,

    SoftUndelete = 2,

    Null = 3
}

public enum EngagementType
{
    FtEmployee = 1,

    PtEmployee = 2,

    FtContractor = 3,

    PtContractor = 4
}

public enum ScheduleStatus
{
    NotIncludedInHearing = 0,

    IncludedInHearing = 1,

    IncludedInOther = 2
}

public enum ScheduleSubStatus
{
    All = 1,

    DutyEmergency = 2,

    Emergency = 3
}

public enum DisputeComplexity
{
    Simple = 1,

    Standard = 2,

    Complex = 3,

    VeryComplex = 4
}

public enum DisputeStorageType : byte
{
    Hot = 1,

    Cold = 2
}

public enum FileStatus : byte
{
    NotReviewed = 0,

    Accepted = 1,

    NotAccepted = 2,

    Invalid = 3
}

public enum ExternalFileStatus : byte
{
    NotReviewed = 0,

    Accepted = 1,

    NotAccepted = 2,

    Invalid = 3
}

public enum CmTimeZone
{
    PacificTime = 1
}

public enum PeriodStatus
{
    OpenForEditing = 1,

    Inactive = 100,

    LockedForGeneration = 101,

    LockedForBalancing = 102,

    LockedForUse = 103
}

public enum BlockType
{
    WorkingTime = 1,

    Duty = 2,

    Vacation = 100,

    Other = 102
}

public enum BlockStatus
{
    Committed = 1,

    Draft = 2,

    Approval = 3
}

public enum BlockSubStatus
{
    Tbd = 1
}

public enum ScheduleRequestStatus
{
    Open = 1,

    Denied = 2,

    Approved = 3,

    Implemented = 4
}

public enum ScheduleRequestSubStatus
{
    Tbd = 1
}

public enum TemplateGroup
{
    Notification = 1,

    NoticeSending = 2,

    DecisionSending = 3
}

public enum OutcomeDocStatus
{
    Active = 1,

    Inactive = 2
}

public enum OutcomeDocRequestType
{
    Correction = 1,

    Clarification = 2,

    ReviewRequest = 3
}

public enum OutcomeDocRequestSubType
{
    ToBeDefined = 1
}

public enum OutcomeDocAffectedDocuments
{
    NotSet = 0,

    DecisionOnly = 1,

    MonetaryOrderOnly = 2,

    OrderOfPossessionOnly = 3,

    DecisionAndMonetaryOrder = 4,

    DecisionAndOrderOfPossession = 5,

    MonetaryOrderAndOrderOfPossession = 6,

    DecisionMonetaryPossession = 7
}

public enum OutcomeDocRequestItemType
{
    TypingError = 1,

    MathError = 2,

    ObviousError = 3,

    InadvertentOmission = 4,

    Clarification = 5,

    LateFiling = 6,

    UnableToAttend = 7,

    NewAndRelevantEvidence = 8,

    DecisionObtainedByFraud = 9
}

public enum OutcomeDocRequestItemSubType
{
    ToBeDefined = 1
}

public enum MigrationSourceOfTruth : byte
{
    Dms = 1,

    CmsArchiveViewer = 2,

    SplitForGrouping = 3
}

public enum ParticipantEmailErrorCodes
{
    EmailFound,

    ParticipantNotFound,

    ProvidedParticipantIsNotAssociatedToDispute,

    ProvidedParticipantDoesNotHaveEmail
}

public enum CustomObjectStorageType
{
    Json = 1,

    Jsonb = 2,

    Text = 3
}

public enum TaskType : byte
{
    Standard = 1,

    Communication = 2,

    System = 3
}

public enum TaskSubType : byte
{
    InformationOfficer = 1,

    Arbitrator = 2,

    Admin = 4,

    Management = 5,

    Other = 9
}

public enum CustomObjectSortField
{
    CreatedNewestFirst = 1,

    CreatedOldestFirst = 2,

    ModifiedNewestFirst = 3,

    ModifiedOldestFirst = 4
}