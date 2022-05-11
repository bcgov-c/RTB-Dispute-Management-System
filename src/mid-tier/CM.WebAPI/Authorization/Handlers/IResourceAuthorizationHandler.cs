using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CM.WebAPI.Authorization.Handlers;

public interface IResourceAuthorizationHandler
{
    Task<bool> IsAuthorized(ActionExecutingContext context, int userId);
}