using System;

namespace CM.Business.Services.Base;

public interface IDisputeResolver
{
    System.Threading.Tasks.Task<Guid> ResolveDisputeGuid(int id);
}