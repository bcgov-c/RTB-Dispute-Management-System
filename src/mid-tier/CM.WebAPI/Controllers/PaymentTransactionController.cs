using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Payment;
using CM.Business.Services.Parties;
using CM.Business.Services.Payment;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/paytransaction")]
public class PaymentTransactionController : BaseController
{
    private readonly IDisputeFeeService _disputeFeeService;
    private readonly IMapper _mapper;
    private readonly IParticipantService _participantService;
    private readonly IPaymentTransactionService _paymentTransactionService;

    public PaymentTransactionController(IPaymentTransactionService paymentTransactionService, IParticipantService participantService, IDisputeFeeService disputeFeeService, IMapper mapper)
    {
        _paymentTransactionService = paymentTransactionService;
        _participantService = participantService;
        _disputeFeeService = disputeFeeService;
        _mapper = mapper;
    }

    [HttpPost("{disputeFeeId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Post(int disputeFeeId, [FromBody]PaymentTransactionPostRequest paymentTransaction)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var disputeFeeExists = await _disputeFeeService.DisputeFeeExists(disputeFeeId);
        if (!disputeFeeExists)
        {
            return BadRequest(string.Format(ApiReturnMessages.DisputeFeeDoesNotExist, disputeFeeId));
        }

        if (paymentTransaction.TransactionMethod == (byte)PaymentMethod.Online)
        {
            if (paymentTransaction.TransactionSiteSource == null)
            {
                return BadRequest(ApiReturnMessages.TransactionSiteSourceIsRequired);
            }
        }

        if (paymentTransaction.TransactionBy != null)
        {
            var participantExists = await _participantService.ParticipantExists(paymentTransaction.TransactionBy);
            if (!participantExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, paymentTransaction.TransactionBy));
            }
        }

        await DisputeResolveAndSetContext(_disputeFeeService, disputeFeeId);
        var newPaymentTransaction = await _paymentTransactionService.CreateAsync(disputeFeeId, paymentTransaction);
        EntityIdSetContext(newPaymentTransaction.PaymentTransactionId);
        return Ok(newPaymentTransaction);
    }

    [HttpPatch("{transactionId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Patch(int transactionId, [FromBody]JsonPatchDocumentExtension<PaymentTransactionPatchRequest> paymentTransaction)
    {
        if (CheckModified(_paymentTransactionService, transactionId))
        {
            return StatusConflicted();
        }

        var originalTransaction = await _paymentTransactionService.GetNoTrackingPaymentTransactionAsync(transactionId);
        if (originalTransaction != null)
        {
            var transactionToPatch = _mapper.Map<PaymentTransaction, PaymentTransactionPatchRequest>(originalTransaction);
            paymentTransaction.ApplyTo(transactionToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            const bool offlineChecking = false;

            var participantId = paymentTransaction.GetValue<int>("/transaction_by");
            if (participantId.Exists && !await _participantService.ParticipantExists(participantId.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, participantId.Value));
            }

            await DisputeResolveAndSetContext(_paymentTransactionService, transactionId);
            _mapper.Map(transactionToPatch, originalTransaction);
            var result = await _paymentTransactionService.PatchAsync(originalTransaction, transactionId, offlineChecking);

            if (result != null)
            {
                EntityIdSetContext(transactionId);
                return Ok(_mapper.Map<PaymentTransaction, PaymentTransactionResponse>(result));
            }
        }

        return NotFound();
    }

    [HttpDelete("{transactionId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited })]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Delete(int transactionId)
    {
        if (CheckModified(_paymentTransactionService, transactionId))
        {
            return StatusConflicted();
        }

        await DisputeResolveAndSetContext(_paymentTransactionService, transactionId);
        var result = await _paymentTransactionService.DeleteAsync(transactionId);
        if (result)
        {
            EntityIdSetContext(transactionId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpPost("/api/checkbamboratransactions/{transactionId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode })]
    public async Task<IActionResult> CheckBamboraTransactionByTrnId(int transactionId)
    {
        var paymentTransaction =
            await _paymentTransactionService.GetByIdAsync(transactionId);

        if (paymentTransaction != null)
        {
            if (paymentTransaction.TransactionMethod != (byte)PaymentMethod.Online)
            {
                return BadRequest(string.Format(ApiReturnMessages.PaymentIsNotOnline, transactionId));
            }

            if (!PaymentIsAlreadyVerified(paymentTransaction))
            {
                var response =
                    await _paymentTransactionService.CheckBamboraTransactionByTrnId(paymentTransaction, transactionId);
                EntityIdSetContext(response.PaymentTransactionId);
                return Ok(response);
            }
        }
        else
        {
            return BadRequest(string.Format(ApiReturnMessages.InvalidPaymentTransaction, transactionId));
        }

        return NotFound();
    }

    private static bool PaymentIsAlreadyVerified(PaymentTransactionForReport paymentTransaction)
    {
        if (paymentTransaction.TrnApproved && paymentTransaction.PaymentStatus == (byte)PaymentStatus.ApprovedOrPaid &&
            paymentTransaction.TransactionMethod == (byte)PaymentMethod.Online &&
            paymentTransaction.PaymentProvider == (byte)PaymentProvider.Bambora)
        {
            return true;
        }

        return false;
    }
}