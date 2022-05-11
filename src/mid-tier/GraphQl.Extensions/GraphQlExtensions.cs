using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using GraphQL.Builders;
using GraphQL.Types;

namespace GraphQl.Extensions;

public static class GraphQlExtensions
{
    private const string PermissionsKey = "Permissions";

    public static bool RequiresPermissions(this IProvideMetadata type)
    {
        var permissions = type.GetMetadata<IEnumerable<string>>(PermissionsKey, new List<string>());
        return permissions != null && permissions.Any();
    }

    public static bool CanAccess(this IProvideMetadata type, IEnumerable<Claim> claims)
    {
        var permissions = type.GetMetadata<IEnumerable<string>>(PermissionsKey, new List<string>());
        var claim = claims.FirstOrDefault(c => c.Type == "role");
        var role = claim?.Value;
        return permissions != null && permissions.Contains(role);
    }

    public static bool HasPermission(this IProvideMetadata type, string permission)
    {
        var permissions = type.GetMetadata<IEnumerable<string>>(PermissionsKey, new List<string>());
        return permissions != null && permissions.Any(x => string.Equals(x, permission));
    }

    public static void RequirePermission(this IProvideMetadata type, string permission)
    {
        var permissions = type.GetMetadata<List<string>>(PermissionsKey);

        if (permissions == null)
        {
            permissions = new List<string>();
            type.Metadata[PermissionsKey] = permissions;
        }

        permissions.Add(permission);
    }

    public static FieldBuilder<TSourceType, TReturnType> RequirePermission<TSourceType, TReturnType>(
        this FieldBuilder<TSourceType, TReturnType> builder, string permission)
    {
        builder.FieldType.RequirePermission(permission);
        return builder;
    }
}