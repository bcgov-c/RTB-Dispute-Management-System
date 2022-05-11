using System.Collections.Generic;
using System.Linq;
using CM.Common.Utilities;

namespace DataWarehouseReporting.GraphQL.Helper;

public static class OrderByFieldsExtension
{
    public static List<T> OrderByFields<T>(this string value, List<T> initialEntities)
        where T : class
    {
        var orders = value.ConvertToDictionary(':');

        foreach (var item in orders)
        {
            var propertyInfo = typeof(T).GetProperty(item.Key);

            if (propertyInfo != null)
            {
                if (item.Value == "asc")
                {
                    initialEntities = initialEntities.OrderBy(x => propertyInfo.GetValue(x, null)).ToList();
                }
                else
                {
                    initialEntities = initialEntities.OrderByDescending(x => propertyInfo.GetValue(x, null)).ToList();
                }
            }
        }

        return initialEntities;
    }
}