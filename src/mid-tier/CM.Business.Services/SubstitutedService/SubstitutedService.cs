using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.SubstitutedService;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.SubstitutedService;

public class SubstitutedService : CmServiceBase, ISubstitutedService
{
    public SubstitutedService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entity = await UnitOfWork.SubstitutedServiceRepository.GetNoTrackingByIdAsync(x => x.SubstitutedServiceId == id);
        return entity?.DisputeGuid ?? Guid.Empty;
    }

    public async Task<SubstitutedServicePostResponse> CreateAsync(Guid disputeGuid, SubstitutedServicePostRequest request)
    {
        var subService = MapperService.Map<SubstitutedServicePostRequest, Data.Model.SubstitutedService>(request);
        subService.DisputeGuid = disputeGuid;
        subService.IsDeleted = false;
        var subServiceResult = await UnitOfWork.SubstitutedServiceRepository.InsertAsync(subService);

        var participant = await UnitOfWork.ParticipantRepository.GetByIdAsync(request.ServiceToParticipantId);
        participant.IsSubService = true;
        UnitOfWork.ParticipantRepository.Attach(participant);

        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.SubstitutedService, SubstitutedServicePostResponse>(subServiceResult);
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int substitutedServiceId)
    {
        var substitutedService = await UnitOfWork.SubstitutedServiceRepository.GetByIdAsync(substitutedServiceId);
        if (substitutedService != null)
        {
            substitutedService.IsDeleted = true;
            UnitOfWork.SubstitutedServiceRepository.Attach(substitutedService);
            var result = await UnitOfWork.Complete();

            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<List<SubstitutedServicePostResponse>> GetByDisputeGuidAsync(Guid disputeGuid)
    {
        var subServices = await UnitOfWork.SubstitutedServiceRepository.FindAllAsync(x => x.DisputeGuid == disputeGuid);
        if (subServices != null)
        {
            return MapperService.Map<ICollection<Data.Model.SubstitutedService>, List<SubstitutedServicePostResponse>>(subServices);
        }

        return null;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.SubstitutedServiceRepository.GetLastModifiedDate((int)id);

        return lastModifiedDate;
    }

    public async Task<SubstitutedServicePostResponse> GetSubServiceAsync(int substitutedServiceId)
    {
        var substitutedService = await UnitOfWork.SubstitutedServiceRepository.GetByIdAsync(substitutedServiceId);
        return MapperService.Map<Data.Model.SubstitutedService, SubstitutedServicePostResponse>(substitutedService);
    }

    public async Task<SubstitutedServicePatchRequest> GetSubServiceForPatchAsync(int substitutedServiceId)
    {
        var substitutedService = await UnitOfWork.SubstitutedServiceRepository.GetByIdAsync(substitutedServiceId);
        return MapperService.Map<Data.Model.SubstitutedService, SubstitutedServicePatchRequest>(substitutedService);
    }

    public async Task<SubstitutedServicePostResponse> PatchAsync(int substitutedServiceId, SubstitutedServicePatchRequest subService)
    {
        var subServiceToPatch = await UnitOfWork.SubstitutedServiceRepository.GetByIdAsync(substitutedServiceId);
        MapperService.Map(subService, subServiceToPatch);

        UnitOfWork.SubstitutedServiceRepository.Attach(subServiceToPatch);
        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.SubstitutedService, SubstitutedServicePostResponse>(subServiceToPatch);
        }

        return null;
    }

    public async Task<List<ExternalSubstitutedServiceResponse>> GetExternalDisputeSubstitutedServices(Guid disputeGuid)
    {
        var subServices = await UnitOfWork.SubstitutedServiceRepository.FindAllAsync(x => x.DisputeGuid == disputeGuid);
        if (subServices != null)
        {
            return MapperService.Map<ICollection<Data.Model.SubstitutedService>, List<ExternalSubstitutedServiceResponse>>(subServices);
        }

        return null;
    }
}