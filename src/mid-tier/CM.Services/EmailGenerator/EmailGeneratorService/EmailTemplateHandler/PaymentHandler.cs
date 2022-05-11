using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Services.EmailGenerator.EmailGeneratorService.Tags;

namespace CM.Services.EmailGenerator.EmailGeneratorService.EmailTemplateHandler;

public class PaymentHandler : AbstractEmailMessageHandler
{
    public PaymentHandler(IUnitOfWork unitOfWork)
        : base(unitOfWork)
    {
    }

    public override async Task<StringBuilder> Handle(StringBuilder htmlBody, Dispute dispute, Participant participant)
    {
        var disputeFees = await UnitOfWork.DisputeFeeRepository.GetByDisputeGuid(dispute.DisputeGuid);
        var lastDisputeFee = disputeFees.LastOrDefault();
        if (lastDisputeFee?.PayorId != null)
        {
            var payor = await UnitOfWork.ParticipantRepository.GetByIdAsync((int)lastDisputeFee.PayorId);

            htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.PayorName), payor.FirstName + " " + payor.LastName);
            htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.PaymentDate), lastDisputeFee.DatePaid.ToPstDateTime());

            htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.PaymentAmount), "$ " + lastDisputeFee.AmountPaid);

            if (lastDisputeFee.FeeType.HasValue)
            {
                var feeType = (DisputeFeeType)lastDisputeFee.FeeType.Value;
                var feeTypeText = feeType switch
                {
                    DisputeFeeType.Intake => "Application for Dispute Resolution",
                    DisputeFeeType.LandlordIntake => "Application for Rent Increase",
                    DisputeFeeType.ReviewRequest => "Application for Review Request",
                    DisputeFeeType.Other => "Special or Other Application",
                    _ => throw new ArgumentOutOfRangeException()
                };

                htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.PaymentTitle), feeTypeText);
            }

            htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.PaymentId), lastDisputeFee.DisputeFeeId.ToString());

            var methodPaid = (PaymentMethod?)lastDisputeFee.MethodPaid;

            htmlBody = methodPaid switch
            {
                PaymentMethod.Online => htmlBody.Replace(TagDictionary.GetTag(Tag.PaymentMethod), "Online"),
                PaymentMethod.Office => htmlBody.Replace(TagDictionary.GetTag(Tag.PaymentMethod), "Office"),
                PaymentMethod.FeeWaiver => htmlBody.Replace(TagDictionary.GetTag(Tag.PaymentMethod), "Fee Waiver"),
                _ => htmlBody
            };
        }

        return await base.Handle(htmlBody, dispute, participant);
    }
}