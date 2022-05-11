using System.Net;
using System.Threading.Tasks;
using CM.Business.Entities.Models.EmailTemplate;
using CM.Business.Services.EmailTemplate;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Route("api/emailtemplate")]
[Produces(Application.Json)]
public class EmailTemplateController : BaseController
{
    private readonly IEmailTemplateService _emailTemplateService;

    public EmailTemplateController(IEmailTemplateService emailTemplateService)
    {
        _emailTemplateService = emailTemplateService;
    }

    [HttpPost]
    [AuthorizationRequired(new[] { RoleNames.ExtendedAdmin })]
    public async Task<IActionResult> Post([FromBody]EmailTemplateRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var isAssignedTemplateIdExists = await _emailTemplateService.IsUniqueAssignedTemplateId(request.AssignedTemplateId);

        if (isAssignedTemplateIdExists)
        {
            return BadRequest(ApiReturnMessages.AssignedTemplateIdNonUnique);
        }

        var decodedBody = WebUtility.HtmlDecode(request.TemplateHtml);
        request.TemplateHtml = decodedBody;

        var result = await _emailTemplateService.CreateAsync(request);
        EntityIdSetContext(result.EmailTemplateId);
        return Ok(result);
    }

    [HttpDelete("{emailTemplateId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.ExtendedAdmin })]
    public async Task<IActionResult> Delete(int emailTemplateId)
    {
        if (CheckModified(_emailTemplateService, emailTemplateId))
        {
            return StatusConflicted();
        }

        var result = await _emailTemplateService.DeleteAsync(emailTemplateId);
        if (result)
        {
            EntityIdSetContext(emailTemplateId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpPatch("{emailTemplateId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.ExtendedAdmin })]
    public async Task<IActionResult> Patch(int emailTemplateId, [FromBody]JsonPatchDocumentExtension<EmailTemplateRequest> emailTemplate)
    {
        if (CheckModified(_emailTemplateService, emailTemplateId))
        {
            return StatusConflicted();
        }

        var emailTemplateToPatch = await _emailTemplateService.GetForPatchAsync(emailTemplateId);
        if (emailTemplateToPatch != null)
        {
            emailTemplate.ApplyTo(emailTemplateToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var templateHtml = emailTemplate.GetValue<string>("/template_html");
            if (templateHtml.Exists)
            {
                var decodedBody = WebUtility.HtmlDecode(templateHtml.Value);
                emailTemplateToPatch.TemplateHtml = decodedBody;
            }

            var assignedTemplateId = emailTemplate.GetValue<int>("/assigned_template_id");
            if (assignedTemplateId.Exists)
            {
                var isAssignedTemplateIdExists = await _emailTemplateService.IsUniqueAssignedTemplateId((AssignedTemplate)assignedTemplateId.Value);

                if (isAssignedTemplateIdExists)
                {
                    return BadRequest(ApiReturnMessages.AssignedTemplateIdNonUnique);
                }
            }

            var result = await _emailTemplateService.PatchAsync(emailTemplateId, emailTemplateToPatch);

            if (result != null)
            {
                EntityIdSetContext(emailTemplateId);
                return Ok(result);
            }
        }

        return NotFound();
    }

    [HttpGet("{emailTemplateId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> GetById(int emailTemplateId)
    {
        var emailTemplate = await _emailTemplateService.GetByIdAsync(emailTemplateId);

        if (emailTemplate != null)
        {
            return Ok(emailTemplate);
        }

        return NotFound();
    }

    [HttpGet]
    [Route("/api/emailtemplates")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> GetAll()
    {
        var emailTemplates = await _emailTemplateService.GetAllAsync();
        return Ok(emailTemplates);
    }
}