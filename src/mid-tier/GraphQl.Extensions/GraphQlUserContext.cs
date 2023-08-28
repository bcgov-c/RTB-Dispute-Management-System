using System.Collections.Generic;
using System.Security.Claims;
using GraphQL.Authorization;

namespace GraphQl.Extensions;

public class GraphQlUserContext : Dictionary<string, object>, IProvideClaimsPrincipal
{
    public ClaimsPrincipal User { get; set; }
}