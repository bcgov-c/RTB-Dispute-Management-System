using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Files;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.Files;
using CM.Business.Services.SystemSettingsService;
using CM.Business.Services.TokenServices;
using CM.Common.Utilities;
using CM.FileSystem.Service;
using CM.FileSystem.Service.FileHelper;
using CM.Storage;
using CM.Storage.FileSystem;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/file")]
public class FileController : BaseController
{
    private readonly IDisputeService _disputeService;
    private readonly IFileService _fileService;

    private readonly IStorage _storage;

    private readonly ISystemSettingsService _systemSettingsService;

    private readonly ITokenService _tokenService;

    public FileController(IFileService fileService, IDisputeService disputeService, ITokenService tokenService, ISystemSettingsService systemSettingsService, IStorage storage)
    {
        _fileService = fileService;
        _disputeService = disputeService;
        _tokenService = tokenService;
        _systemSettingsService = systemSettingsService;
        _storage = storage;
    }

    [HttpDelete("{fileId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.ExtendedOfficePay })]
    public async Task<IActionResult> Delete(int fileId)
    {
        if (CheckModified(_fileService, fileId))
        {
            return StatusConflicted();
        }

        var fileInfo = await _fileService.GetAsync(fileId);

        if (fileInfo == null)
        {
            return NotFound();
        }

        var fileContext = FileContextFactory.GetStorageFromFileStorageType(fileInfo.Storage, _systemSettingsService);
        await fileContext.Delete(fileInfo);

        await DisputeResolveAndSetContext(_fileService, fileId);
        var result = await _fileService.DeleteAsync(fileId);

        if (result)
        {
            EntityIdSetContext(fileId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpGet]
    [Route("/file/{fileGuid:Guid}/{filename:maxlength(255)}")]
    public async Task<IActionResult> GetByUrl(Guid fileGuid, string filename, [FromQuery] string token, [FromQuery] bool? isInline = null, [FromQuery] bool? thumb = false)
    {
        var file = await _fileService.GetAsync(fileGuid);

        if (file.PublicAccessAllowed.GetValueOrDefault() == false)
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

            var isFilePermittedForUser = await GetFilePermission(fileToken, file);

            if (!isFilePermittedForUser)
            {
                return Unauthorized();
            }

            if (file.FileId.ToString() != fileId)
            {
                return Unauthorized();
            }
        }
        else
        {
            if (string.IsNullOrWhiteSpace(filename))
            {
                return BadRequest(string.Format(ApiReturnMessages.FileNameIsMissing));
            }
        }

        var contentDispositionType = isInline ?? false ? ContentDisposition.Inline : ContentDisposition.Attachment;
        var contentDisposition = new ContentDispositionHeaderValue(contentDispositionType);

        contentDisposition.SetHttpFileName(string.IsNullOrWhiteSpace(filename) ? file.FileName : filename);
        Response.Headers[HeaderNames.ContentDisposition] = contentDisposition.ToString();

        var fileContext = FileContextFactory.GetStorageFromFileStorageType(file.Storage, _systemSettingsService);
        if (thumb == false)
        {
            return await fileContext.GetFileStreamResult(file.FilePath, file.FileMimeType);
        }

        return await fileContext.GetFileThumbnailStreamResult(file.FilePath, "CM.FileSystem.Service.Resource.NoThumbnail.png");
    }

    [HttpPost("/api/file/PDFfromhtml/{disputeGuid:Guid}")]
    [DisableFormValueModelBinding]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> PdfFromHtml(Guid disputeGuid, [FromBody] PdfFileRequest pdfFileRequest)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var dispute = await _disputeService.GetDisputeResponseAsync(disputeGuid);

        if (dispute == null)
        {
            return BadRequest(string.Format(ApiReturnMessages.DisputeDoesNotExist, disputeGuid));
        }

        var createdDateTime = DateTime.UtcNow.GetCmDateTime();
        var pdfFileResponse = await _fileService.CreatePdf(dispute, pdfFileRequest, createdDateTime);
        var newFileGuid = Guid.NewGuid();

        var fileRelativePath = Path.Combine(
            createdDateTime.Year.ToString(),
            createdDateTime.Month.ToString(),
            createdDateTime.Day.ToString(),
            dispute.FileNumber.ToString(),
            pdfFileRequest.FileType.ToString(),
            newFileGuid.ToString());

        var rootFolder = await _systemSettingsService.GetValueAsync<string>(SettingKeys.FileStorageRoot);

        var fileRepository = _storage.GetRepository<FileSystemStorage>();
        var container = new ContainerDefinition { Path = rootFolder };
        var fileDefinition = new FileDefinition { Name = fileRelativePath };
        var fileStatus = fileRepository.Move(pdfFileResponse.FullName, container, fileDefinition);

        if (fileStatus.Status == Status.Success)
        {
            var fileInfo = new FileInfo(fileStatus.AbsolutePath);
            var fileName = $"{pdfFileRequest.FileTitle}_{dispute.FileNumber}_{createdDateTime:MM_dd_yyyy}.pdf";
            var fileRequest = new FileRequest
            {
                FileGuid = newFileGuid,
                FileSize = fileInfo.Length,
                FileMimeType = FileMimeTypes.Pdf,
                FileName = fileName,
                OriginalFileName = fileName,
                FileType = pdfFileRequest.FileType,
                FilePath = fileRelativePath
            };

            DisputeSetContext(dispute.DisputeGuid);
            var fileResponse = await _fileService.CreateAsync(dispute, fileRequest);
            EntityIdSetContext(fileResponse.FileId);

            return Ok(fileResponse);
        }

        return NoContent();
    }

    private async Task<bool> GetFilePermission(string tokenString, FileResponse file)
    {
        var token = await _tokenService.GetUserTokenWithDetails(tokenString);

        if (token.SystemUser == null)
        {
            return false;
        }

        return token.SystemUser.SystemUserRoleId switch
        {
            (int)Roles.StaffUser => true,
            (int)Roles.OfficePayUser => true,
            (int)Roles.ExternalUser => token.SystemUser.DisputeUsers != null &&
                                       token.SystemUser.DisputeUsers.Any(x => x.DisputeGuid == file.DisputeGuid),
            _ => false
        };
    }
}