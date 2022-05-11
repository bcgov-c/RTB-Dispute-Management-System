using System.Threading.Tasks;
using CM.Business.Entities.Models.BulkEmailRecipient;
using CM.Business.Services.BulkEmailRecipient;
using CM.Business.Services.EmailTemplate;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
public class BulkEmailRecipientController : BaseController
{
    private readonly IBulkEmailRecipientService _bulkEmailRecipientService;
    private readonly IEmailTemplateService _emailTemplateService;

    public BulkEmailRecipientController(IBulkEmailRecipientService bulkEmailRecipientService, IEmailTemplateService emailTemplateService)
    {
        _bulkEmailRecipientService = bulkEmailRecipientService;
        _emailTemplateService = emailTemplateService;
    }

    [HttpPost("api/bulkemailmessages")]
    [AuthorizationRequired(new[] { RoleNames.ExtendedAdmin })]
    public async Task<IActionResult> Post([FromBody]BulkEmailRecipientRequest bulkEmailMessage)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var isBulkEmailBatchIdExist = await _bulkEmailRecipientService.IsBulkEmailBatchIdExist(bulkEmailMessage.BulkEmailBatchId);

        if (!isBulkEmailBatchIdExist)
        {
            return BadRequest(ApiReturnMessages.InvalidEmailRecipientBatchId);
        }

        var isEmailTemplateExist = await _emailTemplateService.IsEmailTemplateExist(bulkEmailMessage.EmailTemplateId);

        if (!isEmailTemplateExist)
        {
            return BadRequest(ApiReturnMessages.InvalidEmailTemplateId);
        }

        var res = await _bulkEmailRecipientService.CreateAsync(bulkEmailMessage);
        return Ok(res);
    }
}