using System;
using System.Collections.Generic;
using System.Data.Common;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Common.Utilities;
using CM.ServiceBase;
using CM.ServiceBase.ApiKey;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Entities;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Models;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Services;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Services.AdHocDlReport;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Services.AdHocReport;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using static System.Net.Mime.MediaTypeNames;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Controllers;

/// <summary>
/// [ApiKey]
/// </summary>
[Produces(Application.Json)]
[Route("adhocreport")]
public class AdHocReportController : BaseController
{
    private readonly AdHocReportContext _context;
    private readonly IMapper _mapper;
    private readonly IAdHocReportService _adHocReportService;
    private readonly IAdHocDlReportService _adHocDlReportService;
    private readonly IScheduledAdHocReport _scheduledAdHocReport;

    public AdHocReportController(
        AdHocReportContext context,
        IMapper mapper,
        IAdHocReportService adHocReportService,
        IAdHocDlReportService adHocDlReportService,
        IScheduledAdHocReport scheduledAdHocReport)
    {
        _context = context;
        _mapper = mapper;
        _adHocReportService = adHocReportService;
        _adHocDlReportService = adHocDlReportService;
        _scheduledAdHocReport = scheduledAdHocReport;
    }

    [HttpPost("downloadreport")]
    public async Task<IActionResult> PostAdHocDlReport([FromBody] AdHocDlReportRequest adHocDlReportRequest)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (adHocDlReportRequest.ExcelTemplateExists.HasValue && adHocDlReportRequest.ExcelTemplateExists.Value)
        {
            if (!adHocDlReportRequest.ExcelTemplateId.HasValue)
            {
                return BadRequest(ApiReturnMessages.ExcelTemplateIdRequired);
            }

            var template = await _adHocDlReportService.ExcelTemplateExists(adHocDlReportRequest.ExcelTemplateId.Value);

            if (!template)
            {
                return BadRequest(ApiReturnMessages.InvalidExcelTemplateId);
            }
        }

        var newAdHocDlReport = await _adHocDlReportService.CreateAsync(adHocDlReportRequest);
        return Ok(newAdHocDlReport);
    }

    [HttpPatch("downloadreport/{adHocDlReportId:long}")]
    public async Task<IActionResult> PatchAdHocDlReport(long adHocDlReportId,
        [FromBody] JsonPatchDocumentExtension<AdHocDlReportRequest> adHocDlReportRequest)
    {
        if (CheckModified(_adHocDlReportService, adHocDlReportId))
        {
            return StatusConflicted();
        }

        var originalAdHocDlReport = await _adHocDlReportService.GetNoTrackingAdHocDlReportAsync(adHocDlReportId);

        if (originalAdHocDlReport != null)
        {
            var adHocDlReportToPatch = _mapper.Map<AdHocDlReport, AdHocDlReportRequest>(originalAdHocDlReport);
            adHocDlReportRequest.ApplyTo(adHocDlReportToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var excelTemplateExists = adHocDlReportRequest.GetValue<bool>("/excel_template_exists");
            var excelTemplateId = adHocDlReportRequest.GetValue<int?>("/excel_template_id");

            if (excelTemplateExists.Exists && excelTemplateExists.Value)
            {
                if (!excelTemplateId.Exists)
                {
                    return BadRequest(ApiReturnMessages.ExcelTemplateIdRequired);
                }

                var templateExists = await _adHocDlReportService.ExcelTemplateExists(excelTemplateId.Value.Value);

                if (!templateExists)
                {
                    return BadRequest(ApiReturnMessages.InvalidExcelTemplateId);
                }
            }

            _mapper.Map(adHocDlReportToPatch, originalAdHocDlReport);

            var result = await _adHocDlReportService.PatchAsync(originalAdHocDlReport);

            if (result != null)
            {
                return Ok(_mapper.Map<AdHocDlReport, AdHocDlReportResponse>(result));
            }
        }

        return NotFound();
    }

    [HttpDelete("downloadreport/{adHocDlReportId:int}")]
    public async Task<IActionResult> DeleteDlReport(int adHocDlReportId)
    {
        if (CheckModified(_adHocDlReportService, adHocDlReportId))
        {
            return StatusConflicted();
        }

        var result = await _adHocDlReportService.DeleteAsync(adHocDlReportId);

        if (result)
        {
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpGet("downloadreport/{adHocDlReportId:int}")]
    public async Task<IActionResult> GetAdHocDlReport(int adHocDlReportId)
    {
        var adHocDlReport = await _adHocDlReportService.GetAdHocDlReportAsync(adHocDlReportId);

        if (adHocDlReport != null)
        {
            return Ok(adHocDlReport);
        }

        return NotFound();
    }

    [HttpGet("downloadreports")]
    public async Task<IActionResult> GetAdHocDlReports(int count, int index, AdHocGetFilter filter)
    {
        var adHocDlReports = await _adHocDlReportService.GetAdHocDlReports(count, index, filter);

        if (adHocDlReports != null)
        {
            return Ok(adHocDlReports);
        }

        return NotFound();
    }

    [HttpPost("reportemail")]
    public async Task<IActionResult> PostAdHocReportEmail([FromBody] AdHocReportEmailRequest adHocReportEmailRequest)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var newAdHocDlReport = await _adHocReportService.CreateAsync(adHocReportEmailRequest);
        return Ok(newAdHocDlReport);
    }

    [HttpPatch("reportemail/{adHocReportId:int}")]
    public async Task<IActionResult> PatchAdHocReportEmail(long adHocReportId,
        [FromBody] JsonPatchDocumentExtension<AdHocReportEmailPatchRequest> adHocReportEmailRequest)
    {
        if (CheckModified(_adHocDlReportService, adHocReportId))
        {
            return StatusConflicted();
        }

        var originalAdHocReport = await _adHocReportService.GetNoTrackingAdHocReportAsync(adHocReportId);

        if (originalAdHocReport != null)
        {
            var isActive = adHocReportEmailRequest.GetValue<bool>("/is_active");

            if (isActive.Exists && isActive.Value)
            {
                if (originalAdHocReport.AdHocReportAttachments == null ||
                    !originalAdHocReport.AdHocReportAttachments.FirstOrDefault().IsActive)
                {
                    return BadRequest(ApiReturnMessages.ValidationForSetIsActive);
                }
            }

            var adHocReportToPatch = _mapper.Map<AdHocReport, AdHocReportEmailPatchRequest>(originalAdHocReport);
            adHocReportEmailRequest.ApplyTo(adHocReportToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var excelTemplateExists = adHocReportEmailRequest.GetValue<bool>("/excel_template_exists");
            var excelTemplateId = adHocReportEmailRequest.GetValue<int?>("/excel_template_id");

            if (excelTemplateExists.Exists && excelTemplateExists.Value)
            {
                if (!excelTemplateId.Exists)
                {
                    return BadRequest(ApiReturnMessages.ExcelTemplateIdRequired);
                }

                var templateExists = await _adHocDlReportService.ExcelTemplateExists(excelTemplateId.Value.Value);

                if (!templateExists)
                {
                    return BadRequest(ApiReturnMessages.InvalidExcelTemplateId);
                }
            }

            _mapper.Map(adHocReportToPatch, originalAdHocReport);

            var result = await _adHocReportService.PatchAsync(originalAdHocReport);

            if (result != null)
            {
                return Ok(_mapper.Map<AdHocReport, AdHocDlReportResponse>(result));
            }
        }

        return NotFound();
    }

    [HttpDelete("reportemail/{adHocReportId:int}")]
    public async Task<IActionResult> DeleteReport(int adHocReportId)
    {
        if (CheckModified(_adHocReportService, adHocReportId))
        {
            return StatusConflicted();
        }

        var adHocReport = await _adHocReportService.GetNoTrackingAdHocReportAsync(adHocReportId);

        if (adHocReport.AdHocReportAttachments.Any())
        {
            return Ok(ApiReturnMessages.AdHocReportAttachmentsExists);
        }

        var result = await _adHocReportService.DeleteAsync(adHocReportId);

        if (result)
        {
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpPost("reportemailattachment/{adHocReportId:int}")]
    public async Task<IActionResult> PostAdHocReportAttachment(int adHocReportId,
        [FromBody] AdHocReportAttachmentRequest adHocReportAttachmentRequest)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (adHocReportAttachmentRequest.ExcelTemplateExists.HasValue && adHocReportAttachmentRequest.ExcelTemplateExists.Value)
        {
            if (!adHocReportAttachmentRequest.ExcelTemplateId.HasValue)
            {
                return BadRequest(ApiReturnMessages.ExcelTemplateIdRequired);
            }

            var template = await _adHocDlReportService.ExcelTemplateExists(adHocReportAttachmentRequest.ExcelTemplateId.Value);

            if (!template)
            {
                return BadRequest(ApiReturnMessages.InvalidExcelTemplateId);
            }
        }

        var newAdHocAttachment = await _adHocReportService.CreateAttachmentAsync(adHocReportId, adHocReportAttachmentRequest);
        return Ok(newAdHocAttachment);
    }

    [HttpPatch("reportemailattachment/{adHocReportAttachmentId:int}")]
    public async Task<IActionResult> PatchAdHocReportAttachment(long adHocReportAttachmentId,
        [FromBody] JsonPatchDocumentExtension<AdHocReportAttachmentPatchRequest> adHocReportAttachmentRequest)
    {
        if (CheckModified(_adHocReportService, adHocReportAttachmentId))
        {
            return StatusConflicted();
        }

        var originalAdHocReportAttachment =
            await _adHocReportService.GetNoTrackingAdHocReportAttachmentAsync(adHocReportAttachmentId);

        if (originalAdHocReportAttachment != null)
        {
            var excelTemplateExists = adHocReportAttachmentRequest.GetValue<bool>("/excel_template_exists");
            var excelTemplateId = adHocReportAttachmentRequest.GetValue<int?>("/excel_template_id");

            if (excelTemplateExists.Exists && excelTemplateExists.Value)
            {
                if (!excelTemplateId.Exists && !originalAdHocReportAttachment.ExcelTemplateId.HasValue)
                {
                    return BadRequest(ApiReturnMessages.ExcelTemplateIdRequired);
                }

                var templateId = excelTemplateId.Exists ? excelTemplateId.Value : originalAdHocReportAttachment.ExcelTemplateId;

                var templateExists = await _adHocDlReportService.ExcelTemplateExists(templateId.Value);

                if (!templateExists)
                {
                    return BadRequest(ApiReturnMessages.InvalidExcelTemplateId);
                }
            }

            var adHocReportAttachmentToPatch =
                _mapper.Map<AdHocReportAttachment, AdHocReportAttachmentPatchRequest>(originalAdHocReportAttachment);

            adHocReportAttachmentRequest.ApplyTo(adHocReportAttachmentToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _mapper.Map(adHocReportAttachmentToPatch, originalAdHocReportAttachment);

            var result = await _adHocReportService.PatchAttachmentAsync(originalAdHocReportAttachment);

            if (result != null)
            {
                return Ok(_mapper.Map<AdHocReportAttachment, AdHocReportAttachmentResponse>(result));
            }
        }

        return NotFound();
    }

    [HttpDelete("reportemailattachment/{adHocReportAttachmentId:int}")]
    public async Task<IActionResult> DeleteAttachmentReport(int adHocReportAttachmentId)
    {
        if (CheckModified(_adHocReportService, adHocReportAttachmentId))
        {
            return StatusConflicted();
        }

        var isLastAttachment = await _adHocReportService.IsLastAttachment(adHocReportAttachmentId);

        if (!isLastAttachment.HasValue)
        {
            return NotFound();
        }

        if (isLastAttachment.Value)
        {
            return Ok(ApiReturnMessages.LastAttachmentDelete);
        }

        var result = await _adHocReportService.DeleteAsync(adHocReportAttachmentId);

        if (result)
        {
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpGet("reportemail/{adHocReportId:int}")]
    public async Task<IActionResult> GetAdHocReport(int adHocReportId)
    {
        var adHocReport = await _adHocReportService.GetAdHocReportAsync(adHocReportId);

        if (adHocReport != null)
        {
            return Ok(adHocReport);
        }

        return NotFound();
    }

    [HttpGet("reportemails/")]
    public async Task<IActionResult> GetAdHocReports([FromQuery] AdHocReportGetFilter filter)
    {
        var adHocReports = await _adHocReportService.GetAdHocReports(filter);

        if (adHocReports != null)
        {
            return Ok(adHocReports);
        }

        return NotFound();
    }

    [HttpGet]
    public async Task<IActionResult> GetList()
    {
        var reports = await _context.AdHocDlReports
            .Where(x => x.IsActive)
            .ToListAsync();

        return Ok(_mapper.Map<List<AdHocDlReportResponse>>(reports));
    }

    [HttpPost("{adHocDlReportId:int}")]
    public async Task<IActionResult> Get([FromRoute] int adHocDlReportId, [FromBody] AdHocReportRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var report = await _scheduledAdHocReport.GetById(adHocDlReportId);

        if (report == null)
        {
            return BadRequest("The provided adHocDlReportId is not a valid active ID");
        }

        var contentDispositionName = request.ContentDispositionType switch
        {
            ContentDispositionType.Attachment => ContentDisposition.Attachment,
            ContentDispositionType.Inline => ContentDisposition.Inline,
            _ => throw new ArgumentOutOfRangeException()
        };

        var contentDisposition = new ContentDispositionHeaderValue(contentDispositionName);
        var reportName = _scheduledAdHocReport.GetAdHocReportName(report);

        if (request.UseExcelTemplate)
        {
            if (!report.ExcelTemplateId.HasValue)
            {
                return BadRequest("This report is not associated to an excel template in the common files");
            }

            var templateFileResponse = await _scheduledAdHocReport.GetTemplateFile(report);

            if (templateFileResponse is not { FileType: (byte)FileType.ExcelDlReport })
            {
                return BadRequest("This report is not associated to an excel template in the common files");
            }

            reportName = Path.ChangeExtension(reportName, "xlsx");
        }

        contentDisposition.SetHttpFileName(reportName);

        byte[] binaryData;
        try
        {
            binaryData = await _scheduledAdHocReport.GetAdHocReportBytes(report, request, request.Parameters);
        }
        catch (DbException e)
        {
            return BadRequest("Parameter or query error: " + e.Message);
        }

        Response.Headers[HeaderNames.ContentDisposition] = contentDisposition.ToString();

        var result = new FileContentResult(binaryData, FileMimeTypes.Excel);

        return result;
    }
}