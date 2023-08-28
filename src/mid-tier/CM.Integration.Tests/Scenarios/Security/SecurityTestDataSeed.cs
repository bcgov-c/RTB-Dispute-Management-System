using System;
using System.Collections.Generic;
using System.Net.Http;
using CM.Business.Entities.Models.Amendment;
using CM.Business.Entities.Models.AutoText;
using CM.Business.Entities.Models.Claim;
using CM.Business.Entities.Models.ClaimDetail;
using CM.Business.Entities.Models.ConferenceBridge;
using CM.Business.Entities.Models.CustomConfigObject;
using CM.Business.Entities.Models.CustomDataObject;
using CM.Business.Entities.Models.Dispute;
using CM.Business.Entities.Models.DisputeFlag;
using CM.Business.Entities.Models.DisputeHearing;
using CM.Business.Entities.Models.DisputeProcessDetail;
using CM.Business.Entities.Models.DisputeVerification;
using CM.Business.Entities.Models.EmailAttachment;
using CM.Business.Entities.Models.EmailMessage;
using CM.Business.Entities.Models.EmailTemplate;
using CM.Business.Entities.Models.ExternalCustomDataObject;
using CM.Business.Entities.Models.ExternalErrorLog;
using CM.Business.Entities.Models.ExternalFile;
using CM.Business.Entities.Models.FilePackageService;
using CM.Business.Entities.Models.Files;
using CM.Business.Entities.Models.Hearing;
using CM.Business.Entities.Models.IntakeQuestion;
using CM.Business.Entities.Models.InternalUserRole;
using CM.Business.Entities.Models.Note;
using CM.Business.Entities.Models.Notice;
using CM.Business.Entities.Models.NoticeService;
using CM.Business.Entities.Models.OnlineMeeting;
using CM.Business.Entities.Models.OutcomeDocRequest;
using CM.Business.Entities.Models.OutcomeDocument;
using CM.Business.Entities.Models.ParticipantIdentity;
using CM.Business.Entities.Models.Parties;
using CM.Business.Entities.Models.Payment;
using CM.Business.Entities.Models.Poll;
using CM.Business.Entities.Models.PollResponse;
using CM.Business.Entities.Models.Remedy;
using CM.Business.Entities.Models.RemedyDetail;
using CM.Business.Entities.Models.ScheduleBlock;
using CM.Business.Entities.Models.SchedulePeriod;
using CM.Business.Entities.Models.ScheduleRequest;
using CM.Business.Entities.Models.SubmissionReceipt;
using CM.Business.Entities.Models.SubstitutedService;
using CM.Business.Entities.Models.Task;
using CM.Business.Entities.Models.User;
using CM.Business.Entities.Models.VerificationAttempt;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Integration.Tests.Fixtures;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;

namespace CM.Integration.Tests.Scenarios.Security;

public class SecurityTestDataSeed
{
    private static readonly object LockObject = new();

    public SecurityTestDataSeed(TestContext context)
    {
        lock (LockObject)
        {
            Client = context.Client;

            Client.Authenticate(Users.User, Users.User);

            if (!CreateDispute())
            {
                return;
            }

            CreateDisputes();
            CreateParticipants();
            CreateEmailMessages();
            CreateFilePackage();
            CreateFilePackages();
            CreateFilePackageServices();
            CreateFiles();
            CreateFileDescriptions();
            CreateLinkFiles();
            CreateTasks();
            CreateHearings();
            CreateDisputeHearings();
            CreateDisputeFees();
            CreateDisputeFlags();
            CreatePaymentTransactions();
            CreateHearingParticipationList();
            CreateNotices();
            CreateNoticeServices();
            CreateAmendments();
            CreateNotes();
            CreateClaimGroups();
            CreateClaimGroupsParticipants();
            CreateClaims();
            CreateClaimDetails();
            CreateRemedies();
            CreateRemedyDetails();
            CreateAutoTexts();
            CreateOutcomeDocGroups();
            CreateOutcomeDocRequests();
            CreateOutcomeDocReqItems();
            CreateOutcomeDocFiles();
            CreateOutcomeDocContents();
            CreateOutcomeDocDeliveries();
            CreateDisputeProcessDetails();
            CreateCommonFiles();
            CreateCustomDataObjects();
            CreateCustomConfigObjects();
            CreateEmailTemplates();
            CreateEmailAttachments();
            CreateUser2EmailMessages();
            CreateUser2_Entities();
            CreateSchedulePeriods();
            CreateScheduleBlocks();
            CreateScheduleRequests();
            CreateSubmissionReceipts();
            CreateSubstitutedServices();
            CreateExternalCustomDataObjects();
            CreateExternalErrorLogs();
            CreateExternalFiles();
            CreatePolls();
            CreatePollResponses();
            CreateParticipantIdentities();
            CreateOnlineMeetings();
            CreateDisputeLinks();
            CreateDisputeVerifications();
            CreateVerificationAttempts();
        }
    }

    public HttpClient Client { get; }

    public ParticipantResponse Participant { get; set; }

    public ParticipantResponse User2Participant { get; set; }

    public CreateDisputeResponse User2Dispute { get; set; }

    public List<ParticipantResponse> Participants { get; } = new();

    public List<EmailMessageResponse> EmailMessages { get; } = new();

    public List<EmailMessageResponse> User2EmailMessages { get; } = new();

    public List<FileResponse> Files { get; } = new();

    public List<FileDescriptionResponse> FileDescriptions { get; } = new();

    public DisputeResponse Dispute { get; set; }

    public List<DisputeResponse> Disputes { get; } = new();

    public IntakeQuestionResponse IntakeQuestion { get; set; }

    public FilePackageResponse FilePackage { get; set; }

    public List<FilePackageResponse> FilePackages { get; } = new();

    public List<FilePackageServiceResponse> FilePackageServices { get; } = new();

    public List<LinkedFileResponse> LinkFiles { get; } = new();

    public List<NoteResponse> Notes { get; } = new();

    public List<TaskResponse> Tasks { get; } = new();

    public List<UserLoginResponse> HearingUsers { get; } = new();

    public List<HearingResponse> Hearings { get; } = new();

    public List<DisputeHearingResponse> DisputeHearings { get; } = new();

    public List<HearingParticipationResponse> HearingParticipationList { get; } = new();

    public List<ConferenceBridgeResponse> ConferenceBridges { get; } = new();

    public List<DisputeFeeResponse> DisputeFees { get; } = new();

    public List<PostDisputeFlagResponse> DisputeFlags { get; } = new();

    public List<PaymentTransactionResponse> PaymentTransactions { get; } = new();

    public List<NoticeResponse> Notices { get; } = new();

    public List<NoticeServiceResponse> NoticeServices { get; } = new();

    public List<AmendmentResponse> Amendments { get; } = new();

    public List<ClaimGroupResponse> ClaimGroups { get; } = new();

    public List<ClaimResponse> Claims { get; } = new();

    public List<ClaimDetailResponse> ClaimDetails { get; } = new();

    public List<RemedyResponse> Remedies { get; } = new();

    public List<RemedyDetailResponse> RemedyDetails { get; } = new();

    public List<ClaimGroupParticipantResponse> ClaimGroupParticipants { get; } = new();

    public List<CommonFileResponse> CommonFiles { get; } = new();

    public List<EmailAttachmentResponse> EmailAttachments { get; } = new();

    public List<EmailTemplateResponse> EmailTemplates { get; } = new();

    public List<AutoTextResponse> AutoTexts { get; } = new();

    public List<OutcomeDocContentResponse> OutcomeDocContents { get; } = new();

    public List<OutcomeDocFileResponse> OutcomeDocFiles { get; } = new();

    public List<OutcomeDocGroupResponse> OutcomeDocGroups { get; } = new();

    public List<OutcomeDocRequestResponse> OutcomeDocRequests { get; } = new();

    public List<OutcomeDocRequestItemResponse> OutcomeDocReqItems { get; } = new();

    public List<OutcomeDocDeliveryResponse> OutcomeDocDeliveries { get; } = new();

    public List<DisputeProcessDetailResponse> DisputeProcessDetails { get; } = new();

    public List<CustomDataObjectResponse> CustomObjects { get; } = new();

    public List<CustomConfigObjectResponse> CustomConfigObjects { get; } = new();

    public List<SchedulePeriodPostResponse> SchedulePeriods { get; } = new();

    public List<ScheduleBlockPostResponse> ScheduleBlocks { get; } = new();

    public List<ScheduleRequestPostResponse> ScheduleRequests { get; } = new();

    public List<SubmissionReceiptPostResponse> SubmissionReceipts { get; } = new();

    public List<SubstitutedServicePostResponse> SubstitutedServices { get; } = new();

    public List<ExternalCustomDataObjectResponse> ExternalCustomDataObjects { get; } = new();

    public List<ExternalErrorLogResponse> ExternalErrorLogs { get; } = new();

    public List<ExternalFileResponse> ExternalFiles { get; } = new();

    public List<Business.Entities.Models.Poll.PollResponse> Polls { get; } = new();

    public List<PollRespResponse> PollResponses { get; } = new();

    public List<ParticipantIdentityResponse> ParticipantIdentities { get; } = new();

    public List<OnlineMeetingResponse> OnlineMeetings { get; } = new();

    public List<DisputeLinkResponse> DisputeLinks { get; } = new();

    public List<DisputeVerificationResponse> DisputeVerifications { get; } = new();

    public List<VerificationAttemptResponse> VerificationAttempts { get; } = new();

    private bool CreateDispute()
    {
        // Create Dispute
        var disputeRequest = new DisputeRequest
        {
            OwnerSystemUserId = 1,
            DisputeType = (byte)DisputeType.Rta,
            DisputeSubType = (byte)DisputeSubType.ApplicantIsLandlord,
            DisputeUrgency = (byte)DisputeUrgency.Regular,
            TenancyAddress = "TenancyAddress 01 St",
            TenancyCity = "TenancyCity 01",
            TenancyZipPostal = "345 346",
            TenancyGeozoneId = 3
        };
        var disputeResponse = DisputeManager.CreateDisputeWithData(Client, disputeRequest);
        disputeResponse.CheckStatusCode();
        Client.SetDisputeGuidHeaderToken(disputeResponse.ResponseObject.DisputeGuid);

        var disputePatch = new DisputeRequest
        {
            TenancyGeozoneId = 5
        };

        disputeResponse = DisputeManager.UpdateDispute(Client, disputeResponse.ResponseObject.DisputeGuid, disputePatch);

        var disputeStatusRequest = new DisputeStatusPostRequest
        {
            EvidenceOverride = (byte)EvidenceOverride.Enabled,
            Status = (byte)DisputeStatuses.Received,
            Stage = (byte)DisputeStage.ApplicationScreening,
            Process = (byte)DisputeProcess.ParticipatoryHearing
        };

        var disputeStatusResponse = DisputeManager.CreateDisputeStatus(Client, disputeResponse.ResponseObject.DisputeGuid, disputeStatusRequest);

        disputeStatusResponse.CheckStatusCode();

        Dispute = disputeResponse.ResponseObject;

        var disputeIntakeQuestionPostResponse = DisputeManager.CreateIntakeQuestion(Client, Dispute.DisputeGuid, new List<IntakeQuestionRequest>
        {
            new() { GroupId = 2, QuestionName = "QN", QuestionAnswer = "QA" }
        });

        disputeStatusResponse.CheckStatusCode();

        IntakeQuestion = disputeIntakeQuestionPostResponse.ResponseObject[0];

        return true;
    }

    private void CreateDisputes()
    {
        for (var i = 0; i < 8; i++)
        {
            var disputeRequest = new DisputeRequest
            {
                OwnerSystemUserId = 1,
                DisputeType = (byte)DisputeType.Rta,
                DisputeSubType = (byte)DisputeSubType.ApplicantIsLandlord,
                DisputeUrgency = (byte)DisputeUrgency.Regular,
                TenancyAddress = "TenancyAddress 01 St",
                TenancyCity = "TenancyCity 01",
                TenancyZipPostal = "345 346",
                TenancyGeozoneId = 3
            };
            var disputeResponse = DisputeManager.CreateDisputeWithData(Client, disputeRequest);
            disputeResponse.CheckStatusCode();
            Disputes.Add(disputeResponse.ResponseObject);
        }
    }

    private void CreateParticipants()
    {
        var participantRequest = new ParticipantRequest
        {
            ParticipantType = (byte)ParticipantType.Business,
            ParticipantStatus = (byte)ParticipantStatus.ValidatedAndParticipating,
            FirstName = "IntSched01",
            LastName = "Participant01",
            Address = "P01 Street",
            City = "P01 City",
            ProvinceState = "BC",
            PostalZip = "P1P 1P1",
            Country = "Canada",
            AcceptedTou = true,
            Email = "nomail_1@nomail.com"
        };

        var partyRequest = new List<ParticipantRequest> { participantRequest };
        var participantResponse = ParticipantManager.CreateParticipant(Client, Dispute.DisputeGuid, partyRequest);
        participantResponse.CheckStatusCode();
        Participant = participantResponse.ResponseObject[0];

        var participantsRequest = new ParticipantRequest
        {
            ParticipantType = (byte)ParticipantType.Business,
            ParticipantStatus = (byte)ParticipantStatus.ValidatedAndParticipating,
            FirstName = "IntSched01",
            LastName = "Participant01",
            Address = "P01 Street",
            City = "P01 City",
            ProvinceState = "BC",
            PostalZip = "P1P 1P1",
            Country = "Canada",
            AcceptedTou = true
        };

        var partiesRequest = new List<ParticipantRequest> { participantsRequest, participantsRequest, participantsRequest, participantsRequest, participantsRequest };
        var participantsResponse = ParticipantManager.CreateParticipant(Client, Dispute.DisputeGuid, partiesRequest);
        participantsResponse.CheckStatusCode();
        Participants.Add(participantsResponse.ResponseObject[0]);
        Participants.Add(participantsResponse.ResponseObject[1]);
        Participants.Add(participantsResponse.ResponseObject[2]);
        Participants.Add(participantsResponse.ResponseObject[3]);
        Participants.Add(participantsResponse.ResponseObject[4]);
    }

    private void CreateEmailMessages()
    {
        for (var i = 0; i < 7; i++)
        {
            var emailMessageRequest = new EmailMessageRequest
            {
                MessageType = (byte)EmailMessageType.SystemEmail,
                AssignedTemplateId = AssignedTemplate.ParticipatoryDisputeWaitingForOfficePayment,
                EmailTo = "nomail_1@nomail.com",
                EmailFrom = "nomail_2@nomail.com",
                Subject = "Sub",
                HtmlBody = "Body",
                BodyType = (byte)EmailMessageBodyType.Html,
                PreferredSendDate = DateTime.UtcNow,
                ResponseDueDate = DateTime.UtcNow,
                IsActive = true,
                SendMethod = EmailSendMethod.Custom
            };
            var emailMessageResponse = EmailMessageManager.CreateEmailMessage(Client, Dispute.DisputeGuid, emailMessageRequest);
            emailMessageResponse.CheckStatusCode();
            EmailMessages.Add(emailMessageResponse.ResponseObject);
        }
    }

    private void CreateUser2EmailMessages()
    {
        Client.Authenticate(Users.User, Users.User);

        for (var i = 0; i < 6; i++)
        {
            var emailMessageRequest = new EmailMessageRequest
            {
                MessageType = (byte)EmailMessageType.SystemEmail,
                AssignedTemplateId = AssignedTemplate.ParticipatoryDisputeWaitingForOfficePayment,
                EmailTo = "nomail_1@nomail.com",
                EmailFrom = "nomail_2@nomail.com",
                Subject = "Sub",
                HtmlBody = "Body",
                BodyType = (byte)EmailMessageBodyType.Html,
                PreferredSendDate = DateTime.UtcNow,
                ResponseDueDate = DateTime.UtcNow,
                IsActive = true,
                SendMethod = EmailSendMethod.Custom
            };
            var emailMessageResponse = EmailMessageManager.CreateEmailMessage(Client, Dispute.DisputeGuid, emailMessageRequest);
            emailMessageResponse.CheckStatusCode();
            User2EmailMessages.Add(emailMessageResponse.ResponseObject);
        }
    }

    private void CreateEmailAttachments()
    {
        for (var i = 0; i < 6; i++)
        {
            var emailAttachmentResponse = EmailAttachmentManager.CreateEmailAttachment(Client, EmailMessages[6].EmailMessageId, new EmailAttachmentRequest { AttachmentType = AttachmentType.Common, CommonFileId = CommonFiles[0].CommonFileId });
            emailAttachmentResponse.CheckStatusCode();
            EmailAttachments.Add(emailAttachmentResponse.ResponseObject);
        }
    }

    private void CreateEmailTemplates()
    {
        for (var i = 0; i < 6; i++)
        {
            var emailTemplateResponse = EmailTemplateManager.CreateEmailTemplate(Client, new EmailTemplateRequest { TemplateTitle = "Title", TemplateDescription = "Description", SubjectLine = "SubLine", TemplateHtml = "HTML", ReplyEmailAddress = "test@test.com", AssignedTemplateId = (AssignedTemplate)100 + i, DefaultRecipientGroup = 1, TemplateStatus = 1 });
            emailTemplateResponse.CheckStatusCode();

            EmailTemplates.Add(emailTemplateResponse.ResponseObject);
        }
    }

    private void CreateFiles()
    {
        var request = new FileRequest
        {
            FileName = "SampleSchedule_Jan2019",
            FileType = (byte)FileType.ExternalEvidence,
            FilePackageId = FilePackage.FilePackageId
        };

        for (var i = 0; i < 6; i++)
        {
            var fileResponse = FileManager.CreateFile(Client, Dispute.DisputeGuid, request);
            fileResponse.CheckStatusCode();
            Files.Add(fileResponse.ResponseObject);
        }
    }

    private void CreateCommonFiles()
    {
        var request = new FileRequest
        {
            FileName = "SampleSchedule_Jan2019",
            FileType = (byte)FileType.ExternalEvidence,
            FilePackageId = FilePackage.FilePackageId
        };

        for (var i = 0; i < 6; i++)
        {
            var fileResponse = CommonFileManager.CreateCommonFile(Client, request);
            fileResponse.CheckStatusCode();
            CommonFiles.Add(fileResponse.ResponseObject);
        }
    }

    private void CreateFileDescriptions()
    {
        for (var i = 0; i < 6; i++)
        {
            var fileDescriptionPostResponse = FileDescriptionManager.CreateFileDescription(Client, Dispute.DisputeGuid, new FileDescriptionRequest());
            fileDescriptionPostResponse.CheckStatusCode();
            FileDescriptions.Add(fileDescriptionPostResponse.ResponseObject);
        }
    }

    private void CreateFilePackage()
    {
        var filePackagePostResponse = FilePackageManager.CreateFilePackage(Client, Dispute.DisputeGuid, new FilePackageRequest { CreatedById = 1, PackageType = (byte)FilePackageType.DisputeAccessSubmission });
        filePackagePostResponse.CheckStatusCode();
        FilePackage = filePackagePostResponse.ResponseObject;
    }

    private void CreateFilePackages()
    {
        for (var i = 0; i < 6; i++)
        {
            var filePackagePostResponse = FilePackageManager.CreateFilePackage(Client, Dispute.DisputeGuid, new FilePackageRequest { CreatedById = 1 });
            filePackagePostResponse.CheckStatusCode();
            FilePackages.Add(filePackagePostResponse.ResponseObject);
        }
    }

    private void CreateFilePackageServices()
    {
        for (var i = 0; i < 6; i++)
        {
            var filePackageServicePostResponse = FilePackageServiceManager.CreateFilePackageService(Client, FilePackage.FilePackageId, new FilePackageServiceRequest());
            filePackageServicePostResponse.CheckStatusCode();
            FilePackageServices.Add(filePackageServicePostResponse.ResponseObject);
        }
    }

    private void CreateLinkFiles()
    {
        for (var i = 0; i < 6; i++)
        {
            var linkFilePostResponse = LinkFileManager.CreateLinkFile(Client, Dispute.DisputeGuid, new LinkedFileRequest
            {
                FileDescriptionId = FileDescriptions[5].FileDescriptionId, FileId = Files[5].FileId
            });
            linkFilePostResponse.CheckStatusCode();
            LinkFiles.Add(linkFilePostResponse.ResponseObject);
        }
    }

    private void CreateNotes()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 6; i++)
        {
            var notePostResponse = NoteManager.CreateNote(Client, Dispute.DisputeGuid, new NotePostRequest { NoteLinkedTo = 1, NoteStatus = 1, NoteType = 1, NoteContent = "12345" });
            notePostResponse.CheckStatusCode();
            Notes.Add(notePostResponse.ResponseObject);
        }
    }

    private void CreateClaimGroups()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        var claimGroupPostResponse = ClaimManager.CreateClaimGroup(Client, Dispute.DisputeGuid);
        claimGroupPostResponse.CheckStatusCode();
        ClaimGroups.Add(claimGroupPostResponse.ResponseObject);
    }

    private void CreateClaimGroupsParticipants()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 6; i++)
        {
            var claimGroupParticipantPostResponse = ClaimManager.CreateClaimGroupParticipant(Client, ClaimGroups[0].ClaimGroupId, new List<ClaimGroupParticipantRequest>
            {
                new()
                {
                    ParticipantId = Participant.ParticipantId, GroupParticipantRole = (byte)ParticipantRole.Applicant, GroupPrimaryContactId = 1
                }
            });
            claimGroupParticipantPostResponse.CheckStatusCode();
            ClaimGroupParticipants.Add(claimGroupParticipantPostResponse.ResponseObject[0]);
        }
    }

    private void CreateClaims()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 6; i++)
        {
            Client.SetDisputeGuidHeaderToken(ClaimGroups[0].DisputeGuid);
            var claimPostResponse = ClaimManager.CreateClaim(Client, ClaimGroups[0].ClaimGroupId, new ClaimRequest());
            claimPostResponse.CheckStatusCode();
            Claims.Add(claimPostResponse.ResponseObject);
        }
    }

    private void CreateClaimDetails()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 6; i++)
        {
            var claimDetailPostResponse = ClaimManager.CreateClaimDetail(Client, Claims[0].ClaimId, new ClaimDetailRequest { DescriptionBy = 1 });
            claimDetailPostResponse.CheckStatusCode();
            ClaimDetails.Add(claimDetailPostResponse.ResponseObject);
        }
    }

    private void CreateRemedies()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 6; i++)
        {
            var remedyPostResponse = RemedyManager.CreateRemedy(Client, Claims[0].ClaimId, new RemedyRequest { RemedyStatus = 1, RemedyType = 1, RemedySource = 1 });
            remedyPostResponse.CheckStatusCode();
            Remedies.Add(remedyPostResponse.ResponseObject);
        }
    }

    private void CreateRemedyDetails()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 6; i++)
        {
            var remedyDetailPostResponse = RemedyManager.CreateRemedyDetail(Client, Remedies[0].RemedyId, new RemedyDetailRequest { DescriptionBy = 1, Amount = 1 });
            remedyDetailPostResponse.CheckStatusCode();
            RemedyDetails.Add(remedyDetailPostResponse.ResponseObject);
        }
    }

    private void CreateTasks()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 6; i++)
        {
            var taskPostResponse = TaskManager.CreateTask(Client, Dispute.DisputeGuid, new TaskRequest
            {
                TaskLinkedTo = 1, TaskLinkId = EmailMessages[5].EmailMessageId, TaskOwnerId = 1, TaskPriority = 1, TaskText = "ABCDE"
            });
            taskPostResponse.CheckStatusCode();
            Tasks.Add(taskPostResponse.ResponseObject);
        }
    }

    private void CreateDisputeFees()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 6; i++)
        {
            var disputeFeePostResponse = DisputeFeeManager.CreateDisputeFee(Client, Dispute.DisputeGuid, new DisputeFeeRequest
            {
                PayorId = Participant.ParticipantId, AmountDue = 3, FeeType = (byte)DisputeFeeType.Other, IsActive = true
            });
            disputeFeePostResponse.CheckStatusCode();
            DisputeFees.Add(disputeFeePostResponse.ResponseObject);
        }
    }

    private void CreateDisputeFlags()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 6; i++)
        {
            var disputeFlagPostResponse = DisputeFlagManager.CreateDisputeFlag(Client, Dispute.DisputeGuid, new PostDisputeFlagRequest
            {
                FlagStatus = 1,
                FlagType = 2,
                IsPublic = true,
                FlagTitle = "Test-" + i
            });
            disputeFlagPostResponse.CheckStatusCode();
            DisputeFlags.Add(disputeFlagPostResponse.ResponseObject);
        }
    }

    private void CreatePaymentTransactions()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 6; i++)
        {
            var paymentPostResponse = PaymentManager.CreatePayment(Client, DisputeFees[0].DisputeFeeId, new PaymentTransactionPostRequest { TransactionMethod = (int)PaymentMethod.Online, TransactionSiteSource = 1 });
            paymentPostResponse.CheckStatusCode();
            PaymentTransactions.Add(paymentPostResponse.ResponseObject);
        }
    }

    private void CreateAutoTexts()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 6; i++)
        {
            var autotextPostResponse = AutotextManager.CreateAutotext(Client, new AutoTextPostRequest { TextType = (byte)TextType.Legislation, TextTitle = "AutoTitle" });
            autotextPostResponse.CheckStatusCode();
            AutoTexts.Add(autotextPostResponse.ResponseObject);
        }
    }

    private void CreateOutcomeDocGroups()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 6; i++)
        {
            var outcomeDocGroup = OutcomeDocGroupManager.CreateOutcomeDocGroup(Client, Dispute.DisputeGuid, new OutcomeDocGroupRequest { DocGroupType = 1 });
            outcomeDocGroup.CheckStatusCode();
            OutcomeDocGroups.Add(outcomeDocGroup.ResponseObject);
        }
    }

    private void CreateOutcomeDocRequests()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 6; i++)
        {
            var outcomeDocRequest = OutcomeDocRequestManager.CreateOutcomeDocRequest(Client, Dispute.DisputeGuid, new OutcomeDocRequestRequest { RequestType = OutcomeDocRequestType.Correction, DateDocumentsReceived = DateTime.UtcNow.AddDays(-1), SubmitterId = 1 });
            outcomeDocRequest.CheckStatusCode();
            OutcomeDocRequests.Add(outcomeDocRequest.ResponseObject);
        }
    }

    private void CreateOutcomeDocReqItems()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 6; i++)
        {
            var outcomeDocReqItem = OutcomeDocReqItemManager.CreateOutcomeDocReqItem(Client, OutcomeDocRequests[4].OutcomeDocRequestId, new OutcomeDocRequestItemRequest { ItemType = OutcomeDocRequestItemType.Clarification });
            outcomeDocReqItem.CheckStatusCode();
            OutcomeDocReqItems.Add(outcomeDocReqItem.ResponseObject);
        }
    }

    private void CreateOutcomeDocFiles()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 8; i++)
        {
            var outcomeDocFilePostResponse = OutcomeDocFileManager.CreateOutcomeDocFile(Client, OutcomeDocGroups[0].OutcomeDocGroupId, new OutcomeDocFilePostRequest { DisputeGuid = Dispute.DisputeGuid, FileType = (byte)FileType.ExternalEvidence });
            outcomeDocFilePostResponse.CheckStatusCode();
            OutcomeDocFiles.Add(outcomeDocFilePostResponse.ResponseObject);
        }
    }

    private void CreateOutcomeDocContents()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 6; i++)
        {
            var outcomeDocContentPostResponse = OutcomeDocContentManager.CreateOutcomeDocContent(Client, OutcomeDocFiles[0].OutcomeDocFileId, new OutcomeDocContentPostRequest { ContentType = 1 });
            outcomeDocContentPostResponse.CheckStatusCode();
            OutcomeDocContents.Add(outcomeDocContentPostResponse.ResponseObject);
        }
    }

    private void CreateOutcomeDocDeliveries()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 6; i++)
        {
            var outcomeDocDeliveryPostResponse = OutcomeDocDeliveryManager.CreateOutcomeDocDelivery(Client, OutcomeDocFiles[i].OutcomeDocFileId, new OutcomeDocDeliveryPostRequest { DisputeGuid = Dispute.DisputeGuid });
            outcomeDocDeliveryPostResponse.CheckStatusCode();
            OutcomeDocDeliveries.Add(outcomeDocDeliveryPostResponse.ResponseObject);
        }
    }

    private void CreateDisputeProcessDetails()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 6; i++)
        {
            var disputeProcessDetailPostResponse = DisputeProcessDetailManager.CreateDisputeProcessDetail(Client, Dispute.DisputeGuid, new DisputeProcessDetailPostRequest { AssociatedProcess = 1, StartDisputeStatusId = 1 });
            disputeProcessDetailPostResponse.CheckStatusCode();
            DisputeProcessDetails.Add(disputeProcessDetailPostResponse.ResponseObject);
        }
    }

    private void CreateHearingUsers()
    {
        for (var i = 0; i < 6; i++)
        {
            var hearingUserRequest = new UserLoginRequest
            {
                Username = "hu" + i,
                Password = "12345hu" + i,
                SystemUserRoleId = (int)Roles.StaffUser,
                Scheduler = i < 3,
                IsActive = true,
                AcceptsTextMessages = true,
                AdminAccess = false
            };

            var hearingUser = UserManager.CreateUser(Client, hearingUserRequest);
            hearingUser.CheckStatusCode();
            var hearingUserRoleRequest = new InternalUserRoleRequest
            {
                RoleGroupId = 2,
                RoleSubtypeId = 22,
                IsActive = true
            };
            var hearingUserRole = UserManager.CreateRoleGroup(Client, hearingUser.ResponseObject.SystemUserId, hearingUserRoleRequest);
            hearingUserRole.CheckStatusCode();
            HearingUsers.Add(hearingUser.ResponseObject);
        }
    }

    private void CreateHearings()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        CreateHearingUsers();

        for (var i = 0; i < 6; i++)
        {
            var conferenceBridgeRequest = new ConferenceBridgeRequest
            {
                PreferredOwner = HearingUsers[i].SystemUserId,
                PreferredStartTime = new DateTime(2022, 12, 12, 9, 30, 0).AddDays(i),
                PreferredEndTime = new DateTime(2022, 12, 12, 10, 30, 0).AddDays(i),
                DialInNumber1 = "1-800-888-8888",
                DialInDescription1 = "IntSched01 Bridge1",
                ParticipantCode = "1111111#" + i,
                ModeratorCode = "1111119#" + i
            };

            var conferenceBridgePostResponse = ConferenceBridgeManager.CreateConferenceBridge(Client, conferenceBridgeRequest);
            conferenceBridgePostResponse.CheckStatusCode();
            ConferenceBridges.Add(conferenceBridgePostResponse.ResponseObject);

            var request = new HearingRequest
            {
                HearingStartDateTime = new DateTime(2020, 5, 22),
                HearingEndDateTime = new DateTime(2021, 5, 22),
                LocalStartDateTime = new DateTime(2020, 5, 22),
                LocalEndDateTime = new DateTime(2021, 5, 22),
                ConferenceBridgeId = conferenceBridgePostResponse.ResponseObject.ConferenceBridgeId,
                HearingPriority = (byte)HearingPriority.Emergency,
                HearingOwner = HearingUsers[i].SystemUserId,
                HearingType = (byte)HearingType.ConferenceCall
            };

            var hearingPostResponse = HearingManager.CreateHearing(Client, request);
            hearingPostResponse.CheckStatusCode();
            Hearings.Add(hearingPostResponse.ResponseObject);
        }
    }

    private void CreateDisputeHearings()
    {
        Client.Authenticate(HearingUsers[0].Username, "12345" + HearingUsers[0].Username);

        for (var i = 0; i < 6; i++)
        {
            var disputeHearingPostResponse = DisputeHearingManager.CreateDisputeHearing(Client, new DisputeHearingRequest
            {
                HearingId = Hearings[i].HearingId, DisputeGuid = Disputes[i].DisputeGuid, ExternalFileId = Files[0].FileId.ToString(), DisputeHearingRole = (byte)DisputeHearingRole.Active
            });
            disputeHearingPostResponse.CheckStatusCode();
            DisputeHearings.Add(disputeHearingPostResponse.ResponseObject);
        }
    }

    private void CreateHearingParticipationList()
    {
        for (var i = 0; i < 6; i++)
        {
            var hearingParticipationPostResponse = HearingParticipationManager.CreateHearingParticipation(Client, Hearings[i].HearingId, new HearingParticipationRequest { DisputeGuid = Dispute.DisputeGuid });
            hearingParticipationPostResponse.CheckStatusCode();
            HearingParticipationList.Add(hearingParticipationPostResponse.ResponseObject);
        }
    }

    private void CreateNotices()
    {
        for (var i = 0; i < 6; i++)
        {
            var noticePostResponse = NoticeManager.CreateNotice(Client, Dispute.DisputeGuid, new NoticePostRequest { NoticeTitle = "N_Title", NoticeType = (byte)NoticeTypes.GeneratedDisputeNotice });
            noticePostResponse.CheckStatusCode();
            Notices.Add(noticePostResponse.ResponseObject);
        }
    }

    private void CreateAmendments()
    {
        for (var i = 0; i < 6; i++)
        {
            var amendmentPostResponse = AmendmentManager.CreateAmendment(Client, Dispute.DisputeGuid, new AmendmentRequest { AmendmentTitle = "Title", AmendmentTo = 1, AmendmentChangeType = 1, AmendmentChangeHtml = "html" });
            amendmentPostResponse.CheckStatusCode();
            Amendments.Add(amendmentPostResponse.ResponseObject);
        }
    }

    private void CreateNoticeServices()
    {
        for (var i = 0; i < 6; i++)
        {
            var noticeServicePostResponse = NoticeServiceManager.CreateNoticeService(Client, Notices[0].NoticeId, new NoticeServiceRequest { ParticipantId = Participant.ParticipantId });
            noticeServicePostResponse.CheckStatusCode();
            NoticeServices.Add(noticeServicePostResponse.ResponseObject);
        }
    }

    private void CreateUser2_Entities()
    {
        Client.Authenticate(Users.User2, Users.User2);

        // Create Dispute
        var disputeResponse = DisputeManager.CreateDispute(Client);
        User2Dispute = disputeResponse.ResponseObject;

        var disputeStatusRequest = new DisputeStatusPostRequest
        {
            EvidenceOverride = (byte)EvidenceOverride.Enabled,
            Status = (byte)DisputeStatuses.Received,
            Stage = (byte)DisputeStage.ApplicationScreening
        };

        var disputeStatusResponse = DisputeManager.CreateDisputeStatus(Client, disputeResponse.ResponseObject.DisputeGuid, disputeStatusRequest);
        disputeStatusResponse.CheckStatusCode();

        var participantRequest = new ParticipantRequest
        {
            ParticipantType = (byte)ParticipantType.Business,
            ParticipantStatus = (byte)ParticipantStatus.ValidatedAndParticipating,
            FirstName = "IntSched01",
            LastName = "Participant01",
            Address = "P01 Street",
            City = "P01 City",
            ProvinceState = "BC",
            PostalZip = "P1P 1P1",
            Country = "Canada",
            AcceptedTou = true
        };

        var partyRequest = new List<ParticipantRequest> { participantRequest };
        var participantResponse = ParticipantManager.CreateParticipant(Client, User2Dispute.DisputeGuid, partyRequest);
        participantResponse.CheckStatusCode();
        User2Participant = participantResponse.ResponseObject[0];
    }

    private void CreateSchedulePeriods()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 6; i++)
        {
            var schedulePeriodPostResponse = SchedulePeriodManager.CreateSchedulePeriod(Client, new SchedulePeriodPostRequest { PeriodTimeZone = CmTimeZone.PacificTime });
            schedulePeriodPostResponse.CheckStatusCode();

            var schedulePeriodPatchResponse = SchedulePeriodManager.UpdateSchedulePeriod(Client, schedulePeriodPostResponse.ResponseObject.SchedulePeriodId, new SchedulePeriodPatchRequest { PeriodStatus = PeriodStatus.OpenForEditing });
            schedulePeriodPatchResponse.CheckStatusCode();

            SchedulePeriods.Add(schedulePeriodPostResponse.ResponseObject);
        }
    }

    private void CreateScheduleBlocks()
    {
        var time1 = TimeSpan.Parse("06:00");

        Client.Authenticate(Users.Admin, Users.Admin);

        var startTime = DateTime.UtcNow.AddDays(1);
        startTime = startTime.Date + time1;

        for (var i = 0; i < 6; i++)
        {
            startTime = startTime.AddMinutes(i);
            var scheduleBlockPostResponse = ScheduleBlockManager.CreateScheduleBlock(Client, SchedulePeriods[0].SchedulePeriodId, new ScheduleBlockPostRequest { BlockStart = startTime.AddHours(i), BlockEnd = startTime.AddHours(i + 1), SystemUserId = 1, BlockDescription = "Block Desc Test" });
            scheduleBlockPostResponse.CheckStatusCode();
            ScheduleBlocks.Add(scheduleBlockPostResponse.ResponseObject);
        }
    }

    private void CreateScheduleRequests()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 6; i++)
        {
            var scheduleRequestPostResponse = ScheduleRequestManager.CreateScheduleRequest(Client, new ScheduleRequestPostRequest { RequestStart = DateTime.UtcNow.AddMinutes(5), RequestEnd = DateTime.UtcNow.AddHours(2), RequestDescription = "Desc Test", RequestSubmitter = 1, RequestType = 1 });
            scheduleRequestPostResponse.CheckStatusCode();
            ScheduleRequests.Add(scheduleRequestPostResponse.ResponseObject);
        }
    }

    private void CreateSubmissionReceipts()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 6; i++)
        {
            var submissionReceiptPostResponse = SubmissionReceiptManager.CreateSubmissionReceipt(Client, Dispute.DisputeGuid, new SubmissionReceiptPostRequest { ParticipantId = Participant.ParticipantId });
            submissionReceiptPostResponse.CheckStatusCode();
            SubmissionReceipts.Add(submissionReceiptPostResponse.ResponseObject);
        }
    }

    private void CreateSubstitutedServices()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 6; i++)
        {
            var substitutedServicePostResponse = SubstitutedServiceManager.CreateSubstitutedService(Client, Dispute.DisputeGuid, new SubstitutedServicePostRequest { ServiceByParticipantId = Participants[0].ParticipantId, ServiceToParticipantId = Participants[1].ParticipantId, RequestDocType = 1 });
            substitutedServicePostResponse.CheckStatusCode();
            SubstitutedServices.Add(substitutedServicePostResponse.ResponseObject);
        }
    }

    private void CreateCustomDataObjects()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 6; i++)
        {
            var customObjectPostResponse = CustomObjectManager.CreateCustomDataObject(Client, Disputes[i].DisputeGuid, new CustomDataObjectRequest { ObjectStatus = 1, Description = "Custom Desc", ObjectType = CustomObjectType.AriUnits, ObjectSubType = 2, ObjectJson = "{\"foo\":[1,5,7,10]}" });
            customObjectPostResponse.CheckStatusCode();
            CustomObjects.Add(customObjectPostResponse.ResponseObject);
        }
    }

    private void CreateCustomConfigObjects()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 6; i++)
        {
            var customConfigObjectPostResponse = CustomConfigObjectManager.CreateCustomConfigObject(Client, new CustomConfigObjectPostRequest() { ObjectType = 1, ObjectTitle = $"Test Title {i}", IsActive = true, IsPublic = true, ObjectStorageType = (byte)CustomObjectStorageType.Text, ObjectText = "Test Object Text" });
            customConfigObjectPostResponse.CheckStatusCode();
            CustomConfigObjects.Add(customConfigObjectPostResponse.ResponseObject);
        }
    }

    private void CreateExternalCustomDataObjects()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 8; i++)
        {
            var externalCustomDataObjectPostResponse = ExternalCustomDataObjectManager
                .CreateExternalCustomDataObject(Client, new ExternalCustomDataObjectRequest() { Description = "Test Desc", Status = 1, SubType = 1, Title = "Test Title", Type = ExternalCustomObjectType.AriUnits });
            externalCustomDataObjectPostResponse.CheckStatusCode();
            ExternalCustomDataObjects.Add(externalCustomDataObjectPostResponse.ResponseObject);
        }
    }

    private void CreateExternalErrorLogs()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 8; i++)
        {
            var externalErrorLogPostResponse = ExternalErrorLogManager
                .CreateExternalErrorLog(Client, new ExternalErrorLogRequest() { ErrorSite = 1, ErrorType = 2, ErrorTitle = "ErrorTitle" + i.ToString(), ErrorDetails = "ErrorDetails 0123456789 0123456789" + i.ToString() });
            externalErrorLogPostResponse.CheckStatusCode();
            ExternalErrorLogs.Add(externalErrorLogPostResponse.ResponseObject);
        }
    }

    private void CreateExternalFiles()
    {
        var request = new ExternalFileRequest
        {
            FileName = "SampleSchedule_Jan2019",
            FileType = (byte)FileType.ExternalEvidence
        };

        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 8; i++)
        {
            var externalFilePostResponse = ExternalFileManager
                .CreateExternalFile(Client, ExternalCustomDataObjects[7].ExternalCustomDataObjectId, request);
            externalFilePostResponse.CheckStatusCode();
            ExternalFiles.Add(externalFilePostResponse.ResponseObject);
        }
    }

    private void CreatePolls()
    {
        var request = new PollRequest
        {
             PollTitle = "Poll-Title",
             PollType = 1
        };

        Client.Authenticate(HearingUsers[0].Username, "12345" + HearingUsers[0].Username);
        ////Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 8; i++)
        {
            var pollPostResponse = PollManager
                .CreatePoll(Client, new PollRequest
                {
                    PollTitle = "Poll-Title-" + i.ToString(),
                    PollType = 1
                });
            pollPostResponse.CheckStatusCode();
            Polls.Add(pollPostResponse.ResponseObject);
        }
    }

    private void CreatePollResponses()
    {
        var request = new PollRespRequest
        {
            DisputeGuid = Dispute.DisputeGuid,
            ResponseJson = "{\"resp 1\": \"resp1\"}"
        };

        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 8; i++)
        {
            var pollRespPostResponse = PollManager
                .CreatePollResp(Client, Polls[0].PollId, request);
            pollRespPostResponse.CheckStatusCode();
            PollResponses.Add(pollRespPostResponse.ResponseObject);
        }
    }

    private void CreateParticipantIdentities()
    {
        var participantRequest = new ParticipantRequest
        {
            ParticipantType = (byte)ParticipantType.Business,
            ParticipantStatus = (byte)ParticipantStatus.ValidatedAndParticipating,
            FirstName = "IntSched01",
            LastName = "Participant01",
            Address = "P01 Street",
            City = "P01 City",
            ProvinceState = "BC",
            PostalZip = "P1P 1P1",
            Country = "Canada",
            AcceptedTou = true,
            Email = "nomail_1@nomail.com"
        };

        var partyRequest = new List<ParticipantRequest> { participantRequest };
        var participantResponse = ParticipantManager.CreateParticipant(Client, Disputes[0].DisputeGuid, partyRequest);
        participantResponse.CheckStatusCode();
        var identityParticipant = participantResponse.ResponseObject[0];

        var request = new ParticipantIdentityPostRequest
        {
            ParticipantId = Participant.ParticipantId,
            IdentityParticipantId = identityParticipant.ParticipantId
        };

        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 8; i++)
        {
            var participantIdentityResponse = ParticipantIdentityManager
                .CreateParticipantIdentity(Client, request);
            participantIdentityResponse.CheckStatusCode();
            ParticipantIdentities.Add(participantIdentityResponse.ResponseObject);
        }
    }

    private void CreateOnlineMeetings()
    {
        var request = new OnlineMeetingPostRequest
        {
            ConferenceType = ConferenceType.MsTeams,
            ConferenceUrl = "QWERTY-123456789",
            DialInDescription1 = "DialInDescription1;",
            DialInNumber1 = "1234567890"
        };

        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 8; i++)
        {
            var onlineMeetingPostResponse = OnlineMeetingManager
                .CreateOnlineMeeting(Client, request);
            onlineMeetingPostResponse.CheckStatusCode();
            OnlineMeetings.Add(onlineMeetingPostResponse.ResponseObject);
        }
    }

    private void CreateDisputeLinks()
    {
        var request = new DisputeLinkPostRequest();

        Client.Authenticate(Users.Admin, Users.Admin);

        for (var i = 0; i < 8; i++)
        {
            request = new DisputeLinkPostRequest
            {
                DisputeGuid = Disputes[i].DisputeGuid,
                DisputeLinkRole = DisputeLinkRole.Primary,
                DisputeLinkType = DisputeLinkType.Cross,
                OnlineMeetingId = OnlineMeetings[i].OnlineMeetingId
            };

            var disputeLinkPostResponse = DisputeLinkManager
                .CreateDisputeLink(Client, request);
            disputeLinkPostResponse.CheckStatusCode();
            DisputeLinks.Add(disputeLinkPostResponse.ResponseObject);
        }
    }

    private void CreateDisputeVerifications()
    {
        for (var i = 0; i < 5; i++)
        {
            Client.Authenticate(Users.Admin, Users.Admin);
            var disputeFeePostResponse = DisputeFeeManager.CreateDisputeFee(Client, Disputes[i].DisputeGuid, new DisputeFeeRequest
            {
                PayorId = Participants[i].ParticipantId,
                AmountDue = 3,
                FeeType = (byte)DisputeFeeType.Other,
                IsActive = true
            });

            var request = new DisputeVerificationPostRequest
            {
                DisputeFeeId = disputeFeePostResponse.ResponseObject.DisputeFeeId,
                HearingId = DisputeHearings[i].HearingId
            };

            var disputeLinkPostResponse = DisputeVerificationManager
                .CreateDisputeVerification(Client, Disputes[i].DisputeGuid, request);
            disputeLinkPostResponse.CheckStatusCode();
            DisputeVerifications.Add(disputeLinkPostResponse.ResponseObject);
        }
    }

    private void CreateVerificationAttempts()
    {
        Client.Authenticate(Users.Admin, Users.Admin);
        var participants = GetCustomParticipants();

        for (var i = 0; i < 5; i++)
        {
            var request = new VerificationAttemptPostRequest
            {
                ParticipantId = participants[i].ParticipantId,
                ParticipantRole = ParticipantRole.Applicant
            };

            var verificationAttemptPostResponse = DisputeVerificationManager
                .CreateVerificationAttempt(Client, DisputeVerifications[i].VerificationId, request);
            verificationAttemptPostResponse.CheckStatusCode();
            VerificationAttempts.Add(verificationAttemptPostResponse.ResponseObject);
        }
    }

    private List<ParticipantResponse> GetCustomParticipants()
    {
        var participants = new List<ParticipantResponse>();

        var participantsRequest = new ParticipantRequest
        {
            ParticipantType = (byte)ParticipantType.Business,
            ParticipantStatus = (byte)ParticipantStatus.ValidatedAndParticipating,
            FirstName = "IntSched01",
            LastName = "Participant01",
            Address = "P01 Street",
            City = "P01 City",
            ProvinceState = "BC",
            PostalZip = "P1P 1P1",
            Country = "Canada",
            AcceptedTou = true
        };

        for (int i = 0; i < 5; i++)
        {
            var partiesRequest = new List<ParticipantRequest> { participantsRequest };
            var participantsResponse = ParticipantManager.CreateParticipant(Client, Disputes[i].DisputeGuid, partiesRequest);
            participantsResponse.CheckStatusCode();
            participants.Add(participantsResponse.ResponseObject[0]);
        }

        return participants;
    }
}