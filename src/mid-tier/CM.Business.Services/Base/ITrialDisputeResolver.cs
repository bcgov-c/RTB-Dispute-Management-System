using System;
using System.Threading.Tasks;

namespace CM.Business.Services.Base;

public interface ITrialDisputeResolver
{
    Task<Guid> ResolveDisputeGuid(Guid guid);
}