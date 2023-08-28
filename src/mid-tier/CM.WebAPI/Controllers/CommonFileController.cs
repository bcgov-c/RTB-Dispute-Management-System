using System;
using System.IO;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Files;
using CM.Business.Services.Files;
using CM.Business.Services.SystemSettingsService;
using CM.Business.Services.TokenServices;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.FileSystem.Service;
using CM.FileSystem.Service.FileHelper;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/commonfiles")]
public class CommonFileController : BaseController
{
    private readonly ICommonFileService _commonFileService;
    private readonly IMapper _mapper;
    private readonly ISystemSettingsService _systemSettingsService;
    private readonly ITokenService _tokenService;

    public CommonFileController(IMapper mapper, ICommonFileService commonFileService, ISystemSettingsService systemSettingsService, ITokenService tokenService)
    {
        _commonFileService = commonFileService;
        _systemSettingsService = systemSettingsService;
        _tokenService = tokenService;
        _mapper = mapper;
    }

    [HttpPost(Name = "PostCommonFile")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [DisableFormValueModelBinding]
    public async Task<IActionResult> Post()
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var tempFileFolder = await _systemSettingsService.GetValueAsync<string>(SettingKeys.TempStorageRoot);

        FileUtils.CheckIfNotExistsCreate(tempFileFolder);

        var(model, file) = await FileStreamingHelper.ParseRequestForm(this, tempFileFolder, new CommonFileResponse());

        if (FileUtils.IsValidFileName(file.FileName) == false)
        {
            return BadRequest(string.Format(ApiReturnMessages.InvalidFileName, file.FileName));
        }

        var newFileGuid = Guid.NewGuid();
        var createdDateTime = DateTime.UtcNow.GetCmDateTime();

        var fileRelativePath = Path.Combine(
            createdDateTime.Year.ToString(),
            createdDateTime.Month.ToString(),
            createdDateTime.Day.ToString(),
            model.FileType.ToString(),
            newFileGuid.ToString());

        var fileRequest = new CommonFileRequest
        {
            CommonFileGuid = newFileGuid,
            FileSize = file.Length,
            FileMimeType = file.ContentType,
            FileName = model.FileName,
            OriginalFileName = file.Name,
            FileType = model.FileType,
            FilePath = fileRelativePath,
            FileTitle = model.FileTitle,
            FileDescription = model.FileDescription
        };

        var newFile = await _commonFileService.CreateAsync(fileRequest);
        EntityIdSetContext(newFile.CommonFileId);

        var absolutePath = await _commonFileService.GetFilePath(fileRelativePath);
        FileUtils.CheckIfNotExistsCreate(Path.GetDirectoryName(absolutePath));
        System.IO.File.Move(file.TemporaryLocation, absolutePath);

        await ThumbnailHelper.CreateAsync(absolutePath, file.ContentType, await _systemSettingsService.GetValueAsync<int>(SettingKeys.ThumbnailHeight));

        return Ok(newFile);
    }

    [HttpPatch("{fileId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Patch(int fileId, [FromBody]JsonPatchDocumentExtension<CommonFilePatchRequest> fileInfo)
    {
        if (CheckModified(_commonFileService, fileId))
        {
            return StatusConflicted();
        }

        var originalFile = await _commonFileService.GetNoTrackingFileAsync(fileId);
        if (originalFile != null)
        {
            var fileToPatch = _mapper.Map<CommonFile, CommonFilePatchRequest>(originalFile);
            fileInfo.ApplyTo(fileToPatch);

            await TryUpdateModelAsync(fileToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _mapper.Map(fileToPatch, originalFile);
            originalFile.CommonFileId = fileId;
            var result = await _commonFileService.PatchFileInfo(originalFile);
            EntityIdSetContext(fileId);
            return Ok(result);
        }

        return NotFound();
    }

    [HttpDelete("{commonFileId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Delete(int commonFileId)
    {
        var fileInfo = await _commonFileService.GetAsync(commonFileId);
        if (fileInfo != null)
        {
            var filePath = await _commonFileService.GetFilePath(fileInfo.FilePath);
            System.IO.File.Delete(filePath);

            var result = await _commonFileService.DeleteAsync(commonFileId);
            if (result)
            {
                EntityIdSetContext(commonFileId);
                return Ok(ApiReturnMessages.Deleted);
            }
        }

        return NotFound();
    }

    [HttpGet]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Get(CommonFileType? fileType, int count, int index)
    {
        var commonFiles = await _commonFileService.GetAllAsync(fileType, count, index);
        return Ok(commonFiles);
    }

    [HttpGet]
    [Route("/commonfiles/{fileGuid:Guid}/{filename:maxlength(255)}")]
    public async Task<IActionResult> GetByUrl(Guid fileGuid, string filename, [FromQuery]string token, [FromQuery]bool? isInline = null, [FromQuery]bool? thumb = false)
    {
        var file = await _commonFileService.GetAsync(fileGuid);
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

            if (file.CommonFileId.ToString() != fileId)
            {
                return Unauthorized();
            }

            var contentDispositionType = isInline ?? false ? ContentDisposition.Inline : ContentDisposition.Attachment;

            var contentDisposition = new ContentDispositionHeaderValue(contentDispositionType);
            contentDisposition.SetHttpFileName(file.FileName);
            Response.Headers[HeaderNames.ContentDisposition] = contentDisposition.ToString();

            var fileContext = new FileContext(new CommonStorageStrategy(_systemSettingsService));

            if (thumb == false)
            {
                return await fileContext.GetFileStreamResult(file.FilePath, file.FileMimeType);
            }

            return await fileContext.GetFileThumbnailStreamResult(file.FilePath, "CM.FileSystem.Service.Resource.NoThumbnail.png");
        }

        return NotFound();
    }

    [HttpGet]
    [Route("/api/externalcommonfiles")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.User, RoleNames.OfficePay })]
    public async Task<IActionResult> GetExternalCommonFiles(int count, int index)
    {
        var externalCommonFiles = await _commonFileService.GetExternalCommonFiles(count, index);
        return Ok(externalCommonFiles);
    }
}