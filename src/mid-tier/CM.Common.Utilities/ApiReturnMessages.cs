namespace CM.Common.Utilities;

public static class ApiReturnMessages
{
    #region Auth
    public const string Authorized = "Authorized";
    public const string WrongToken = "Wrong token specified";
    #endregion

    #region External Auth
    public const string InvalidSessionClaims = "Invalid session claims";
    public const string InvalidRefreshToken = "Invalid refresh token";
    public const string RefreshTokenExpired = "Refresh token is expired";
    public const string InvalidSessionTokenForRotation = "Invalid session token for rotation";
    #endregion

    // General messages
    public const string Succeeded = "Succeeded";
    public const string ConflictOccured = "Conflict occured";
    public const string Deleted = "Deleted";
    public const string Ok = "Ok";

    #region Users
    public const string InactiveUser = "user with ID={0} does not match an active role 1 user in the dispute";
    public const string UserDoesNotExist = "user with ID={0} does not exist";
    public const string InvalidUser = "Invalid system user ID provided";
    public const string DuplicateRecord = "An active role record already exists";
    public const string OwnerNotAssociated = "The owner is not associated to this dispute";
    public const string InternalUserProfileExists = "A profile already exists for this user, Update the current profile";
    public const string InvalidManagedById = "ManagedById must be a valid active role 1 user id";
    public const string InvalidExternalCustomDataObjectOwner = "The owner_id value provided is not valid";
    public const string InvalidExpiryDate = "The external user session expiry date time must be in the future";

    public const string DuplicateEmailForRole = "Email address already exists for this role, a new user with the same email cannot be created";
    public const string DuplicateUsernameForRole = "User name already exists for this role, a new user with the same user name cannot be created";
    public const string InactiveUsernameExists = "User name already exists for this role but is not active. Set the current user to active";
    public const string InactiveEmailExists = "User email already exists for this role but is not active. Set the current user to active";
    public const string SchedulerOnlyForStaffUsers = "Scheduler can only be set on staff user accounts";
    public const string DashboardAccessOnlyAdminAccess = "DashboardAccess can only be set on staff user with Admin Access accounts";

    public const string InvalidActiveAdminUser = "the system_user_id is not a valid active Role 1 user ID";

    public const string InvalidErrorOwner = "Invalid error owner id";
    #endregion

    #region Dispute
    public const string DisputeDoesNotExist = "Dispute with ID={0} does not exist";
    public const string InvalidDisputeGuid = "Invalid dispute guid";
    public const string DisputeStatusDoesNotExist = "Dispute status with ID={0} does not exist";
    public const string DisputeGuidRequired = "Dispute Guid is Required";
    public const string DisputeFileNumberRequired = "File Number is Required for Dispute {0}";
    public const string FirstDisputeStatus = "Status and Stage should not be null at first call";
    public const string AtLeastOne = "The stage, status, process and/or owner must be provided";
    public const string CurrentStatusCannotBeModified = "The current status cannot be modified by access code users";
    public const string InvalidCreationMethod = "The creation_method filter is invalid";
    public const string InvalidFilenumberCount = "A valid 8-9 digit file number is required";
    #endregion

    // Dispute Flag
    public const string InvalidFlagOwnerId = "Invalid flag owner value";
    public const string InvalidFlagParticipant = "Invalid flag participant value";

    // Dispute Process Detail
    public const string AssociatedProcessMustBeUsed = "The associated process value must be already used in the dispute statuses";

    // Intake Questions
    public const string DuplicateIndex = "The duplicated record is existed for {0} dispute and {1} question name";

    // Claims
    public const string ClaimGroupAlreadyExist = "Claim group for dispute {0} already exists";
    public const string ClaimGroupDoesNotExist = "Claim group with ID={0} does not exist";
    public const string ClaimChildReference = "Claim with ID={0} has child references. Remove them first";
    public const string ClaimDoesNotExist = "Claim with ID={0} does not exist";

    // Remedies
    public const string RemedyChildReference = "Remedy with ID={0} has child references. Remove them first";
    public const string RemedyDoesNotExist = "Remedy with ID={0} does not exist";

    #region Participants
    public const string ParticipantReference = "This participant is related to Claim Group with ID={0}";
    public const string ParticipantWithDisputeDoesNotExist = "Participant with ID={0} and DisputeGuid={1} does not exist";
    public const string ParticipantDoesNotExist = "Participant with ID={0} does not exist";
    public const string ParticipantEmailDoesNotExist = "Provided participant_id ({0}) does not have an email address";
    public const string ParticipantEmailIsNotAssociatedToDispute = "Provided participant id ({0}) is not associated to the provided dispute guid";
    public const string ParticipantWithAccessCodeDoesNotExist = "Participant with AccessCode={0} does not exist";
    public const string InvalidParticipant = "Participant ID is invalid";
    public const string ParticipantRemoved = "Participant removed";
    public const string ParticipantRemovedOrDeleted = "Participant ID={0} has been removed from this dispute";
    public const string InvalidParticipantOnDispute = "A valid active participant ID={0} on this dispute is required";
    public const string EmptyParticipantList = "At least one participant id must be provided and all must be associated to the provided dispute guid";

    public const string SendAccessCodeRecoveryEmail = "Access Code recovery request initiated";

    public const string IdentityParticipantDoesNotExist = "IdentityParticipant with ID={0} does not exist";
    public const string SameDisputeAssociation = "The participant Id's for this identity record cannot be associated to the same dispute guid";
    #endregion

    // Payment
    public const string DisputeFeeChildReference = "Dispute fee with ID={0} has child references. Remove them first";
    public const string DisputeFeeDoesNotExist = "Dispute fee with ID={0} does not exist";
    public const string PaymentStatusIsInvalid = "Payment status can only be set to 1 (pending), 2 (paid) or 3 (rejected). No other values are accepted";
    public const string PaymentIsNotOnline = "Payment transaction with ID = {0} is not an online payment";
    public const string InvalidPaymentTransaction = "Payment transaction with ID = {0} is not a valid active transaction";
    public const string TransactionSiteSourceIsRequired = "transaction site source is required when payment method = 1";
    public const string InvalidOrUnassociatedDisputeFee = "The provided dispute fee ID is not valid or not associated to the provided dispute guid";

    #region Email
    public const string EmailAlreadySent = "This email message is already sent. Could not be deleted";
    public const string EmailMessageDoesNotExist = "Email message with ID={0} does not exist";
    public const string ParticipantIdIsSetted = "ParticipantId is already setted.";
    public const string InvalidPickupMessage = "This is not a valid email message id for pickup.";
    public const string EmailSent = "Email sent";
    public const string EmailSentFailed = "The verification email could not be created, please try again later";
    public const string ParticipantPrimaryPhoneDoesNotExist = "The participant does not have a primary phone number on file";
    public const string ParticipantSecondaryPhoneDoesNotExist = "The participant does not have a secondary phone number on file";
    public const string InvalidRelatedMessage = "Related message ID must be a valid ID of an email message associated to this dispute";
    public const string SendMethodIsRequired = "Send method is required";
    public const string ParticipantEmailAlreadyVerified = "This participant email has already been verified";
    public const string ParticipantPrimaryPhoneAlreadyVerified = "This participants primary phone number has already been verified";
    public const string ParticipantSecondaryPhoneAlreadyVerified = "This participants secondary phone number has already been verified";
    public const string InvalidVerificationCode = "The provided verification code does not match";
    #endregion

    #region Hearings
    public const string HearingDoesNotExist = "The hearing with ID={0} does not exist";
    public const string InvalidHearingForSwitch = "Hearing ID {0} is not a valid hearing in the future";
    public const string HearingsDatesNotMatch = "Hearing start and end times must match";
    public const string NotBookedHearing = "Hearing ID {0} must be booked first before it can be rescheduled.";
    public const string AlreadyBookedHearing = "Hearing ID {0} is already booked and cannot be used for reschedule.";
    public const string ReserveMinHearingStartTime = "The min hearing start time must be at least 7 days from now";
    public const string InvalidMinMaxHearingDate = "The maximum hearing date time must be after";
    public const string MaxHearingReservationsExceed = "The maximum number of hearings to reserve exceeds the allowed amount of {0}";
    public const string InvalidHearingId = "A valid hearing ID is required";
    public const string DisputeGuidRequiredForBooking = "A valid dispute guid is required to book a hearing";
    public const string HearingNotReserved = "The hearing you are trying to book is no longer reserved";
    public const string HearingIsReserved = "The hearing you are trying to book is reserved";
    public const string DeleteReservedHearing = "This hearing is reserved and cannot be deleted";
    public const string ReservedHearing = "The Hearing ID {0} is reserved and cannot be used for reschedule";
    public const string ReservedHearingForReassign = "The Hearing ID {0} is reserved and cannot be used for reassign";
    public const string NotHoldAssociatedHearings = "This hearing has associated dispute(s) and cannot be put on hold";
    public const string HearingIsReservedForHold = "This hearing is already reserved";
    public const string AssociatedDisputeHearing = "This hearing is associated to DisputeHearingId = {0}.";
    public const string PreParticipationStatusRequired = "PreParticipationStatus is Required";
    public const string NotFutureHearing = "The hearing id provided is not a valid future hearing id";
    public const string InvalidParticipationStatusBy = "The participation status by ID must be a valid system user ID, and for external users it must be associated to the dispute file";
    public const string InvalidPreParticipationStatusBy = "The pre participation status by ID must be a valid system user ID, and for external users it must be associated to the dispute file";
    public const string InvalidPreParticipationStatusDate = "The pre participation status date must be a valid date in the past";
    public const string InvalidReservedUntilDateTime = "The hearing reserved until value must be a valid UTC date time in the future";
    #endregion

    #region File
    public const string FileExtensionDifferent = "File extension not the same as in originally saved";
    public const string AddedByNotParticipant = "AddedBy with ID={0} not match the participant ID of a participant in the dispute";
    public const string FileDoesNotExist = "The file with ID={0} does not exist";
    public const string CommonFileDoesNotExist = "The common file with ID={0} does not exist";
    public const string UnknownAttachmentType = "Unknown attachment type";
    public const string FileIdIsRequired = "File Id is required";
    public const string CommonFileIdIsRequired = "Common File Id is required";
    public const string InvalidCommonFileIdProvided = "Please provide a valid common file ID";
    public const string FileDescriptionDoesNotExist = "{0} ID={1} is not a valid File Description ID associated to this dispute";
    public const string FileDescriptionInvalid = "File Description with ID={0} and DisputeGuid={1} does not exist";
    public const string InvalidFileName = "Filename {0} contains invalid characters";
    public const string FileUploadError = "File upload aborted";
    public const string FileUploadChunkSuccess = "File chunk upload succeeded";
    public const string FileNameIsMissing = "File name is not specified";
    public const string DeletedSource = "The source file that you requested has been deleted from the system and is no longer available";
    public const string ProofFileDescriptionInvalid = "Proof File Description with ID={0} and DisputeGuid={1} does not exist";
    public const string OtherProofFileDescriptionInvalid = "Other Proof File Description with ID={0} and DisputeGuid={1} does not exist";
    #endregion

    // CommonFile
    public const string ProfilePictureFileExists = "No common file located that matches the profile_picture_id provided";
    public const string SignatureFileExists = "No common file located that matches the signature_file_id provided";

    // Notice
    public const string NoticeChildReference = "Notice with ID={0} has child references. Remove them first";
    public const string NoticeDoesNotExist = "The notice with ID={0} does not exist";
    public const string SameParticipantNotAllowed = "The participant ID cannot be the same as the served by ID";
    public const string InvalidParentNotice = "The parent notice ID is invalid";
    public const string ParentNoticeRequired = "The parent notice ID is required";
    public const string InvalidParentNoticeHierarchy = "The parent notice ID cannot be set to the same value as the current notice_id";
    public const string DeliveryDeadlineIssue = "You cannot enable a service deadline without setting a positive service deadline days value or a future service deadline date";
    public const string SecondServiceDeadlineDateIssue = "Second service deadline date must be a date in the future";

    // Note
    public const string LinkedObjectNotExistsOrInactive = "The {0} with ID={1} not exists or inactive";

    // Task
    public const string TaskOwnerInvalidRole = "task_owner_id does not match a valid Role 1 user";
    public const string TaskLinkedIdRequired = "task_linked_id is required in case when task_linked_to is greater then 0";
    public const string EmailMessageNotFound = "ID={0} does not match a valid or active email message";
    public const string InvalidTaskActivityType = "Invalid TaskActivityType";

    // Dashboard Search
    public const string UserNotValidOrInactive = "User not valid or inactive";
    public const string CreatedByRequired = "A created by value is required for this search";
    public const string OwnedByRequired = "An owned by value is required for this search";
    public const string UserNotAdmin = "The value {0} is not a valid Role 1 user Id";

    // File Package
    public const string CreatorIdAccessCodeRequired = "The creator participant ID or Access Code is required.";
    public const string NotAssociatedToDispute = "The creator participant ID or Access Code is not associated to this dispute.";

    // File Package Service
    public const string FilePackageDoesNotExist = "The FilePackage with ID={0} does not exist";
    public const string OtherParticipantNameConflictParticipantId = "Participant ID and Other Participant Name cannot be set on the same record";
    public const string ServedByConflictParticipantId = "The served participant ID cannot be the same as the served by ID";
    public const string ServedByIsInvalid = "Served by participant ID is invalid";
    public const string InvalidFilePackageService = "File package service ID is invalid";

    // Outcome Document
    public const string OutcomeDocGroupDoesNotExist = "The outcomeDocGroup with ID={0} does not exist";
    public const string OutcomeDocFileDoesNotExist = "The outcomeDocFile with ID={0} does not exist";
    public const string DuplicateOutcomeDocDeliveryRecordByParticipantAndFileId = "A delivery for Participant ID={0} and Outcome Doc File ID={1} already exists.";
    public const string IncorrectDeliveryParticipantIds = "At least one delivery participant id must be provided and all delivery participant ids must be participants associated to the provided dispute guid.";

    // Access Code
    public const string IncorrectAccessCode = "Provided Access Code is incorrect";

    // Cms Archive
    public const string CmsArchiveSearchType1 = "File Number is required for search type 1.";
    public const string CmsArchiveSearchType2 = "Reference Number is required for search type 2.";
    public const string CmsArchiveSearchType3 = "Dispute Address or Dispute City should be provided.";
    public const string CmsArchiveSearchType4 = "First Name or Last Name or DayTime Phone or Email Address should be provided.";
    public const string FileNumberNotExist = "File number does note exist";

    // Conference Bridge
    public const string ModeratorCodeExists = "moderator_code provided is already associated to a conference bridge";
    public const string ParticipantCodeExists = "participant_code provided is already associated to a conference bridge";
    public const string PreferredOwnerIsNotValid = "preferred_owner is not a valid active role 1 user";
    public const string PreferredOwnerIsNotArbitrator = "preferred_owner is not associated to arbitrator group";
    public const string TimeOverlap = "The preferred start and end time overlap with an existing bridge start end time for this owner";
    public const string ConferenceBridgeDoesNotExist = "Conference Bridge with ID={0} does not exist";
    public const string ConferenceBridgeIsBooked = "The conference bridge is already booked during the time provided";
    public const string ConferenceBridgeDoesNotExistOrInactive = "Conference Bridge does not exist or Inactive";

    // Dispute Hearing
    public const string AtLeastOneActiveHearing = "Multiple disputes cannot be added to a hearing without one being set to primary by setting dispute hearing role to 1";
    public const string PrimaryIsAssociated = "A primary dispute file is already associated to this hearing - only one primary is allowed";
    public const string DisputeHearingHistoryDisputeGuidRequired = "Search type 1 (dispute) requires a valid dispute_guid";
    public const string DisputeHearingHistoryHearingIdRequired = "Search type 2 (hearing) requires a valid hearing_id";
    public const string DisputeGuidOrExternalFileIdRequired = "DisputeGuid Or ExternalFileId is Required.";
    public const string FutureHearingExist = "Dispute GUID provided is already associated to an future dispute";
    public const string OverlappedHearingExist = "Dispute GUID provided is already booked during this time period";
    public const string EmptyDisputeHearings = "Empty Dispute Hearings";
    public const string HearingNotAssociatedToDispute = "The provided hearing Id is not associated to the provided dispute guid";

    // Scheduled Hearing
    public const string DurationIsNotValid = "A hearing start and end date and time must be provided and the duration cannot exceed 8 hours";
    public const string HearingOwnerIsRequired = "Hearing type 1 requires a hearing owner";
    public const string HearingTypeAssignIsNotValid = "Hearing type 1 can only be assigned to Role 1 users in Role Group 2";
    public const string HearingOwnerIsBlocked = "The hearing owner is already booked during the time provided";
    public const string ConferenceBridgeIsNotProvided = "Hearing type {0} requires a conference bridge";
    public const string StaffParticipantIsNotValid = "Staff Participant {0} is invalid";
    public const string StaffParticipantIsBlocked = "staff_participant {0} is already booked during the time period provided";
    public const string DatePartShouldBeTheSameValue = "Start and End date part should be the same";

    // Hearing Reporting
    public const string AtLeastOneHearingPriority = "At least on hearing priority value must be provided";
    public const string NotAssociatedStaticDisputeGuidInPast = "Static dispute guid must be associated to a hearing with a start time in the past";
    public const string NotAssociatedMovedDisputeGuidInPast = "Moved dispute guid must be associated to a hearing with a start time in the future";
    public const string StaticAlreadyLinkedToAnotherDispute = "The static dispute guid is already linked to another dispute guid";
    public const string MovedAlreadyLinkedToAnotherDispute = "The moved dispute guid is already linked to another dispute guid";

    // Hearing Import
    public const string HearingImportExist = "The record with provided FileId is already exists";
    public const string HearingImportCreateFailed = "The Hearing Import initial creation failed";

    // External Update
    public const string FirstNameIsRequired = "First name is required when participant type is not 1";
    public const string LastNameIsRequired = "Last name is required when participant type is not 1";
    public const string BusinessNameIsRequired = "Business name is required for participant type 1";
    public const string BusinessFirstNameIsRequired = "Business contact first name is required for participant type 1";
    public const string BusinessLastNameIsRequired = "Business contact last name is required for participant type 1";
    public const string FileNumberIsInvalid = "File number not provided or invalid";
    public const string AccessCodeIsInvalid = "Participant access code not provided or invalid";

    // Sub Service
    public const string SubServiceApprovedByIncorrect = "Sub service approved by ID={0} is not valid";
    public const string SubServiceNotFound = "The sub service ID ={0}  is invalid";
    public const string ServiceByParticipantNotExists = "Sub service by participant ID={0} is not exists.";
    public const string ServiceToParticipantNotExists = "Sub service to participant ID={0} is not exists.";

    public const string InvalidEmail = "Invalid email";
    public const string InvalidEmailTo = "Email address in <email_to> field is invalid";
    public const string InvalidEmailRecipientBatchId = "Invalid email recipients batch id";
    public const string InvalidEmailTemplateId = "Invalid email template ID";

    public const string IncorrectClaimCode = "At least one claim code integer must be provided";

    // Hearing Audit Log
    public const string HearingAuditLogSearchTypeStartDateRequired = "A specific start date must be provided for this type of search.";
    public const string HearingAuditLogSearchTypeEndDateRequired = "A specific end date must be provided for this type of search.";
    public const string HearingAuditLogSearchType1 = "Search type 1 (hearing) requires a valid hearing_id";
    public const string HearingAuditLogSearchType1Exists = "The hearing with ID={0} does not exist";
    public const string HearingAuditLogSearchType2 = "Search type 2 (hearing) requires a valid dispute_guid";
    public const string HearingAuditLogSearchType2Exists = "Dispute with ID={0} does not exist";
    public const string HearingAuditLogSearchType3 = "Search type 3 (hearing) requires a valid system_user_id";
    public const string HearingAuditLogSearchType3Exists = "hearing_owner = {0} does not exist as a Role 1 system user ID";
    public const string HearingAuditLogSearchType4 = "Search type 4 (owner) requires a valid system_user_id";
    public const string HearingAuditLogSearchType4Exists = "system_user_id = {0} does not exist as a Role 1 system user ID";

    // Custom Object
    public const string CustomObjectIsNotActive = "Older inactive records cannot be patched";

    #region Schedule Period
    public const string InvalidTimeZone = "The period_time_zone id is not an accepted value";
    public const string IncorrectSchedulePeriodIdRange = "The first between_schedule_period_ids value must be a lower number than the second value";
    public const string InvalidSchedulePeriod = "The schedule_period_id that was provided is not valid";
    public const string InactiveSchedulePeriod = "The associated schedule period is not in a status that allows edits";
    public const string BlockStartAfterEnd = "The block_start must be before the block_end";
    public const string ScheduleStartOutOfPeriod = "the block_start value is not within the associated schedule period";
    public const string InvalidStartLocalTimePeriod = "the local converted time of the block_start must be between 6AM and 9PM";
    public const string ScheduleEndOutOfPeriod = "the block_end value is not within the associated schedule period";
    public const string InvalidEndLocalTimePeriod = "the local converted time of the block_end must be between 6AM and 9PM";
    public const string ShortScheduleBlockDuration = "Added blocks must be 1 hour minimum in duration";
    public const string OverlappedBlockForUser = "A block already exists in this timeframe for this user";
    public const string InvalidBlockType = "The block_type is required and must be an accepted integer value";
    public const string ExceedWorkingDayBlock = "Working time blocks cannot exceed the current working day";

    public const string AssignedHearings = "the target schedule block times cannot be modified because hearings are assigned";

    public const string BlockStartingBeforeAfterInvalid = "The blocks_starting_after must be an earlier datetime than blocks_starting_before";
    #endregion

    // Email Templates
    public const string AssignedTemplateIdNonUnique = "assigned_template_id must be unique and not already exist for another record in dbo.EmailTemplates";

    // Schedule Request
    public const string InvalidRequestSubmitter = "A valid request_submitter must be provided and it must be the ID of an active Role 1 user";
    public const string InvalidRequestOwner = "The request_owner provided is not a valid active Role 1 User ID";
    public const string PastRequestStart = "A valid request_start value must be provided and it must be in the future";
    public const string InvalidRequestStartEnd = "A valid request_end date in the future must be provided and it must be later than the request_start date";
    public const string RestrictDeletePastScheduleRequest = "The target schedule_request_id is in the past and cannot be deleted";
    public const string InvalidRequestType = "A valid request_type value must be provided to create a request";

    #region OutcomeDocRequest
    public const string InvalidSubmitter = "Invalid submitter ID";
    public const string InvalidFileDescription = "Invalid File Description Id";
    public const string NotPastDate = "Date documents received is required and must be a past date";
    public const string OutcomeDocReqItemsExists = "Requests cannot be deleted if they have child request items.  The child request items must be deleted first";
    public const string InvalidOutcomeDocRequest = "Invalid outcome document request id";
    public const string InvalidOutcomeDocGroup = "Invalid outcome document group ID";
    public const string InvalidDocRequestType = "Invalid request type";
    public const string InvalidRequestSubType = "Invalid request sub type";
    public const string InvalidAffectedDocuments = "Invalid affected documents";
    #endregion

    // Remedy
    public const string PrevAwardByInvalidRole = "prev_award_by does not match a valid Role 1 user";

    #region Trials
    public const string AssociatedTrialInvalid = "The associated trial guid is not valid";
    public const string TrialInvalid = "Invalid trial guid";
    public const string InvalidOptedInParticipant = "Opted in participant id is not a valid id on the dispute file";
    public const string InvalidOptedInStaff = "Opted in staff id is not a valid";
    public const string DisputeTrialRoleRequired = "A valid dispute trial role value is required";
    public const string DisputeTrialStatusRequired = "A valid dispute trial status value is required";
    public const string ParticipantTrialRoleRequired = "A valid participant role value is required";
    public const string ParticipantTrialTypeRequired = "A valid participant type value is required";
    public const string ParticipantTrialStatusRequired = "A valid participant status value is required";
    public const string AssociatedRecordExistsForTrialParticipant = "This trial participant record cannot be deleted as it has active associated records";
    public const string InterventionTrialStatusRequired = "A valid intervention status value is required";
    public const string InvalidTrialParticipant = "The trial participant guid provided is not valid on this trial";
    public const string InvalidTrialIntervention = "The trial intervention guid provided is not valid on this trial";
    public const string AssociatedRecordExistsForTrialDispute = "This trial dispute record cannot be deleted as it has active associated records";
    public const string InvalidOutcomeStatus = "A valid outcome status value is required";
    public const string InvalidOutcomeBy = "A valid outcome by value is required";
    #endregion

    // Custom Config Object
    public const string OnlyJsonAccepted = "Object json b and object text cannot be set on object storage type 1 config objects";
    public const string OnlyJsonBAccepted = "Object json and object text cannot be set on object storage type 2 config objects";
    public const string OnlyTextAccepted = "Object json and object json b cannot be set on object storage type 3 config objects";
    public const string DuplicatedTitleForCustomConfigObject = "The title that was provided has already been used by another config object and cannot be used again";
    public const string ObjectJsonRequired = "Object json is required where object storage type = 1";
    public const string ObjectJsonBRequired = "Object jsonb is required where object storage type = 2";
    public const string ObjectTextRequired = "Object text is required where object storage type = 3";

    // Custom Config Object
    public const string ExternalCustomDataObjectDoesNotExist = "CustomDataObject with ID={0} does not exist";

    // AdHocReport Service
    public const string ExcelTemplateIdRequired = "ExcelTemplateId is Required when ExcelTemplateExist is true";
    public const string InvalidExcelTemplateId = "The associated excel template ID is not valid";
    public const string ValidationForSetIsActive = "You can only set an email adhoc report to active if it has an active report attachment";
    public const string AdHocReportAttachmentsExists = "You cannot delete an adhoc report that has associated attachments. Delete the attachments first.";
    public const string LastAttachmentDelete = "You cannot delete the last attachment associated to an active adhoc email report, set the email inactive first.";

    // Service Audit Log
    public const string NoticeServiceIdCannotProvide = "A Notice Service Id can only be provided on Service Type 1 searches";
    public const string InvalidNoticeServiceId = "Invalid notice service Id";
    public const string FilePackageServiceIdCannotProvide = "A File Package Service Id can only be provided on Service Type 2 searches";
    public const string InvalidFilePackageServiceId = "Invalid file package service Id";

    // Error Log
    public const string ReportedDateMustBeInPast = "Reported date must be a date in the past";

    // Poll
    public const string PollTitleExists = "The poll title you have provided has already been used by another poll. Please provide a unique poll title";
    public const string PollTitleLengthIssue = "A poll title is required with a minimum of 5 characters.";
    public const string PollChildReference = "Poll contains Poll Responses. Firstly delete Poll Responses.";
    public const string InvalidPoll = "Invalid Poll ID.";
    public const string FileNotAssociatedToDispute = "The File ID must be associated to the provided dispute guid.";

    // HearingParticipant
    public const string HearingParticipantExistsForParticipant = "A hearing participation record already exists for the provided participant id";

    // DisputeLink
    public const string DisputeLinkExist = "This dispute guid already has an active status dispute link";
    public const string OnlineMeetingNotExists = "Invalid online meeting id";
    public const string PrimaryDisputeLinkExists = "There can only be one active primary dispute link per online meeting id";
    public const string PrimaryDisputeLinkMustExists = "To add a secondary role dispute link an active primary role dispute link must exist";
    public const string SameDisputeLinkRole = "The provided dispute link role is the same as the current value in the system";
    public const string WrongDisputeLinkStatus = "You can only change the link status away from active (1)";
    public const string InvalidDisputeLink = "Invalid dispute link id";

    // Dispute Verification
    public const string DisputeVerificationDoesNotExist = "A valid dispute verification id is required";
    public const string InvalidRefundIncluded = "You can only indicate a refund is included on verifications that have an associated dispute fee id";
    public const string InvalidRefundInitiatedBy = "Invalid refund initiated by Id";
    public const string AssignedAttemptsExists = "Dispute verifications cannot be deleted if they have associated verification attempts, you must delete the verification attempts first";
    public const string InvalidParticipantForVerification = "A valid participant id is required that is associated to the same dispute as the dispute verification record";
}