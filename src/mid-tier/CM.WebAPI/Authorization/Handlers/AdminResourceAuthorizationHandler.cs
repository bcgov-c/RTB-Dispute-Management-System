using System;
using System.Threading.Tasks;
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
using CM.Business.Services.RemedyDetails;
using CM.Business.Services.RemedyServices;
using CM.Business.Services.SubstitutedService;
using CM.WebAPI.Controllers;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CM.WebAPI.Authorization.Handlers;

public class AdminResourceAuthorizationHandler : IResourceAuthorizationHandler
{
    private readonly Guid _disputeGuidToken;

    public AdminResourceAuthorizationHandler(Guid disputeGuidToken)
    {
        _disputeGuidToken = disputeGuidToken;
    }

    public async Task<bool> IsAuthorized(ActionExecutingContext context, int userId)
    {
        if (_disputeGuidToken == Guid.Empty)
        {
            return false;
        }

        var action = context.ActionDescriptor.RouteValues["action"];
        var disputeGuid = Guid.Empty;
        var bypassAuth = false;

        switch (context.Controller)
        {
            case AmendmentController:
                disputeGuid = action switch
                {
                    "Patch" => await context.ResolveDispute<IAmendmentService>("amendmentId"),
                    "Get" => await context.ResolveDispute<IAmendmentService>("amendmentId"),
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
                    _ => disputeGuid
                };

                break;
            case OutcomeDocRequestController:
                disputeGuid = action switch
                {
                    "Patch" => await context.ResolveDispute<IOutcomeDocRequestService>("outcomeDocRequestId"),
                    "Delete" => await context.ResolveDispute<IOutcomeDocRequestService>("outcomeDocRequestId"),
                    "GetById" => await context.ResolveDispute<IOutcomeDocRequestService>("outcomeDocRequestId"),
                    _ => disputeGuid
                };

                break;
            case OutcomeDocRequestItemController:
                disputeGuid = action switch
                {
                    "Post" => await context.ResolveDispute<IOutcomeDocRequestService>("outcomeDocRequestId"),
                    "Patch" => await context.ResolveDispute<IOutcomeDocRequestItemService>("outcomeDocReqItemId"),
                    "Delete" => await context.ResolveDispute<IOutcomeDocRequestItemService>("outcomeDocReqItemId"),
                    _ => disputeGuid
                };

                break;
            case SubstitutedServiceController:
                disputeGuid = action switch
                {
                    "Patch" => await context.ResolveDispute<ISubstitutedService>("substitutedServiceId"),
                    "Delete" => await context.ResolveDispute<ISubstitutedService>("subServiceId"),
                    "GetById" => await context.ResolveDispute<ISubstitutedService>("subServiceId"),
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
                    _ => disputeGuid
                };

                break;
            case IntakeQuestionsController:
                disputeGuid = action switch
                {
                    "Patch" => await context.ResolveDispute<IIntakeQuestionsService>("questionId"),
                    _ => disputeGuid
                };

                break;
            case DisputeFeeController:
                disputeGuid = action switch
                {
                    "Patch" => await context.ResolveDispute<IDisputeFeeService>("disputeFeeId"),
                    "Delete" => await context.ResolveDispute<IDisputeFeeService>("disputeFeeId"),
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
                    _ => disputeGuid
                };

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
                    _ => disputeGuid
                };

                break;
            case PartiesController:
                disputeGuid = action switch
                {
                    "Patch" => await context.ResolveDispute<IParticipantService>("participantId"),
                    "Get" => await context.ResolveDispute<IParticipantService>("participantId"),
                    "Delete" => await context.ResolveDispute<IParticipantService>("participantId"),
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
                    "Post" => await context.ResolveDispute<IDisputeFeeService>("disputeFeeId"),
                    "Patch" => await context.ResolveDispute<IPaymentTransactionService>("transactionId"),
                    "Delete" => await context.ResolveDispute<IPaymentTransactionService>("transactionId"),
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
                disputeGuid = action switch
                {
                    "Delete" => await context.ResolveDispute<IFileService>("fileId"),
                    _ => disputeGuid
                };

                break;
            case FileInfoController:
                disputeGuid = action switch
                {
                    "Get" => await context.ResolveDispute<IFileService>("fileId"),
                    "Patch" => await context.ResolveDispute<IFileService>("fileId"),
                    _ => disputeGuid
                };

                break;
            case LinkedFileController:
                disputeGuid = action switch
                {
                    "Delete" => await context.ResolveDispute<ILinkedFileService>("linkFileId"),
                    _ => disputeGuid
                };

                break;
            case FilePackageController:
                disputeGuid = action switch
                {
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
                    "Get" => await context.ResolveDispute<ICustomDataObjectService>("customObjectId"),
                    "Patch" => await context.ResolveDispute<ICustomDataObjectService>("customObjectId"),
                    "Delete" => await context.ResolveDispute<ICustomDataObjectService>("customObjectId"),
                    _ => disputeGuid
                };

                break;
        }

        var isAuthorized = _disputeGuidToken == disputeGuid;

        return isAuthorized || bypassAuth;
    }
}