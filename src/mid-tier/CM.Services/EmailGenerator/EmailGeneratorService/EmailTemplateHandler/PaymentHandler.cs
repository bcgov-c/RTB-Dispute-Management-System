using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.ServiceBase.Exceptions;
using CM.Services.EmailGenerator.EmailGeneratorService.Tags;

namespace CM.Services.EmailGenerator.EmailGeneratorService.EmailTemplateHandler;

public class PaymentHandler : AbstractEmailMessageHandler
{
    public PaymentHandler(IUnitOfWork unitOfWork, int assignedTEmplateId)
        : base(unitOfWork, assignedTEmplateId)
    {
    }

    public override async Task<StringBuilder> Handle(StringBuilder htmlBody, Dispute dispute, Participant participant)
    {
        var disputeFees = await UnitOfWork.DisputeFeeRepository.GetByDisputeGuid(dispute.DisputeGuid);
        var lastDisputeFee = disputeFees.LastOrDefault();
        if (lastDisputeFee?.PayorId != null)
        {
            var payor = await UnitOfWork.ParticipantRepository.GetByIdAsync((int)lastDisputeFee.PayorId);

            if (string.IsNullOrEmpty(payor.FirstName) || string.IsNullOrEmpty(payor.LastName))
            {
                if (TagDictionary.TagIsExists(htmlBody, TagDictionary.GetTag(Tag.PayorName)))
                {
                    throw new TagValueMissingException("Tag Value is Missing", dispute.DisputeGuid, AssignedTemplateId, new string[] { TagDictionary.GetTag(Tag.PayorName) });
                }
            }

            if (lastDisputeFee == null || !lastDisputeFee.DatePaid.HasValue)
            {
                if (TagDictionary.TagIsExists(htmlBody, TagDictionary.GetTag(Tag.PaymentDate)))
                {
                    throw new TagValueMissingException("Tag Value is Missing", dispute.DisputeGuid, AssignedTemplateId, new string[] { TagDictionary.GetTag(Tag.PaymentDate) });
                }
            }

            if (lastDisputeFee == null || !lastDisputeFee.AmountPaid.HasValue)
            {
                if (TagDictionary.TagIsExists(htmlBody, TagDictionary.GetTag(Tag.PaymentAmount)))
                {
                    throw new TagValueMissingException("Tag Value is Missing", dispute.DisputeGuid, AssignedTemplateId, new string[] { TagDictionary.GetTag(Tag.PaymentAmount) });
                }
            }

            htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.PayorName), payor.FirstName + " " + payor.LastName);
            htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.PaymentDate), lastDisputeFee.DatePaid.ToPstDateTime());

            htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.PaymentAmount), "$ " + lastDisputeFee.AmountPaid);

            if (lastDisputeFee.FeeType.HasValue)
            {
                var feeType = (DisputeFeeType)lastDisputeFee.FeeType.Value;
                var feeTypeText = feeType switch
                {
                    DisputeFeeType.Intake => "Application for Dispute Resolution",
                    DisputeFeeType.LandlordIntake => "Application",
                    DisputeFeeType.ReviewRequest => "Application for Review Request",
                    DisputeFeeType.Other => "Special or Other Application",
                    _ => throw new ArgumentOutOfRangeException()
                };

                htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.PaymentTitle), feeTypeText);
            }
            else
            {
                if (TagDictionary.TagIsExists(htmlBody, TagDictionary.GetTag(Tag.PaymentTitle)))
                {
                    throw new TagValueMissingException("Tag Value is Missing", dispute.DisputeGuid, AssignedTemplateId, new string[] { TagDictionary.GetTag(Tag.PaymentTitle) });
                }
            }

            htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.PaymentId), lastDisputeFee.DisputeFeeId.ToString());

            var methodPaid = (PaymentMethod?)lastDisputeFee.MethodPaid;

            if (methodPaid.HasValue)
            {
                htmlBody = methodPaid switch
                {
                    PaymentMethod.Online => htmlBody.Replace(TagDictionary.GetTag(Tag.PaymentMethod), "Online"),
                    PaymentMethod.Office => htmlBody.Replace(TagDictionary.GetTag(Tag.PaymentMethod), "Office"),
                    PaymentMethod.FeeWaiver => htmlBody.Replace(TagDictionary.GetTag(Tag.PaymentMethod), "Fee Waiver"),
                    _ => htmlBody
                };
            }
            else
            {
                if (TagDictionary.TagIsExists(htmlBody, TagDictionary.GetTag(Tag.PaymentMethod)))
                {
                    throw new TagValueMissingException("Tag Value is Missing", dispute.DisputeGuid, AssignedTemplateId, new string[] { TagDictionary.GetTag(Tag.PaymentMethod) });
                }
            }
        }
        else
        {
            if (TagDictionary.TagIsExists(htmlBody, TagDictionary.GetTag(Tag.PayorName)))
            {
                throw new TagValueMissingException("Tag Value is Missing", dispute.DisputeGuid, AssignedTemplateId, new string[] { TagDictionary.GetTag(Tag.PayorName) });
            }
        }

        return await base.Handle(htmlBody, dispute, participant);
    }
}