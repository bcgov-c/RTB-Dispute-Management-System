using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.ServiceAuditLog;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.FilePackageService;
using CM.Business.Services.NoticeService;
using CM.Business.Services.Parties;
using CM.Business.Services.ServiceAuditLog;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers
{
    [Produces(Application.Json)]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public class ServiceAuditLogController : ControllerBase
    {
        private readonly IServiceAuditLogService _serviceAuditLogService;
        private readonly IDisputeService _disputeService;
        private readonly IParticipantService _participantService;
        private readonly INoticeServiceService _noticeService;
        private readonly IFilePackageServiceService _filePackageService;

        public ServiceAuditLogController(
            IServiceAuditLogService serviceAuditLogService,
            IDisputeService disputeService,
            IParticipantService participantService,
            INoticeServiceService noticeService,
            IFilePackageServiceService filePackageService)
        {
            _serviceAuditLogService = serviceAuditLogService;
            _disputeService = disputeService;
            _participantService = participantService;
            _noticeService = noticeService;
            _filePackageService = filePackageService;
        }

        [HttpGet("api/audit/service")]
        public async Task<IActionResult> GetAuditService(Guid disputeGuid, ServiceAuditLogGetRequest request, int index, int count)
        {
            var disputeExists = await _disputeService.DisputeExistsAsync(disputeGuid);
            if (!disputeExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.DisputeDoesNotExist, disputeGuid));
            }

            if (request.ParticipantId.HasValue)
            {
                var partyExists = await _participantService.ParticipantExists(request.ParticipantId.Value);
                if (!partyExists)
                {
                    return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, request.ParticipantId.Value));
                }
            }

            if (request.ServiceType.HasValue)
            {
                if (request.NoticeServiceId.HasValue)
                {
                    if (request.ServiceType != ServiceType.Notice)
                    {
                        return BadRequest(ApiReturnMessages.NoticeServiceIdCannotProvide);
                    }

                    var noticeService = await _noticeService.GetNoticeServiceAsync(request.NoticeServiceId.Value);
                    if (noticeService == null)
                    {
                        return BadRequest(ApiReturnMessages.InvalidNoticeServiceId);
                    }
                }

                if (request.FilePackageServiceId.HasValue)
                {
                    if (request.ServiceType != ServiceType.FilePackage)
                    {
                        return BadRequest(ApiReturnMessages.FilePackageServiceIdCannotProvide);
                    }

                    var filePackageService = await _filePackageService.GetNoTrackingFilePackageServiceAsync(request.FilePackageServiceId.Value);
                    if (filePackageService == null)
                    {
                        return BadRequest(ApiReturnMessages.InvalidFilePackageServiceId);
                    }
                }
            }

            var serviceAuditLogs = await _serviceAuditLogService.GetServiceAuditLogsAsync(disputeGuid, request, index, count);
            if (serviceAuditLogs != null)
            {
                return Ok(serviceAuditLogs);
            }

            return NotFound();
        }
    }
}
