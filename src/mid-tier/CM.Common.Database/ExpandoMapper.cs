using System.Dynamic;
using System.Linq;

namespace CM.Common.Database;

public static class ExpandoMapper
{
    public static T FromExpando<T>(ExpandoObject expando)
        where T : class, new()
    {
        if (expando == null)
        {
            return null;
        }

        var properties = typeof(T)
            .GetProperties()
            .Where(pi => pi.CanWrite && !pi.GetIndexParameters().Any())
            .ToDictionary(pi => pi.Name.ToLower());

        var obj = new T();
        foreach (var(key, val) in expando)
        {
            var name = key.ToLower().Replace("_", string.Empty);

            if (val != null && properties.TryGetValue(name, out var prop) && prop.PropertyType.IsInstanceOfType(val))
            {
                prop.SetValue(obj, val);
            }
        }

        return obj;
    }
}