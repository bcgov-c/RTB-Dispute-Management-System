using System.Threading.Tasks;
using CM.Business.Services.AccessCode;
using CM.Common.Utilities;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Route("api/accesscoderecovery")]
[Produces(Application.Json)]
public class AccessCodeRecoveryController : Controller
{
    private readonly IAccessCodeService _accessCodeService;

    public AccessCodeRecoveryController(IAccessCodeService accessCodeService)
    {
        _accessCodeService = accessCodeService;
    }

    [HttpPost]
    public async Task<IActionResult> Post(int fileNumber, string email)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (email.IsValidEmail() == false)
        {
            return BadRequest(ApiReturnMessages.InvalidEmailTemplateId);
        }

        const int fileIdMinDigits = 8;
        const int fileIdMaxDigits = 9;
        var digits = fileNumber.CountDigit();
        if (digits is < fileIdMinDigits or > fileIdMaxDigits)
        {
            return BadRequest(ApiReturnMessages.FileNumberIsInvalid);
        }

        await _accessCodeService.TrySendAccessCodeRecoveryEmailAsync(fileNumber, email);

        return Ok(ApiReturnMessages.SendAccessCodeRecoveryEmail);
    }
}