using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CM.WebAPI.Authorization.Handlers;

public class ForbidResourceAuthorizationHandler : IResourceAuthorizationHandler
{
    public async Task<bool> IsAuthorized(ActionExecutingContext context, int userId)
    {
        return await Task.FromResult(false);
    }
}