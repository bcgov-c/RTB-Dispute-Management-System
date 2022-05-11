using System;
using System.IO;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.ExternalFile;
using CM.Business.Entities.Models.Files;
using CM.Business.Services.ExternalCustomDataObject;
using CM.Business.Services.ExternalFileService;
using CM.Business.Services.SystemSettingsService;
using CM.Business.Services.TokenServices;
using CM.Common.ChunkedFileUpload;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.FileSystem.Service;
using CM.FileSystem.Service.FileHelper;
using CM.Storage;
using CM.Storage.FileSystem;
using CM.WebAPI.Filters;
using CM.WebAPI.Jwt;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/externalfiles")]
public class ExternalFileController : BaseController
{
    private readonly IExternalCustomDataObjectService _externalCustomDataObjectService;
    private readonly IExternalFileService _externalFileService;

    private readonly IJwtUtils _jwtUtils;

    private readonly IMapper _mapper;

    private readonly IStorage _storage;

    private readonly ISystemSettingsService _systemSettingsService;

    private readonly ITokenService _tokenService;

    public ExternalFileController(
        IMapper mapper,
        IExternalFileService externalFileService,
        IStorage storage,
        IExternalCustomDataObjectService externalCustomDataObjectService,
        ISystemSettingsService systemSettingsService,
        IOptions<JwtSettings> appSettings,
        ITokenService tokenService)
    {
        _externalFileService = externalFileService;
        _externalCustomDataObjectService = externalCustomDataObjectService;
        _systemSettingsService = systemSettingsService;
        _tokenService = tokenService;
        _mapper = mapper;
        _storage = storage;
        _jwtUtils = new JwtUtils(appSettings);
    }

    [HttpPost("{externalCustomDataObjectId:int}", Name = "ExternalPostFileChunked")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Post(int externalCustomDataObjectId, UploadFileRequest uploadFileRequest)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var fileContext = FileContextFactory.GetExternalStorageFromFileStorageType(StorageType.File, _systemSettingsService);
        var file = await fileContext.StoreAsync(uploadFileRequest);
        if (file == null)
        {
            return Ok(ApiReturnMessages.FileUploadChunkSuccess);
        }

        var newFile = await _externalFileService.CreateAsync(file, externalCustomDataObjectId);

        return Ok(newFile);
    }

    [HttpPost("{externalCustomDataObjectId:int}/externalsession/{sessionToken}", Name = "PostExternalFileToken")]
    public async Task<IActionResult> Post(int externalCustomDataObjectId, UploadFileRequest uploadFileRequest, string sessionToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var sessionGuid = await CanSessionAccessToExternalCustomDataObject(externalCustomDataObjectId, sessionToken);
        if (sessionGuid == null)
        {
            return Unauthorized();
        }

        var fileContext = FileContextFactory.GetExternalStorageFromFileStorageType(StorageType.File, _systemSettingsService);
        var file = await fileContext.StoreAsync(uploadFileRequest);
        if (file == null)
        {
            return Ok(ApiReturnMessages.FileUploadChunkSuccess);
        }

        var newFile = await _externalFileService.CreateAsync(file, externalCustomDataObjectId);
        return Ok(newFile);
    }

    [HttpPatch("{fileId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Patch(int fileId, [FromBody]JsonPatchDocumentExtension<ExternalFilePatchRequest> fileInfo)
    {
        if (CheckModified(_externalFileService, fileId))
        {
            return StatusConflicted();
        }

        var originalFile = await _externalFileService.GetNoTrackingFileAsync(fileId);
        if (originalFile != null)
        {
            var fileToPatch = _mapper.Map<ExternalFile, ExternalFilePatchRequest>(originalFile);
            fileInfo.ApplyTo(fileToPatch);

            await TryUpdateModelAsync(fileToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _mapper.Map(fileToPatch, originalFile);
            originalFile.ExternalFileId = fileId;
            var result = await _externalFileService.PatchFileInfo(originalFile);
            return Ok(result);
        }

        return NotFound();
    }

    [HttpPatch("{fileId:int}/externalsession/{sessionToken}")]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Patch(int fileId, string sessionToken, [FromBody]JsonPatchDocumentExtension<ExternalFilePatchRequest> fileInfo)
    {
        if (CheckModified(_externalFileService, fileId))
        {
            return StatusConflicted();
        }

        var externalCustomDataObject = await _externalFileService.GetNoTrackingFileAsync(fileId);
        var sessionGuid = await CanSessionAccessToExternalCustomDataObject(externalCustomDataObject.ExternalCustomDataObjectId, sessionToken);
        if (sessionGuid == null)
        {
            return Unauthorized();
        }

        var originalFile = await _externalFileService.GetNoTrackingFileAsync(fileId);
        if (originalFile != null)
        {
            var fileToPatch = _mapper.Map<ExternalFile, ExternalFilePatchRequest>(originalFile);
            fileInfo.ApplyTo(fileToPatch);

            await TryUpdateModelAsync(fileToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _mapper.Map(fileToPatch, originalFile);
            originalFile.ExternalFileId = fileId;
            var result = await _externalFileService.PatchFileInfo(originalFile);
            return Ok(result);
        }

        return NotFound();
    }

    [HttpDelete("{externalFileId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Delete(int externalFileId)
    {
        var fileInfo = await _externalFileService.GetAsync(externalFileId);
        if (fileInfo != null)
        {
            var filePath = await _externalFileService.GetFilePath(fileInfo.FilePath);
            System.IO.File.Delete(filePath);

            var result = await _externalFileService.DeleteAsync(externalFileId);
            if (result)
            {
                return Ok(ApiReturnMessages.Deleted);
            }
        }

        return NotFound();
    }

    [HttpDelete("{externalFileId:int}/externalsession/{sessionToken}")]
    public async Task<IActionResult> Delete(int externalFileId, string sessionToken)
    {
        var externalCustomDataObject = await _externalFileService.GetNoTrackingFileAsync(externalFileId);
        var sessionGuid = await CanSessionAccessToExternalCustomDataObject(externalCustomDataObject.ExternalCustomDataObjectId, sessionToken);
        if (sessionGuid == null)
        {
            return Unauthorized();
        }

        var fileInfo = await _externalFileService.GetAsync(externalFileId);
        if (fileInfo != null)
        {
            var filePath = await _externalFileService.GetFilePath(fileInfo.FilePath);
            System.IO.File.Delete(filePath);

            var result = await _externalFileService.DeleteAsync(externalFileId);
            if (result)
            {
                return Ok(ApiReturnMessages.Deleted);
            }
        }

        return NotFound();
    }

    [HttpGet("{externalCustomDataObjectId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Get(int externalCustomDataObjectId)
    {
        var externalFiles = await _externalFileService.GetAllAsync(externalCustomDataObjectId);
        return Ok(externalFiles);
    }

    [HttpGet]
    [Route("/api/externalfiles/{fileGuid:Guid}/{filename:maxlength(255)}")]
    public async Task<IActionResult> GetByUrl(Guid fileGuid, string filename, [FromQuery]string token, [FromQuery]bool? isInline = null, [FromQuery]bool? thumb = false)
    {
        var file = await _externalFileService.GetAsync(fileGuid);
        if (file != null)
        {
            if (token.IsBase64String() == false)
            {
                return BadRequest(string.Format(ApiReturnMessages.WrongToken));
            }

            var tokenWithFileId = token.Base64Decode().Split(":", StringSplitOptions.RemoveEmptyEntries);
            var fileToken = tokenWithFileId[0];
            var fileId = tokenWithFileId[1];

            var isValidToken = await _tokenService.ValidateAndRefreshToken(fileToken);

            if (isValidToken == false)
            {
                return Unauthorized();
            }

            if (file.ExternalFileId.ToString() != fileId)
            {
                return Unauthorized();
            }

            var contentDispositionType = isInline ?? false ? ContentDisposition.Inline : ContentDisposition.Attachment;

            var contentDisposition = new ContentDispositionHeaderValue(contentDispositionType);
            contentDisposition.SetHttpFileName(file.FileName);
            Response.Headers[HeaderNames.ContentDisposition] = contentDisposition.ToString();

            var fileContext = new FileContext(new ExternalStorageStrategy(_systemSettingsService));

            if (thumb == false)
            {
                return await fileContext.GetFileStreamResult(file.FilePath, file.FileMimeType);
            }

            return await fileContext.GetFileThumbnailStreamResult(file.FilePath, "CM.FileSystem.Service.Resource.NoThumbnail.png");
        }

        return NotFound();
    }

    [HttpPost("/api/externalfiles/PDFfromhtml/{externalCustomDataObjectId:int}")]
    [DisableFormValueModelBinding]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> PdfFromHtml(int externalCustomDataObjectId, [FromBody] PdfFileRequest pdfFileRequest)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var externalCustomDataObject = await _externalCustomDataObjectService.GetExternalCustomObject(externalCustomDataObjectId);

        if (externalCustomDataObject == null)
        {
            return BadRequest(string.Format(ApiReturnMessages.ExternalCustomDataObjectDoesNotExist, externalCustomDataObjectId));
        }

        var createdDateTime = DateTime.UtcNow.GetCmDateTime();
        var pdfFileResponse = await _externalFileService.CreatePdf(pdfFileRequest, createdDateTime);
        var newFileGuid = Guid.NewGuid();

        var fileRelativePath = Path.Combine(
            createdDateTime.Year.ToString(),
            createdDateTime.Month.ToString(),
            createdDateTime.Day.ToString(),
            externalCustomDataObjectId.ToString(),
            pdfFileRequest.FileType.ToString(),
            newFileGuid.ToString());

        var rootFolder = await _systemSettingsService.GetValueAsync<string>(SettingKeys.ExternalFileStorageRoot);

        var fileRepository = _storage.GetRepository<FileSystemStorage>();
        var container = new ContainerDefinition { Path = rootFolder };
        var fileDefinition = new FileDefinition { Name = fileRelativePath };
        var fileStatus = fileRepository.Move(pdfFileResponse.FullName, container, fileDefinition);

        if (fileStatus.Status == Status.Success)
        {
            var fileInfo = new FileInfo(fileStatus.AbsolutePath);
            var fileName = $"{pdfFileRequest.FileTitle}_{externalCustomDataObjectId}_{createdDateTime:MM_dd_yyyy}.pdf";
            var fileRequest = new FileUploadInfo
            {
                FileGuid = newFileGuid,
                FileSize = fileInfo.Length,
                FileMimeType = FileMimeTypes.Pdf,
                FileName = fileName,
                OriginalFileName = fileName,
                FileType = pdfFileRequest.FileType,
                FilePath = fileRelativePath
            };

            var fileResponse = await _externalFileService.CreateAsync(fileRequest, externalCustomDataObjectId);

            return Ok(fileResponse);
        }

        return NoContent();
    }

    [HttpPost("/api/externalfiles/PDFfromhtml/{externalCustomDataObjectId:int}/externalsession/{sessionToken}")]
    [DisableFormValueModelBinding]
    public async Task<IActionResult> PdfFromHtml(int externalCustomDataObjectId, string sessionToken, [FromBody] PdfFileRequest pdfFileRequest)
    {
        var sessionGuid = await CanSessionAccessToExternalCustomDataObject(externalCustomDataObjectId, sessionToken);
        if (sessionGuid == null)
        {
            return Unauthorized();
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var externalCustomDataObject = await _externalCustomDataObjectService.GetExternalCustomObject(externalCustomDataObjectId);

        if (externalCustomDataObject == null)
        {
            return BadRequest(string.Format(ApiReturnMessages.ExternalCustomDataObjectDoesNotExist, externalCustomDataObjectId));
        }

        var createdDateTime = DateTime.UtcNow.GetCmDateTime();
        var pdfFileResponse = await _externalFileService.CreatePdf(pdfFileRequest, createdDateTime);
        var newFileGuid = Guid.NewGuid();

        var fileRelativePath = Path.Combine(
            createdDateTime.Year.ToString(),
            createdDateTime.Month.ToString(),
            createdDateTime.Day.ToString(),
            externalCustomDataObjectId.ToString(),
            pdfFileRequest.FileType.ToString(),
            newFileGuid.ToString());

        var rootFolder = await _systemSettingsService.GetValueAsync<string>(SettingKeys.ExternalFileStorageRoot);

        var fileRepository = _storage.GetRepository<FileSystemStorage>();
        var container = new ContainerDefinition { Path = rootFolder };
        var fileDefinition = new FileDefinition { Name = fileRelativePath };
        var fileStatus = fileRepository.Move(pdfFileResponse.FullName, container, fileDefinition);

        if (fileStatus.Status == Status.Success)
        {
            var fileInfo = new FileInfo(fileStatus.AbsolutePath);
            var fileName = $"{pdfFileRequest.FileTitle}_{externalCustomDataObjectId}_{createdDateTime:MM_dd_yyyy}.pdf";
            var fileRequest = new FileUploadInfo
            {
                FileGuid = newFileGuid,
                FileSize = fileInfo.Length,
                FileMimeType = FileMimeTypes.Pdf,
                FileName = fileName,
                OriginalFileName = fileName,
                FileType = pdfFileRequest.FileType,
                FilePath = fileRelativePath
            };

            var fileResponse = await _externalFileService.CreateAsync(fileRequest, externalCustomDataObjectId);

            return Ok(fileResponse);
        }

        return NoContent();
    }

    private async Task<Guid?> CanSessionAccessToExternalCustomDataObject(int externalCustomDataObjectId, string sessionToken)
    {
        var sessionGuid = _jwtUtils.ValidateToken(sessionToken);

        if (!sessionGuid.HasValue)
        {
            return null;
        }

        var isExists = await _externalCustomDataObjectService.CanSessionAccessToExternalCustomDataObject(externalCustomDataObjectId, sessionGuid);

        return !isExists ? null : sessionGuid;
    }
}