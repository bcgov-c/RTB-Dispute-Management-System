using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CM.Common.Utilities;

public static class QueryableExtensions
{
    public static IQueryable<T> ApplyPaging<T>(this IQueryable<T> query, int count, int index)
    {
        return query.Skip(index * count).Take(count);
    }

    public static List<T> ApplyPaging<T>(this IEnumerable<T> list, int count, int index)
    {
        var result = list.Skip(index * count).Take(count);
        return result.ToList();
    }

    public static IQueryable<T> ApplyPagingArrayStyle<T>(this IQueryable<T> query, int count, int index)
    {
        return query.Skip(index).Take(count);
    }

    public static Task<List<T>> ToListAsync<T>(this IEnumerable<T> list)
    {
        return Task.Run(list.ToList);
    }

    public static async Task<List<T>> ApplyPagingArrayStyleAsync<T>(this IEnumerable<T> list, int count, int index)
    {
        var result = list.Skip(index).Take(count);
        return await result.ToListAsync();
    }
}