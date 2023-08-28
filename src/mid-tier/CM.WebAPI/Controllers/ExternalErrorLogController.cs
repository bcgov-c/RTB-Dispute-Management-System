using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.ExternalErrorLog;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.ExternalCustomDataObject;
using CM.Business.Services.ExternalErrorLog;
using CM.Business.Services.UserServices;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using CM.WebAPI.Jwt;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers
{
    [Produces(Application.Json)]
    [Route("api/externalerrorlogitem")]
    public class ExternalErrorLogController : BaseController
    {
        private readonly IExternalErrorLogService _externalErrorLogService;
        private readonly IExternalCustomDataObjectService _externalCustomDataObjectService;
        private readonly IJwtUtils _jwtUtils;
        private readonly IDisputeService _disputeService;
        private readonly IUserService _userService;

        public ExternalErrorLogController(
            IExternalErrorLogService externalErrorLogService,
            IExternalCustomDataObjectService externalCustomDataObjectService,
            IOptions<JwtSettings> appSettings,
            IDisputeService disputeService,
            IUserService userService)
        {
            _externalErrorLogService = externalErrorLogService;
            _externalCustomDataObjectService = externalCustomDataObjectService;
            _jwtUtils = new JwtUtils(appSettings);
            _disputeService = disputeService;
            _userService = userService;
        }

        [HttpPost]
        [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.User, RoleNames.AccessCode, RoleNames.OfficePay })]
        public async Task<IActionResult> Post([FromBody] ExternalErrorLogRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (request.DisputeGuid.HasValue)
            {
                var isValidDisputeGuid = await _disputeService.DisputeExistsAsync(request.DisputeGuid.Value);
                if (!isValidDisputeGuid)
                {
                    return BadRequest(ApiReturnMessages.InvalidDisputeGuid);
                }
            }

            if (request.ErrorOwner.HasValue)
            {
                var isValidAdminUSer = await _userService.UserIsActiveAdmin(request.ErrorOwner.Value);
                if (!isValidAdminUSer)
                {
                    return BadRequest(ApiReturnMessages.InvalidErrorOwner);
                }
            }

            if (request.ReportedDate.HasValue && request.ReportedDate.Value >= DateTime.UtcNow)
            {
                return BadRequest(ApiReturnMessages.ReportedDateMustBeInPast);
            }

            var newErrorLog = await _externalErrorLogService.CreateAsync(request);
            return Ok(newErrorLog);
        }

        [HttpPost("{sessionToken}")]
        public async Task<IActionResult> PostBySessionToken(string sessionToken, [FromBody] ExternalErrorLogRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var sessionGuid = _jwtUtils.ValidateToken(sessionToken);

            if (!sessionGuid.HasValue)
            {
                return Unauthorized();
            }

            var isExists = await _externalCustomDataObjectService.IsSessionExists(sessionGuid);

            if (!isExists)
            {
                return Unauthorized();
            }

            if (request.DisputeGuid.HasValue)
            {
                var isValidDisputeGuid = await _disputeService.DisputeExistsAsync(request.DisputeGuid.Value);
                if (!isValidDisputeGuid)
                {
                    return BadRequest(ApiReturnMessages.InvalidDisputeGuid);
                }
            }

            if (request.ErrorOwner.HasValue)
            {
                var isValidAdminUSer = await _userService.UserIsActiveAdmin(request.ErrorOwner.Value);
                if (!isValidAdminUSer)
                {
                    return BadRequest(ApiReturnMessages.InvalidErrorOwner);
                }
            }

            if (request.ReportedDate.HasValue && request.ReportedDate.Value >= DateTime.UtcNow)
            {
                return BadRequest(ApiReturnMessages.ReportedDateMustBeInPast);
            }

            var newErrorLog = await _externalErrorLogService.CreateAsync(request);
            return Ok(newErrorLog);
        }

        [HttpPatch("{externalErrorLogId:int}")]
        [ApplyConcurrencyCheck]
        [AuthorizationRequired(new[] { RoleNames.Admin })]
        public async Task<IActionResult> Patch(int externalErrorLogId,
        [FromBody] JsonPatchDocumentExtension<ExternalErrorLogPatchRequest> request)
        {
            if (CheckModified(_externalErrorLogService, externalErrorLogId))
            {
                return StatusConflicted();
            }

            var externalErrorLogToPatch = await _externalErrorLogService.GetForPatchAsync(externalErrorLogId);
            if (externalErrorLogToPatch != null)
            {
                var(ownerExists, ownerValue) = request.GetValue<int?>("/error_owner");
                if (ownerExists && ownerValue.HasValue)
                {
                    var userExists = await _userService.GetSystemUser(ownerValue.Value);
                    if (userExists is not { SystemUserRoleId: (int)Roles.StaffUser })
                    {
                        return BadRequest(ApiReturnMessages.InvalidErrorOwner);
                    }
                }

                var(dateExists, dateValue) = request.GetValue<DateTime?>("/reported_date");
                if (dateExists && dateValue.HasValue && dateValue.Value >= DateTime.UtcNow)
                {
                    return BadRequest(ApiReturnMessages.ReportedDateMustBeInPast);
                }

                request.ApplyTo(externalErrorLogToPatch);

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _externalErrorLogService.PatchAsync(externalErrorLogId, externalErrorLogToPatch);

                if (result != null)
                {
                    return Ok(result);
                }
            }

            return NotFound();
        }

        [HttpDelete("{externalErrorLogId:int}")]
        [ApplyConcurrencyCheck]
        [AuthorizationRequired(new[] { RoleNames.Admin })]
        public async Task<IActionResult> Delete(int externalErrorLogId)
        {
            if (CheckModified(_externalErrorLogService, externalErrorLogId))
            {
                return StatusConflicted();
            }

            var result = await _externalErrorLogService.DeleteAsync(externalErrorLogId);
            if (result)
            {
                return Ok(ApiReturnMessages.Deleted);
            }

            return NotFound();
        }

        [HttpGet("{externalErrorLogId:int}")]
        [AuthorizationRequired(new[] { RoleNames.Admin })]
        public async Task<IActionResult> Get(int externalErrorLogId)
        {
            var externalErrorLog = await _externalErrorLogService.GetExternalErrorLog(externalErrorLogId);
            if (externalErrorLog != null)
            {
                return Ok(externalErrorLog);
            }

            return NotFound();
        }

        [HttpGet("/api/externalerrorlogitems")]
        [AuthorizationRequired(new[] { RoleNames.Admin })]
        public async Task<IActionResult> Get(ExternalErrorLogGetRequest request, int index, int count)
        {
            var externalErrorLogs = await _externalErrorLogService.GetExternalErrorLogs(request, index, count);
            if (externalErrorLogs != null)
            {
                return Ok(externalErrorLogs);
            }

            return NotFound();
        }
    }
}
