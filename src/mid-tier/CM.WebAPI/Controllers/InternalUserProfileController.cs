using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.InternalUserProfile;
using CM.Business.Services.Files;
using CM.Business.Services.InternalUserProfile;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/internaluserprofile")]
[AuthorizationRequired(new[] { RoleNames.Admin })]
public class InternalUserProfileController : BaseController
{
    private readonly ICommonFileService _commonFileService;
    private readonly IInternalUserProfileService _internalUserProfileService;
    private readonly IMapper _mapper;

    public InternalUserProfileController(IInternalUserProfileService internalUserProfileService, ICommonFileService commonFileService, IMapper mapper)
    {
        _internalUserProfileService = internalUserProfileService;
        _commonFileService = commonFileService;
        _mapper = mapper;
    }

    [HttpPost("{internalUserId:int}")]
    public async Task<IActionResult> Post(int internalUserId, [FromBody]InternalUserProfileRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userExists = await _internalUserProfileService.UserExists(internalUserId);
        if (!userExists)
        {
            return BadRequest(ApiReturnMessages.InvalidUser);
        }

        var profileExists = await _internalUserProfileService.InternalUserProfileExists(internalUserId);
        if (profileExists)
        {
            return BadRequest(ApiReturnMessages.InternalUserProfileExists);
        }

        if (request.ProfilePictureId != null)
        {
            var profilePictureExists = await _commonFileService.ProfilePictureExists(request.ProfilePictureId);
            if (!profilePictureExists)
            {
                return BadRequest(ApiReturnMessages.ProfilePictureFileExists);
            }
        }

        if (request.SignatureFileId != null)
        {
            var signatureFileExists = await _commonFileService.SignatureFileExists(request.SignatureFileId);
            if (!signatureFileExists)
            {
                return BadRequest(ApiReturnMessages.SignatureFileExists);
            }
        }

        var result = await _internalUserProfileService.CreateAsync(internalUserId, request);
        EntityIdSetContext(result.InternalUserProfileId);
        return Ok(result);
    }

    [HttpPatch("{profileId:int}")]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Patch(int profileId, [FromBody]JsonPatchDocumentExtension<InternalUserProfileRequest> internalUserProfile)
    {
        if (CheckModified(_internalUserProfileService, profileId))
        {
            return StatusConflicted();
        }

        var originalInternalUserProfile = await _internalUserProfileService.GetNoTrackingInternalUserProfileAsync(profileId);
        if (originalInternalUserProfile != null)
        {
            var infernalUserProfileToPatch = _mapper.Map<InternalUserProfile, InternalUserProfileRequest>(originalInternalUserProfile);
            internalUserProfile.ApplyTo(infernalUserProfileToPatch);

            await TryUpdateModelAsync(infernalUserProfileToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var profilePictureId = internalUserProfile.GetValue<int>("/profile_picture_id");
            if (profilePictureId.Exists && !await _commonFileService.ProfilePictureExists(profilePictureId.Value))
            {
                return BadRequest(ApiReturnMessages.ProfilePictureFileExists);
            }

            var signatureFileId = internalUserProfile.GetValue<int>("/signature_file_id");
            if (signatureFileId.Exists && !await _commonFileService.SignatureFileExists(signatureFileId.Value))
            {
                return BadRequest(ApiReturnMessages.SignatureFileExists);
            }

            _mapper.Map(infernalUserProfileToPatch, originalInternalUserProfile);
            originalInternalUserProfile.InternalUserProfileId = profileId;
            var result = await _internalUserProfileService.PatchAsync(originalInternalUserProfile);
            EntityIdSetContext(profileId);
            return Ok(result);
        }

        return NotFound();
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var internalUserProfiles = await _internalUserProfileService.GetAllAsync();
        if (internalUserProfiles != null)
        {
            return Ok(internalUserProfiles);
        }

        return NotFound();
    }
}