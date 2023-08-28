using System.Threading.Tasks;
using CM.Business.Services.CanadaPost;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers
{
    [Produces(Application.Json)]
    [Route("api/other")]
    public class CanadaPostController : BaseController
    {
        private readonly ICanadaPostService _canadaPostService;

        public CanadaPostController(ICanadaPostService canadaPostService)
        {
            _canadaPostService = canadaPostService;
        }

        [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.User, RoleNames.AccessCode, RoleNames.OfficePay })]
        [HttpGet("canadapostdelivery/{trackingCode}")]
        public async Task<IActionResult> GetTrackingData(string trackingCode)
        {
            if (trackingCode.Length is > Constants.CanadaTrackingMaxLength or < Constants.CanadaTrackingMinLength)
            {
                return BadRequest($"The tracking code must be in {Constants.CanadaTrackingMaxLength}-{Constants.CanadaTrackingMinLength} characters range");
            }

            var result = await _canadaPostService.GetTrackingData(trackingCode);

            return Ok(result);
        }
    }
}
