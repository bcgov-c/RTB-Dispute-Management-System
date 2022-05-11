using System;
using CM.Common.Utilities;
using Microsoft.AspNetCore.Http;

namespace CM.UserResolverService;

public class UserResolver : IUserResolver
{
    private readonly IHttpContextAccessor _accessor;

    public UserResolver(IHttpContextAccessor accessor)
    {
        _accessor = accessor;
    }

    public int GetUserId()
    {
        var username = _accessor?.HttpContext?.User?.Identity?.Name;
        return int.Parse(username ?? "0");
    }

    public Guid? GetAssociatedDispute()
    {
        var disputeGuid = (Guid?)_accessor?.HttpContext?.Items[ContextKeys.DisputeKey];
        return disputeGuid;
    }
}