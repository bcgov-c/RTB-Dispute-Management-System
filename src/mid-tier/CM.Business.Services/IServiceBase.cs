using System;
using System.Threading.Tasks;

namespace CM.Business.Services;

public interface IServiceBase
{
    Task<DateTime?> GetLastModifiedDateAsync(object id);
}