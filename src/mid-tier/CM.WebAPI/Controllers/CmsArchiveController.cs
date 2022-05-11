using System;
using System.IO;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.CmsArchive;
using CM.Business.Services.CmsArchive;
using CM.Business.Services.SystemSettingsService;
using CM.Business.Services.TokenServices;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.FileSystem.Service;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api")]
public class CmsArchiveController : BaseController
{
    private readonly ICmsArchiveService _cmsArchiveService;
    private readonly IMapper _mapper;
    private readonly ISystemSettingsService _systemSettingsService;
    private readonly ITokenService _tokenService;

    public CmsArchiveController(ICmsArchiveService cmsArchiveService, ITokenService tokenService, IMapper mapper, ISystemSettingsService systemSettingsService)
    {
        _cmsArchiveService = cmsArchiveService;
        _tokenService = tokenService;
        _mapper = mapper;
        _systemSettingsService = systemSettingsService;
    }

    [HttpGet("cmsarchive")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> GetDispute(int count, int index, CmsArchiveSearchRequest request)
    {
        var result = new CmsArchiveSearchResponse();

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var commonFilters = new CmsArchiveSearchBase
        {
            CreatedDateGreaterThan = request.CreatedDateGreaterThan,
            CreatedDateLessThan = request.CreatedDateLessThan,
            DisputeStatusEquals = request.DisputeStatusEquals,
            LastModifiedDateGreaterThan = request.LastModifiedDateGreaterThan,
            LastModifiedDateLessThan = request.LastModifiedDateLessThan,
            SubmittedDateGreaterThan = request.SubmittedDateGreaterThan,
            SubmittedDateLessThan = request.SubmittedDateLessThan
        };

        switch (request.SearchType)
        {
            case 1:
                if (string.IsNullOrEmpty(request.File_Number))
                {
                    return BadRequest(ApiReturnMessages.CmsArchiveSearchType1);
                }

                result = await _cmsArchiveService.SearchByFileNumber(request.File_Number, commonFilters);
                break;
            case 2:
                if (string.IsNullOrEmpty(request.Reference_Number))
                {
                    return BadRequest(ApiReturnMessages.CmsArchiveSearchType2);
                }

                result = await _cmsArchiveService.SearchByReferenceNumber(request.Reference_Number, commonFilters);
                break;
            case 3:
                if (string.IsNullOrEmpty(request.Dispute_Address) && string.IsNullOrEmpty(request.Dispute_City))
                {
                    return BadRequest(ApiReturnMessages.CmsArchiveSearchType3);
                }

                result = await _cmsArchiveService.SearchByDispute(request.Dispute_Address, request.Dispute_City, request.Applicant_Type, commonFilters, count, index);
                break;
            case 4:
                if (string.IsNullOrEmpty(request.First_Name) && string.IsNullOrEmpty(request.Last_Name) && string.IsNullOrEmpty(request.DayTime_Phone) && string.IsNullOrEmpty(request.Email_Address))
                {
                    return BadRequest(ApiReturnMessages.CmsArchiveSearchType4);
                }

                result = await _cmsArchiveService.SearchByParticipant(request.First_Name, request.Last_Name, request.DayTime_Phone, request.Email_Address, request.Participant_Type, commonFilters, count, index);
                break;
        }

        return Ok(result);
    }

    [HttpGet("cmsarchive/cmsrecord/{fileNumber}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> GetRecord(string fileNumber)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var fileNumberExist = await _cmsArchiveService.IsFileNumberExist(fileNumber);
        if (!fileNumberExist)
        {
            return BadRequest(ApiReturnMessages.FileNumberNotExist);
        }

        var result = await _cmsArchiveService.GetCmsRecords(fileNumber);
        return Ok(result);
    }

    [HttpPost("cmsarchive/cmsrecordnote/{fileNumber}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> PostRecordNote(string fileNumber, CmsArchiveNoteRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var fileNumberExist = await _cmsArchiveService.IsFileNumberExist(fileNumber);
        if (!fileNumberExist)
        {
            return BadRequest(ApiReturnMessages.FileNumberNotExist);
        }

        var response = await _cmsArchiveService.PostCmsArchiveNoteAsync(fileNumber, request);
        EntityIdSetContext(response.CMS_Note_ID);
        return Ok(response);
    }

    [HttpGet]
    [Route("cmsarchive/file/{fileGuid:Guid}/{filename:maxlength(255)}", Name = "GetCmsFile")]
    public async Task<IActionResult> Get(Guid fileGuid, [FromQuery] string token, [FromQuery] bool? isInline = null)
    {
        if (token.IsBase64String() == false)
        {
            return BadRequest(string.Format(ApiReturnMessages.WrongToken));
        }

        var tokenWithFileId = token.Base64Decode().Split(":", StringSplitOptions.RemoveEmptyEntries);

        if (tokenWithFileId.Length != 2)
        {
            return Unauthorized();
        }

        var fileToken = tokenWithFileId[0];
        var fileId = tokenWithFileId[1];

        var isValidToken = await _tokenService.ValidateAndRefreshToken(fileToken);

        if (isValidToken == false)
        {
            return Unauthorized();
        }

        var file = await _cmsArchiveService.GetFileAsync(fileGuid);

        if (file != null)
        {
            if (file.ETL_File_ID.ToString() != fileId)
            {
                return Unauthorized();
            }

            var contentDispositionType = isInline ?? false ? ContentDisposition.Inline : ContentDisposition.Attachment;
            var contentDisposition = new ContentDispositionHeaderValue(contentDispositionType);
            contentDisposition.SetHttpFileName(file.File_Name);
            Response.Headers[HeaderNames.ContentDisposition] = contentDisposition.ToString();

            var fileContext = new FileContext(new CmsStorageStrategy(_systemSettingsService));
            var filePath = Path.Combine(file.File_Path, file.File_Name);
            return await fileContext.GetFileStreamResult(filePath);
        }

        return NotFound();
    }

    [HttpPatch("cmsarchive/cmsrecord/{fileNumber}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Patch(string fileNumber, [FromBody]JsonPatchDocumentExtension<CmsRecordRequest> request)
    {
        if (CheckModified(_cmsArchiveService, fileNumber))
        {
            return StatusConflicted();
        }

        var dmsFileNumber = request.GetValue<int>("/dms_file_number");
        var dmsFileGuid = request.GetValue<string>("/dms_file_guid");

        var fileNumberExist = await _cmsArchiveService.IsFileNumberExist(fileNumber);
        if (!fileNumberExist)
        {
            return BadRequest(ApiReturnMessages.FileNumberNotExist);
        }

        var originalRecords = await _cmsArchiveService.GetNoTrackingRecords(fileNumber);
        foreach (var originalRecord in originalRecords)
        {
            if (originalRecord != null)
            {
                var recordToPatch = _mapper.Map<DataModel, CmsRecordRequest>(originalRecord);
                recordToPatch.DMS_File_Number = dmsFileNumber.Exists ? null : dmsFileNumber.Value;
                if (dmsFileNumber.Exists && dmsFileGuid.Exists)
                {
                    recordToPatch.DMS_File_Guid = dmsFileGuid.Value != null ? dmsFileGuid.ChangeType<Guid>() : Guid.Empty;
                }

                request.ApplyTo(recordToPatch);

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                _mapper.Map(recordToPatch, originalRecord);
                await _cmsArchiveService.PatchAsync(originalRecord);
                EntityIdSetContext(originalRecord.ETL_DataRow_ID);
            }
        }

        var fullResponse = await _cmsArchiveService.GetCmsRecords(fileNumber);
        return Ok(fullResponse);
    }
}