using System;
using System.Threading.Tasks;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.Files;
using CM.Business.Services.SystemSettingsService;
using CM.Common.ChunkedFileUpload;
using CM.Common.Utilities;
using CM.FileSystem.Service;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using Serilog;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/file-upload")]
public class FileUploadController : BaseController
{
    private readonly IDisputeService _disputeService;
    private readonly IFileService _fileService;
    private readonly ISystemSettingsService _systemSettingsService;

    public FileUploadController(IFileService fileService, IDisputeService disputeService, ISystemSettingsService systemSettingsService)
    {
        _fileService = fileService;
        _disputeService = disputeService;
        _systemSettingsService = systemSettingsService;
    }

    [HttpPost("{disputeGuid:Guid}", Name = "PostFileChunked")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> PostChunked(Guid disputeGuid, UploadFileRequest uploadFileRequest)
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

        if (dispute.FileNumber == null)
        {
            return BadRequest(string.Format(ApiReturnMessages.DisputeFileNumberRequired, disputeGuid));
        }

        try
        {
            var fileContext = FileContextFactory.GetStorageFromDisputeStorageType(dispute.FilesStorageSetting, _systemSettingsService);
            var file = await fileContext.StoreAsync(uploadFileRequest, dispute);
            if (file == null)
            {
                return Ok(ApiReturnMessages.FileUploadChunkSuccess);
            }

            DisputeSetContext(dispute.DisputeGuid);
            var fileResponse = await _fileService.CreateAsyncV2(dispute, file);
            EntityIdSetContext(fileResponse.FileId);
            return Ok(fileResponse);
        }
        catch (Exception exc)
        {
            Log.Error(exc, ApiReturnMessages.FileUploadError);
            return BadRequest(string.Format(ApiReturnMessages.FileUploadError));
        }
    }
}