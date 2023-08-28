using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.InternalUserRole;
using CM.Business.Services.InternalUserRole;
using CM.Business.Services.UserServices;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/internaluserrole")]
[AuthorizationRequired(new[] { RoleNames.Admin })]
public class InternalUserRoleController : BaseController
{
    private readonly IInternalUserRoleService _internalUserRoleService;
    private readonly IMapper _mapper;
    private readonly IUserService _userService;

    public InternalUserRoleController(IInternalUserRoleService internalUserRoleService, IUserService userService, IMapper mapper)
    {
        _internalUserRoleService = internalUserRoleService;
        _userService = userService;
        _mapper = mapper;
    }

    [HttpPost("{userId:int}")]
    public async Task<IActionResult> Post(int userId, [FromBody]InternalUserRoleRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var isUserActive = await _internalUserRoleService.IsUserActive(userId);
        if (!isUserActive)
        {
            return BadRequest(string.Format(ApiReturnMessages.InactiveUser, userId));
        }

        if (request.RoleSubtypeId != null)
        {
            var duplicateRecordExists = await _internalUserRoleService.IfDuplicateRecordExists(userId, request.RoleGroupId, request.RoleSubtypeId);
            if (duplicateRecordExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.DuplicateRecord));
            }
        }

        if (request.ManagedById.HasValue)
        {
            var isAdminUserExists = await _userService.UserIsActiveAdmin(request.ManagedById.Value);
            if (!isAdminUserExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.InvalidManagedById));
            }
        }

        var newRole = await _internalUserRoleService.CreateAsync(userId, request);
        EntityIdSetContext(newRole.InternalUserRoleId);
        return Ok(newRole);
    }

    [HttpPatch("{internalUserRoleId:int}")]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Patch(int internalUserRoleId, [FromBody]JsonPatchDocumentExtension<InternalUserRoleRequest> internalUserRole)
    {
        if (CheckModified(_internalUserRoleService, internalUserRoleId))
        {
            return StatusConflicted();
        }

        var originalInternalUserRole = await _internalUserRoleService.GetNoTrackingInternalUserRoleAsync(internalUserRoleId);
        if (originalInternalUserRole != null)
        {
            var internalUserRoleToPatch = _mapper.Map<InternalUserRole, InternalUserRoleRequest>(originalInternalUserRole);
            internalUserRole.ApplyTo(internalUserRoleToPatch);

            await TryUpdateModelAsync(internalUserRoleToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var roleSubtypeId = internalUserRole.GetValue<int>("/role_subtype_id");

            if (roleSubtypeId.Exists)
            {
                var duplicateRecordExists = await _internalUserRoleService
                    .IfDuplicateRecordExists(originalInternalUserRole.UserId, internalUserRoleToPatch.RoleGroupId, internalUserRoleToPatch.RoleSubtypeId);
                if (duplicateRecordExists)
                {
                    return BadRequest(string.Format(ApiReturnMessages.DuplicateRecord));
                }
            }

            var(existsManagedById, managedByIdValue) = internalUserRole.GetValue<int?>("/managed_by_id");
            if (existsManagedById && managedByIdValue.HasValue)
            {
                var isAdminUserExists = await _userService.UserIsActiveAdmin(managedByIdValue.Value);
                if (!isAdminUserExists)
                {
                    return BadRequest(string.Format(ApiReturnMessages.InvalidManagedById));
                }
            }

            _mapper.Map(internalUserRoleToPatch, originalInternalUserRole);
            originalInternalUserRole.InternalUserRoleId = internalUserRoleId;
            var result = await _internalUserRoleService.PatchAsync(originalInternalUserRole);

            EntityIdSetContext(internalUserRoleId);
            return Ok(result);
        }

        return NotFound();
    }
}