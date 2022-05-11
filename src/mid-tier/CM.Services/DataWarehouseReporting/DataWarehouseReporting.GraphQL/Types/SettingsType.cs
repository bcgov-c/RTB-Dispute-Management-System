using GraphQl.Extensions;
using GraphQL.Types;

namespace DataWarehouseReporting.GraphQL.Types;

public sealed class SettingsType : ObjectGraphType<SettingsModel>
{
    public SettingsType()
    {
        this.RequirePermission("IdentityAdministrator");

        Name = "SettingsType";
        Description = "SettingsType";

        Field(x => x.Key);
        Field(x => x.Value, true);
    }
}

public class SettingsModel
{
    public string Key { get; set; }

    public string Value { get; set; }
}