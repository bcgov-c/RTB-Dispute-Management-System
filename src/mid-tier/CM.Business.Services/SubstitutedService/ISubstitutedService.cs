using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.SubstitutedService;
using CM.Business.Services.Base;

namespace CM.Business.Services.SubstitutedService;

public interface ISubstitutedService : IServiceBase, IDisputeResolver
{
    Task<SubstitutedServicePostResponse> CreateAsync(Guid disputeGuid, SubstitutedServicePostRequest request);

    Task<SubstitutedServicePostResponse> GetSubServiceAsync(int substitutedServiceId);

    Task<SubstitutedServicePostResponse> PatchAsync(int substitutedServiceId, SubstitutedServicePatchRequest subService);

    Task<bool> DeleteAsync(int substitutedServiceId);

    Task<List<SubstitutedServicePostResponse>> GetByDisputeGuidAsync(Guid disputeGuid);

    Task<SubstitutedServicePatchRequest> GetSubServiceForPatchAsync(int substitutedServiceId);

    Task<List<ExternalSubstitutedServiceResponse>> GetExternalDisputeSubstitutedServices(Guid disputeGuid);
}