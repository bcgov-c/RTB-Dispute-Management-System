using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Business.Entities.Models.PollResponse;
using CM.Business.Entities.Models.TrialDispute;
using CM.Business.Entities.Models.TrialParticipant;
using CM.Business.Services.Amendment;
using CM.Business.Services.ClaimDetails;
using CM.Business.Services.Claims;
using CM.Business.Services.CustomDataObject;
using CM.Business.Services.EmailAttachment;
using CM.Business.Services.EmailMessages;
using CM.Business.Services.FilePackageService;
using CM.Business.Services.Files;
using CM.Business.Services.IntakeQuestions;
using CM.Business.Services.Notice;
using CM.Business.Services.NoticeService;
using CM.Business.Services.OutcomeDocRequest;
using CM.Business.Services.Parties;
using CM.Business.Services.Payment;
using CM.Business.Services.Poll;
using CM.Business.Services.RemedyDetails;
using CM.Business.Services.RemedyServices;
using CM.Business.Services.SubstitutedService;
using CM.Business.Services.TrialDispute;
using CM.Business.Services.TrialParticipant;
using CM.Business.Services.UserServices;
using CM.WebAPI.Controllers;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CM.WebAPI.Authorization.Handlers;

public class ExtendedUserResourceAuthorizationHandler : IResourceAuthorizationHandler
{
    public async Task<bool> IsAuthorized(ActionExecutingContext context, int userId)
    {
        var action = context.ActionDescriptor.RouteValues["action"];
        var userService = context.GetService<IUserService>();
        var partyService = context.GetService<IParticipantService>();
        var user = await userService.GetUserWithFullInfo(userId);
        var disputeGuid = Guid.Empty;
        var bypassAuth = false;

        switch (context.Controller)
        {
            case OfficeUserController:
                disputeGuid = action switch
                {
                    "GetPickupMessage" => await context.ResolveDispute<IEmailMessageService>("emailMessageId"),
                    "SetPickupMessageStatus" => await context.ResolveDispute<IEmailMessageService>("emailMessageId"),
                    _ => disputeGuid
                };

                break;
            case TrialController:
                disputeGuid = action switch
                {
                    "GetDisputeTrials" => context.GetContextId<Guid>("disputeGuid"),
                    _ => disputeGuid
                };

                break;
            case TrialDisputeController:
                disputeGuid = action switch
                {
                    "Post" => context.GetContextId<PostTrialDisputeRequest>("request").DisputeGuid,
                    "Patch" => await context.ResolveDisputeByGuid<ITrialDisputeService>("trialDisputeGuid"),
                    "Delete" => await context.ResolveDisputeByGuid<ISubstitutedService>("trialDisputeGuid"),
                    _ => disputeGuid
                };

                break;
            case TrialParticipantController:
                if (action.Equals("Post"))
                {
                    var postTrialParticipantRequest = context.GetContextId<PostTrialParticipantRequest>("request");
                    if (!postTrialParticipantRequest.DisputeGuid.HasValue)
                    {
                        bypassAuth = true;
                    }

                    disputeGuid = postTrialParticipantRequest.DisputeGuid.GetValueOrDefault();
                }

                disputeGuid = action switch
                {
                    "Patch" => await context.ResolveDisputeByGuid<ITrialParticipantService>("trialParticipantGuid"),
                    "Delete" => await context.ResolveDisputeByGuid<ITrialParticipantService>("trialParticipantGuid"),
                    _ => disputeGuid
                };

                break;
            case OutcomeDocRequestController:
                disputeGuid = action switch
                {
                    "Post" => context.GetContextId<Guid>("disputeGuid"),
                    "GetExternalOutcomeDocRequests" => context.GetContextId<Guid>("disputeGuid"),
                    _ => disputeGuid
                };

                break;
            case OutcomeDocRequestItemController:
                disputeGuid = action switch
                {
                    "Post" => await context.ResolveDispute<IOutcomeDocRequestService>("outcomeDocRequestId"),
                    _ => disputeGuid
                };

                break;
            case OutcomeDocGroupController:
                disputeGuid = action switch
                {
                    "GetExternalOutcomeDocGroups" => context.GetContextId<Guid>("disputeGuid"),
                    _ => disputeGuid
                };

                break;
            case SubstitutedServiceController:
                disputeGuid = action switch
                {
                    "Post" => context.GetContextId<Guid>("disputeGuid"),
                    "GetExternalDisputeSubstitutedServices" => context.GetContextId<Guid>("disputeGuid"),
                    "Patch" => await context.ResolveDispute<ISubstitutedService>("substitutedServiceId"),
                    "Delete" => await context.ResolveDispute<ISubstitutedService>("substitutedServiceId"),
                    _ => disputeGuid
                };

                break;
            case NoticeServiceController:
                disputeGuid = action switch
                {
                    "Post" => await context.ResolveDispute<INoticeService>("noticeId"),
                    "Patch" => await context.ResolveDispute<INoticeServiceService>("noticeServiceId"),
                    "Delete" => await context.ResolveDispute<INoticeServiceService>("noticeServiceId"),
                    _ => disputeGuid
                };

                break;
            case NoticeController:
                disputeGuid = action switch
                {
                    "Patch" => await context.ResolveDispute<INoticeService>("noticeId"),
                    "Delete" => await context.ResolveDispute<INoticeService>("noticeId"),
                    "GetById" => await context.ResolveDispute<INoticeService>("noticeId"),
                    "GetByDisputeGuid" => context.GetContextId<Guid>("disputeGuid"),
                    "GetExternalDisputeNotices" => context.GetContextId<Guid>("disputeGuid"),
                    _ => disputeGuid
                };

                break;
            case DisputeController:
                disputeGuid = action switch
                {
                    "Patch" => context.GetContextId<Guid>("disputeGuid"),
                    "PostDisputeStatus" => context.GetContextId<Guid>("disputeGuid"),
                    "Get" => context.GetContextId<Guid>("disputeGuid"),
                    "GetDisputeStatuses" => context.GetContextId<Guid>("disputeGuid"),
                    _ => disputeGuid
                };

                break;
            case IntakeQuestionsController:
                disputeGuid = action switch
                {
                    "Post" => context.GetContextId<Guid>("disputeGuid"),
                    "Get" => context.GetContextId<Guid>("disputeGuid"),
                    "Patch" => await context.ResolveDispute<IIntakeQuestionsService>("questionId"),
                    _ => disputeGuid
                };

                break;
            case UsersController:
                if (action.Equals("GetDisputeUserList"))
                {
                    disputeGuid = context.GetContextId<Guid>("disputeGuid");
                }

                break;
            case ClaimGroupController:
                disputeGuid = action switch
                {
                    "Post" => context.GetContextId<Guid>("disputeGuid"),
                    _ => disputeGuid
                };

                break;
            case ClaimController:
                disputeGuid = action switch
                {
                    "Post" => await context.ResolveDispute<IClaimGroupService>("claimGroupId"),
                    "Patch" => await context.ResolveDispute<IClaimService>("claimId"),
                    "Delete" => await context.ResolveDispute<IClaimService>("claimId"),
                    "GetIssueClaim" => await context.ResolveDispute<IClaimService>("claimId"),
                    "GetDisputeClaims" => context.GetContextId<Guid>("disputeGuid"),
                    _ => disputeGuid
                };

                break;
            case ClaimDetailController:
                disputeGuid = action switch
                {
                    "Post" => await context.ResolveDispute<IClaimService>("claimId"),
                    "Patch" => await context.ResolveDispute<IClaimDetailService>("claimDetailId"),
                    "Delete" => await context.ResolveDispute<IClaimDetailService>("claimDetailId"),
                    _ => disputeGuid
                };

                break;
            case ClaimGroupParticipantController:
                disputeGuid = action switch
                {
                    "Post" => await context.ResolveDispute<IClaimGroupService>("claimGroupId"),
                    "Patch" => await context.ResolveDispute<IClaimGroupParticipantService>("groupParticipantId"),
                    "Delete" => await context.ResolveDispute<IClaimGroupParticipantService>("groupParticipantId"),
                    "GetClaimGroupParticipants" => context.GetContextId<Guid>("disputeGuid"),
                    _ => disputeGuid
                };

                break;
            case DisputeFeeController:
                disputeGuid = action switch
                {
                    "Post" => context.GetContextId<Guid>("disputeGuid"),
                    "GetByDisputeGuid" => context.GetContextId<Guid>("disputeGuid"),
                    "Patch" => await context.ResolveDispute<IDisputeFeeService>("disputeFeeId"),
                    "Get" => await context.ResolveDispute<IDisputeFeeService>("disputeFeeId"),
                    _ => disputeGuid
                };

                break;
            case EmailMessageController:
                disputeGuid = action switch
                {
                    "Delete" => await context.ResolveDispute<IEmailMessageService>("emailId"),
                    "Patch" => await context.ResolveDispute<IEmailMessageService>("emailId"),
                    "GetById" => await context.ResolveDispute<IEmailMessageService>("emailId"),
                    "GetByDisputeGuid" => context.GetContextId<Guid>("disputeGuid"),
                    "Post" => context.GetContextId<Guid>("disputeGuid"),
                    "GetExternalDisputeEmailMessages" => context.GetContextId<Guid>("disputeGuid"),
                    _ => disputeGuid
                };

                if (action.Equals("PostVerificationMessage") || action.Equals("PostEmailVerification"))
                {
                    var headerGuid = context.HttpContext.Request.Headers["disputeGuid"].ToString();
                    var isValid = Guid.TryParse(headerGuid, out disputeGuid);
                }

                break;
            case EmailAttachmentController:
                disputeGuid = action switch
                {
                    "GetAll" => await context.ResolveDispute<IEmailMessageService>("emailId"),
                    "Post" => await context.ResolveDispute<IEmailMessageService>("emailId"),
                    "Delete" => await context.ResolveDispute<IEmailAttachmentService>("emailAttachmentId"),
                    _ => disputeGuid
                };

                break;
            case FileDescriptionController:
                disputeGuid = action switch
                {
                    "Delete" => await context.ResolveDispute<IFileDescriptionService>("fileDescriptionId"),
                    "Patch" => await context.ResolveDispute<IFileDescriptionService>("fileDescriptionId"),
                    "GetById" => await context.ResolveDispute<IFileDescriptionService>("fileDescriptionId"),
                    "Post" => context.GetContextId<Guid>("disputeGuid"),
                    "GetByDisputeGuid" => context.GetContextId<Guid>("disputeGuid"),
                    _ => disputeGuid
                };

                break;
            case PartiesController:
                disputeGuid = action switch
                {
                    "Patch" => await context.ResolveDispute<IParticipantService>("participantId"),
                    "Get" => await context.ResolveDispute<IParticipantService>("participantId"),
                    "Delete" => await context.ResolveDispute<IParticipantService>("participantId"),
                    "Post" => context.GetContextId<Guid>("disputeGuid"),
                    "GetDisputeParticipants" => context.GetContextId<Guid>("disputeGuid"),
                    _ => disputeGuid
                };

                break;
            case PaymentTransactionController:
                if (action.Equals("CheckBamboraTransactionByTrnId"))
                {
                    bypassAuth = true;
                }

                disputeGuid = action switch
                {
                    "Patch" => await context.ResolveDispute<IPaymentTransactionService>("transactionId"),
                    "Post" => await context.ResolveDispute<IDisputeFeeService>("disputeFeeId"),
                    _ => disputeGuid
                };

                break;
            case RemedyController:
                disputeGuid = action switch
                {
                    "Patch" => await context.ResolveDispute<IRemedyService>("remedyId"),
                    "Delete" => await context.ResolveDispute<IRemedyService>("remedyId"),
                    "Post" => await context.ResolveDispute<IClaimService>("claimId"),
                    _ => disputeGuid
                };

                break;
            case RemedyDetailController:
                disputeGuid = action switch
                {
                    "Patch" => await context.ResolveDispute<IRemedyDetailService>("remedyDetailId"),
                    "Delete" => await context.ResolveDispute<IRemedyDetailService>("remedyDetailId"),
                    "Post" => await context.ResolveDispute<IRemedyService>("remedyId"),
                    _ => disputeGuid
                };

                break;
            case FileController:
                if (action.Equals("Post") || action.Equals("PdfFromHtml"))
                {
                    disputeGuid = context.GetContextId<Guid>("disputeGuid");
                }
                else if (action.Equals("Delete"))
                {
                    var fileId = context.GetContextId<int>("fileId");
                    var fileService = context.GetService<IFileService>();
                    var file = await fileService.GetNoTrackingFileAsync(fileId);
                    if (file.CreatedBy == userId)
                    {
                        bypassAuth = true;
                    }

                    disputeGuid = await context.ResolveDispute<IFileService>("fileId");
                }
                else if (action.Equals("GetByUrl"))
                {
                    var fileGuid = context.GetContextId<Guid>("fileGuid");
                    var fileService = context.GetService<IFileService>();
                    var file = await fileService.GetAsync(fileGuid);
                    if (file != null)
                    {
                        disputeGuid = file.DisputeGuid;
                    }
                }

                break;
            case FileUploadController:
                disputeGuid = action switch
                {
                    "PostChunked" => context.GetContextId<Guid>("disputeGuid"),
                    _ => disputeGuid
                };

                break;

            case FileInfoController:
                disputeGuid = action switch
                {
                    "GetDisputeFiles" => context.GetContextId<Guid>("disputeGuid"),
                    "Get" => await context.ResolveDispute<IFileService>("fileId"),
                    "Patch" => await context.ResolveDispute<IFileService>("fileId"),
                    _ => disputeGuid
                };

                break;
            case LinkedFileController:
                disputeGuid = action switch
                {
                    "GetDisputeLinkFiles" => context.GetContextId<Guid>("disputeGuid"),
                    "Post" => context.GetContextId<Guid>("disputeGuid"),
                    "Delete" => await context.ResolveDispute<ILinkedFileService>("linkFileId"),
                    _ => disputeGuid
                };

                break;
            case AmendmentController:
                disputeGuid = action switch
                {
                    "GetDisputeAmendments" => context.GetContextId<Guid>("disputeGuid"),
                    "Post" => context.GetContextId<Guid>("disputeGuid"),
                    "Get" => await context.ResolveDispute<IAmendmentService>("amendmentId"),
                    "Patch" => await context.ResolveDispute<IAmendmentService>("amendmentId"),
                    _ => disputeGuid
                };

                break;
            case FilePackageController:
                disputeGuid = action switch
                {
                    "GetByDisputeGuid" => context.GetContextId<Guid>("disputeGuid"),
                    "Post" => context.GetContextId<Guid>("disputeGuid"),
                    "Get" => await context.ResolveDispute<IFilePackageService>("filePackageId"),
                    "Patch" => await context.ResolveDispute<IFilePackageService>("filePackageId"),
                    "Delete" => await context.ResolveDispute<IFilePackageService>("filePackageId"),
                    _ => disputeGuid
                };

                break;
            case FilePackageServiceController:
                disputeGuid = action switch
                {
                    "Post" => await context.ResolveDispute<IFilePackageService>("filePackageId"),
                    "Patch" => await context.ResolveDispute<IFilePackageServiceService>("filePackageServiceId"),
                    "Delete" => await context.ResolveDispute<IFilePackageServiceService>("filePackageServiceId"),
                    _ => disputeGuid
                };

                break;
            case CustomDataObjectController:
                disputeGuid = action switch
                {
                    "Post" => context.GetContextId<Guid>("disputeGuid"),
                    "GetAllByDispute" => context.GetContextId<Guid>("disputeGuid"),
                    "Get" => await context.ResolveDispute<ICustomDataObjectService>("customObjectId"),
                    "Patch" => await context.ResolveDispute<ICustomDataObjectService>("customObjectId"),
                    "Delete" => await context.ResolveDispute<ICustomDataObjectService>("customObjectId"),
                    _ => disputeGuid
                };

                break;

            case DisputeFlagController:
                disputeGuid = action switch
                {
                    "Post" => context.GetContextId<Guid>("disputeGuid"),
                    "GetLinkedDisputeFlags" => context.GetContextId<Guid>("disputeGuid"),
                    _ => disputeGuid
                };

                break;

            case SubmissionReceiptController:
                disputeGuid = action switch
                {
                    "Post" => context.GetContextId<Guid>("disputeGuid"),
                    "GetExternalSubmissionReceipts" => context.GetContextId<Guid>("disputeGuid"),
                    _ => disputeGuid
                };

                break;

            case DisputeHearingController:
                disputeGuid = action switch
                {
                    "GetExternalDisputeHearings" => context.GetContextId<Guid>("disputeGuid"),
                    _ => disputeGuid
                };

                break;

            case PollResponseController:
                disputeGuid = action switch
                {
                    "Post" => context.GetContextId<PollRespRequest>("request").DisputeGuid,
                    "Patch" => await context.ResolveDispute<IPollResponseService>("pollResponseId"),
                    "Delete" => await context.ResolveDispute<IPollResponseService>("pollResponseId"),
                    "Get" => await context.ResolveDispute<IPollResponseService>("pollResponseId"),
                    "GetDisputePollResponses" => context.GetContextId<Guid>("disputeGuid"),
                    _ => disputeGuid
                };

                if (action.Equals("GetParticipantPollResponses"))
                {
                    var participantId = context.GetContextId<int>("participantId");
                    var participant = await partyService.GetByIdAsync(participantId);
                    disputeGuid = participant.DisputeGuid;
                }

                break;
        }

        var isAuthorized = user.DisputeUsers != null && user.DisputeUsers.Any(x => x.DisputeGuid == disputeGuid);
        return isAuthorized || bypassAuth;
    }
}