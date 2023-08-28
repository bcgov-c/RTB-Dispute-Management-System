using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.OfficeUser;
using CM.Business.Entities.Models.PollResponse;
using CM.Business.Entities.Models.TrialDispute;
using CM.Business.Entities.Models.TrialParticipant;
using CM.Business.Services.CustomDataObject;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.Files;
using CM.Business.Services.NoticeService;
using CM.Business.Services.OutcomeDocRequest;
using CM.Business.Services.Parties;
using CM.Business.Services.Payment;
using CM.Business.Services.Poll;
using CM.Business.Services.RemedyServices;
using CM.Business.Services.TrialDispute;
using CM.Business.Services.TrialParticipant;
using CM.Common.Utilities;
using CM.WebAPI.Controllers;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc.Filters;
using MimeKit;

namespace CM.WebAPI.Authorization.Handlers;

public class AccessCodeUserResourceAuthorizationHandler : IResourceAuthorizationHandler
{
    public async Task<bool> IsAuthorized(ActionExecutingContext context, int userId)
    {
        var action = context.ActionDescriptor.RouteValues["action"];
        var participantService = context.GetService<IParticipantService>();
        var fileService = context.GetService<IFileService>();
        var filePackageService = context.GetService<IFilePackageService>();
        var disputeService = context.GetService<IDisputeService>();
        var partyService = context.GetService<IParticipantService>();
        var pollResponseService = context.GetService<IPollResponseService>();
        var noticeServiceService = context.GetService<INoticeServiceService>();
        var trialDisputeDisputeGuid = Guid.Empty;

        if (action == null)
        {
            return false;
        }

        var isAuthorized = false;
        var participantDisputeGuid = await participantService.ResolveDisputeGuid(userId);

        switch (context.Controller)
        {
            case TrialController:
                if (action.Equals("GetDisputeTrials"))
                {
                    var trialsDisputeGuid = context.GetContextId<Guid>("disputeGuid");
                    if (participantDisputeGuid == trialsDisputeGuid)
                    {
                        isAuthorized = true;
                    }
                }

                break;
            case TrialDisputeController:

                switch (action)
                {
                    case "Post":
                    {
                        var postTrialDisputeRequest = context.GetContextId<PostTrialDisputeRequest>("request");
                        trialDisputeDisputeGuid = postTrialDisputeRequest.DisputeGuid;

                        break;
                    }

                    case "Patch":
                    case "Delete":
                        trialDisputeDisputeGuid = await context.ResolveDisputeByGuid<ITrialDisputeService>("trialDisputeGuid");

                        break;
                }

                if (participantDisputeGuid == trialDisputeDisputeGuid)
                {
                    isAuthorized = true;
                }

                break;
            case TrialParticipantController:

                if (action.Equals("Post"))
                {
                    var postTrialParticipantRequest = context.GetContextId<PostTrialParticipantRequest>("request");

                    if (!postTrialParticipantRequest.DisputeGuid.HasValue)
                    {
                        return true;
                    }

                    trialDisputeDisputeGuid = postTrialParticipantRequest.DisputeGuid.GetValueOrDefault();
                }

                trialDisputeDisputeGuid = action switch
                {
                    "Patch" => await context.ResolveDisputeByGuid<ITrialParticipantService>("trialParticipantGuid"),
                    "Delete" => await context.ResolveDisputeByGuid<ITrialParticipantService>("trialParticipantGuid"),
                    _ => trialDisputeDisputeGuid
                };

                if (participantDisputeGuid == trialDisputeDisputeGuid)
                {
                    isAuthorized = true;
                }

                break;
            case OutcomeDocRequestController:
                if (action.Equals("Post"))
                {
                    var outcomeDocRequestDisputeGuid = context.GetContextId<Guid>("disputeGuid");
                    if (participantDisputeGuid == outcomeDocRequestDisputeGuid)
                    {
                        isAuthorized = true;
                    }
                }

                break;
            case OutcomeDocRequestItemController:
                if (action.Equals("Post"))
                {
                    var outcomeDocReqItemDisputeGuid = await context.ResolveDispute<IOutcomeDocRequestService>("outcomeDocRequestId");
                    if (participantDisputeGuid == outcomeDocReqItemDisputeGuid)
                    {
                        isAuthorized = true;
                    }
                }

                break;
            case SubstitutedServiceController:
                if (action.Equals("Post"))
                {
                    var subServiceDisputeGuid = context.GetContextId<Guid>("disputeGuid");
                    if (participantDisputeGuid == subServiceDisputeGuid)
                    {
                        isAuthorized = true;
                    }
                }

                break;
            case DisputeFeeController:
                if (action.Equals("Post"))
                {
                    var disputeFeeDisputeGuid = context.GetContextId<Guid>("disputeGuid");
                    if (participantDisputeGuid == disputeFeeDisputeGuid)
                    {
                        isAuthorized = true;
                    }
                }

                break;
            case PaymentTransactionController:
                var ptDisputeGuid = Guid.Empty;

                switch (action)
                {
                    case "Post":
                        ptDisputeGuid = await context.ResolveDispute<IDisputeFeeService>("disputeFeeId");

                        break;
                    case "Patch":
                    case "CheckBamboraTransactionByTrnId":
                        ptDisputeGuid = await context.ResolveDispute<IPaymentTransactionService>("transactionId");

                        break;
                }

                if (participantDisputeGuid == ptDisputeGuid)
                {
                    isAuthorized = true;
                }

                break;
            case TaskController:
                if (action.Equals("Post"))
                {
                    var disputeGuid = context.GetContextId<Guid>("disputeGuid");
                    if (participantDisputeGuid == disputeGuid)
                    {
                        isAuthorized = true;
                    }
                }

                break;
            case UsersController:
                if (action.Equals("ExtendSession") || action.Equals("Logout"))
                {
                    isAuthorized = true;
                }

                break;
            case AccessCodeController:
                isAuthorized = true;
                break;
            case ExternalUpdateController:
                var extDisputeGuid = Guid.Empty;
                switch (action)
                {
                    case "PatchParticipant":
                    {
                        var participantId = context.GetContextId<int>("participantId");
                        var participant = await participantService.GetByIdAsync(participantId);
                        extDisputeGuid = participant.DisputeGuid;

                        break;
                    }

                    case "PatchNoticeService":
                    {
                        var noticeServiceId = context.GetContextId<int>("noticeServiceId");
                        var noticeService = await noticeServiceService.GetNoticeServiceAsync(noticeServiceId);
                        extDisputeGuid = noticeService.Notice.DisputeGuid;

                        break;
                    }

                    case "PostDisputeStatus":
                    {
                        var fileNumber = context.GetContextId<int>("fileNumber");
                        var dispute = await disputeService.GetDisputeByFileNumber(fileNumber);
                        extDisputeGuid = dispute.DisputeGuid;

                        break;
                    }
                }

                if (participantDisputeGuid == extDisputeGuid)
                {
                    isAuthorized = true;
                }

                break;
            case OfficeUserController:
                switch (action)
                {
                    case "PostRemedyDetails":
                        {
                            var remedyDisputeGuid = await context.ResolveDispute<IRemedyService>("remedyId");

                            if (participantDisputeGuid == remedyDisputeGuid)
                            {
                                isAuthorized = true;
                            }

                            break;
                        }

                    case "PatchHearingParticipation":
                    case "PostHearingParticipation":
                        {
                            var disputeGuid = context.GetContextId<Guid>("disputeGuid");
                            if (participantDisputeGuid == disputeGuid)
                            {
                                isAuthorized = true;
                            }

                            break;
                        }

                    case "PatchDisputeInfo":
                        {
                            var disputeGuid = context.GetContextId<Guid>("disputeGuid");
                            if (participantDisputeGuid == disputeGuid)
                            {
                                isAuthorized = true;
                            }

                            break;
                        }

                    case "PostNotice":
                        {
                            var disputeGuid = context.GetContextId<Guid>("disputeGuid");
                            if (participantDisputeGuid == disputeGuid)
                            {
                                isAuthorized = true;
                            }

                            break;
                        }

                    case "GetDisputeDetails":
                        {
                            var request = context.GetContextId<OfficeUserGetDisputeRequest>("request");
                            var disputeGuid = Guid.Empty;

                            switch (request.SearchMethod)
                            {
                                case (byte)ExternalUpdateSearchMethod.FileNumber:
                                    {
                                        var dispute = await disputeService.GetDisputeByFileNumber(request.FileNumber);
                                        disputeGuid = dispute.DisputeGuid;

                                        break;
                                    }

                                case (byte)ExternalUpdateSearchMethod.AccessCode:
                                    {
                                        var participant = await participantService.GetByAccessCode(request.AccessCode);
                                        disputeGuid = participant.DisputeGuid;

                                        break;
                                    }
                            }

                            if (participantDisputeGuid == disputeGuid)
                            {
                                isAuthorized = true;
                            }

                            break;
                        }
                }

                break;
            case FileDescriptionController:
                var fdDisputeGuid = Guid.Empty;

                switch (action)
                {
                    case "Delete":
                    case "Patch":
                    case "GetById":
                        fdDisputeGuid = await context.ResolveDispute<IFileDescriptionService>("fileDescriptionId");

                        break;
                    case "Post":
                    case "GetByDisputeGuid":
                        fdDisputeGuid = context.GetContextId<Guid>("disputeGuid");

                        break;
                }

                if (participantDisputeGuid == fdDisputeGuid)
                {
                    isAuthorized = true;
                }

                break;
            case LinkedFileController:
                var linkedFileDisputeGuid = Guid.Empty;

                switch (action)
                {
                    case "GetDisputeLinkFiles":
                    case "Post":
                        linkedFileDisputeGuid = context.GetContextId<Guid>("disputeGuid");

                        break;
                    case "Delete":
                        linkedFileDisputeGuid = await context.ResolveDispute<ILinkedFileService>("linkFileId");

                        break;
                }

                if (participantDisputeGuid == linkedFileDisputeGuid)
                {
                    isAuthorized = true;
                }

                break;
            case FileController:
                var fileDisputeGuid = Guid.Empty;

                switch (action)
                {
                    case "Post":
                    case "PdfFromHtml":
                        fileDisputeGuid = context.GetContextId<Guid>("disputeGuid");

                        break;
                    case "Delete":
                    {
                        var fileId = context.GetContextId<int>("fileId");
                        var file = await fileService.GetNoTrackingFileAsync(fileId);
                        if (file is { FileType: (byte)FileType.ExternalEvidence or (byte)FileType.ExternalNonEvidence, FilePackageId: { } })
                        {
                            var filePackageId = file.FilePackageId.GetValueOrDefault();
                            var filePackage = await filePackageService.GetByIdAsync(filePackageId);

                            if (filePackage.PackageType is (byte)FilePackageType.DisputeAccessSubmission or (byte)FilePackageType.FilePackageType3)
                            {
                                fileDisputeGuid = await context.ResolveDispute<IFileService>("fileId");
                            }
                        }

                        break;
                    }

                    case "GetByUrl":
                    {
                        var fileGuid = context.GetContextId<Guid>("fileGuid");
                        var file = await fileService.GetAsync(fileGuid);
                        if (file != null)
                        {
                            fileDisputeGuid = file.DisputeGuid;
                        }

                        break;
                    }
                }

                if (participantDisputeGuid == fileDisputeGuid)
                {
                    isAuthorized = true;
                }

                break;
            case FileUploadController:
                var fileUploadDisputeGuid = Guid.Empty;

                if (action.Equals("PostChunked"))
                {
                    fileUploadDisputeGuid = context.GetContextId<Guid>("disputeGuid");
                }

                if (participantDisputeGuid == fileUploadDisputeGuid)
                {
                    isAuthorized = true;
                }

                break;

            case AmendmentController:
                var amendmentDisputeGuid = Guid.Empty;

                if (action.Equals("Post"))
                {
                    amendmentDisputeGuid = context.GetContextId<Guid>("disputeGuid");
                }

                if (participantDisputeGuid == amendmentDisputeGuid)
                {
                    isAuthorized = true;
                }

                break;
            case FilePackageController:
                var filePackageDisputeGuid = Guid.Empty;

                switch (action)
                {
                    case "Post":
                    case "GetByDisputeGuid":
                        filePackageDisputeGuid = context.GetContextId<Guid>("disputeGuid");

                        break;
                    case "Get":
                    case "Patch":
                    case "Delete":
                        filePackageDisputeGuid = await context.ResolveDispute<IFilePackageService>("filePackageId");

                        break;
                }

                if (participantDisputeGuid == filePackageDisputeGuid)
                {
                    isAuthorized = true;
                }

                break;
            case EmailMessageController:
                if (action.Equals("Post"))
                {
                    var emailMessageDisputeGuid = context.GetContextId<Guid>("disputeGuid");
                    if (emailMessageDisputeGuid != Guid.Empty)
                    {
                        if (participantDisputeGuid == emailMessageDisputeGuid)
                        {
                            isAuthorized = true;
                        }
                    }
                }

                if (action.Equals("PostVerificationMessage") || action.Equals("PostEmailVerification"))
                {
                    var headerGuid = context.HttpContext.Request.Headers["disputeGuid"].ToString();
                    var disputeGuid = Guid.Empty;
                    var isValid = Guid.TryParse(headerGuid, out disputeGuid);
                    if (isValid)
                    {
                        if (participantDisputeGuid == disputeGuid)
                        {
                            isAuthorized = true;
                        }
                    }
                }

                break;

            case CustomDataObjectController:
                var customObjectDisputeGuid = Guid.Empty;

                switch (action)
                {
                    case "Post":
                    case "GetAllByDispute":
                        customObjectDisputeGuid = context.GetContextId<Guid>("disputeGuid");

                        break;
                    case "Get":
                    case "Patch":
                    case "Delete":
                        customObjectDisputeGuid = await context.ResolveDispute<ICustomDataObjectService>("customObjectId");

                        break;
                }

                if (participantDisputeGuid == customObjectDisputeGuid)
                {
                    isAuthorized = true;
                }

                break;

            case DisputeFlagController:
                if (action.Equals("Post") || action.Equals("GetLinkedDisputeFlags"))
                {
                    var disputeFlagDisputeGuid = context.GetContextId<Guid>("disputeGuid");
                    if (participantDisputeGuid == disputeFlagDisputeGuid)
                    {
                        isAuthorized = true;
                    }
                }

                break;

            case SubmissionReceiptController:
                if (action.Equals("Post"))
                {
                    var submissionReceiptDisputeGuid = context.GetContextId<Guid>("disputeGuid");
                    if (participantDisputeGuid == submissionReceiptDisputeGuid)
                    {
                        isAuthorized = true;
                    }
                }

                break;

            case PollResponseController:
                var pollResponseDisputeGuid = Guid.Empty;
                if (action.Equals("Post"))
                {
                    pollResponseDisputeGuid = context.GetContextId<PollRespRequest>("request").DisputeGuid;
                }
                else if (action.Equals("GetDisputePollResponses"))
                {
                    pollResponseDisputeGuid = context.GetContextId<Guid>("disputeGuid");
                }
                else if (action.Equals("Patch") || action.Equals("Delete") || action.Equals("Get"))
                {
                    var pollResponseId = context.GetContextId<int>("pollResponseId");
                    var pollResponse = await pollResponseService.GetNoTrackingAsync(pollResponseId);
                    pollResponseDisputeGuid = pollResponse.DisputeGuid;
                }
                else if (action.Equals("GetParticipantPollResponses"))
                {
                    var participantId = context.GetContextId<int>("participantId");
                    var participant = await partyService.GetByIdAsync(participantId);
                    pollResponseDisputeGuid = participant.DisputeGuid;
                }

                if (participantDisputeGuid == pollResponseDisputeGuid)
                {
                    isAuthorized = true;
                }

                break;
        }

        return isAuthorized;
    }
}