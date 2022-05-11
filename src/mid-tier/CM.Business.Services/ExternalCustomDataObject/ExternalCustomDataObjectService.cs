using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.ExternalCustomDataObject;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.ExternalCustomDataObject;

public class ExternalCustomDataObjectService : CmServiceBase, IExternalCustomDataObjectService
{
    public ExternalCustomDataObjectService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<ExternalCustomDataObjectResponse> CreateAsync(ExternalCustomDataObjectRequest externalCustomDataObjectRequest)
    {
        var newExternalCustomDataObject = MapperService.Map<ExternalCustomDataObjectRequest, Data.Model.ExternalCustomDataObject>(externalCustomDataObjectRequest);
        newExternalCustomDataObject.IsActive = true;
        await UnitOfWork.ExternalCustomDataObjectRepository.InsertAsync(newExternalCustomDataObject);

        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.ExternalCustomDataObject, ExternalCustomDataObjectResponse>(newExternalCustomDataObject);
        }

        return null;
    }

    public async Task<ExternalCustomDataObjectResponse> CreateAsync(Guid? sessionGuid, ExternalCustomDataObjectRequest externalCustomDataObjectRequest)
    {
        var newExternalCustomDataObject = MapperService.Map<ExternalCustomDataObjectRequest, Data.Model.ExternalCustomDataObject>(externalCustomDataObjectRequest);
        newExternalCustomDataObject.IsActive = true;
        newExternalCustomDataObject.SessionGuid = sessionGuid.GetValueOrDefault();
        await UnitOfWork.ExternalCustomDataObjectRepository.InsertAsync(newExternalCustomDataObject);

        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.ExternalCustomDataObject, ExternalCustomDataObjectResponse>(newExternalCustomDataObject);
        }

        return null;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.ExternalCustomDataObjectRepository.GetLastModifiedDate((int)id);
        return lastModifiedDate;
    }

    public async Task<ExternalCustomObjectPatchRequest> GetForPatchAsync(int externalCustomDataObjectId)
    {
        var externalCustomDataObject = await UnitOfWork.ExternalCustomDataObjectRepository.GetNoTrackingByIdAsync(
            cd => cd.ExternalCustomDataObjectId == externalCustomDataObjectId);
        return MapperService.Map<Data.Model.ExternalCustomDataObject, ExternalCustomObjectPatchRequest>(externalCustomDataObject);
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        return await System.Threading.Tasks.Task.FromResult(Guid.Empty);
    }

    public async Task<ExternalCustomDataObjectResponse> PatchAsync(int externalCustomDataObjectId, ExternalCustomObjectPatchRequest externalCustomDataObjectRequest)
    {
        var externalCustomObjectToPatch = await UnitOfWork.ExternalCustomDataObjectRepository.GetByIdAsync(externalCustomDataObjectId);

        MapperService.Map(externalCustomDataObjectRequest, externalCustomObjectToPatch);

        UnitOfWork.ExternalCustomDataObjectRepository.Attach(externalCustomObjectToPatch);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.ExternalCustomDataObject, ExternalCustomDataObjectResponse>(externalCustomObjectToPatch);
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int externalCustomDataObjectId)
    {
        var externalCustomDataObject = await UnitOfWork.ExternalCustomDataObjectRepository.GetByIdAsync(externalCustomDataObjectId);
        if (externalCustomDataObject != null)
        {
            externalCustomDataObject.IsDeleted = true;
            UnitOfWork.ExternalCustomDataObjectRepository.Attach(externalCustomDataObject);

            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<ExternalCustomDataObjectResponse> GetExternalCustomObject(int externalCustomDataObjectId)
    {
        var externalCustomDataObject = await UnitOfWork.ExternalCustomDataObjectRepository.GetByIdAsync(externalCustomDataObjectId);
        return MapperService.Map<Data.Model.ExternalCustomDataObject, ExternalCustomDataObjectResponse>(externalCustomDataObject);
    }

    public async Task<ExternalCustomDataObjectGetResponse> GetExternalCustomObjects(ExternalCustomObjectGetRequest request)
    {
        var result = new ExternalCustomDataObjectGetResponse();

        var predicate = PredicateBuilder.True<Data.Model.ExternalCustomDataObject>();

        if (request.CreatedDate > DateTime.MinValue)
        {
            predicate = predicate.And(x => x.CreatedDate == null || x.CreatedDate >= request.CreatedDate);
        }

        predicate = predicate.And(x => x.IsActive == request.IsActive);

        if (request.Statuses != null && request.Statuses.Any())
        {
            predicate = predicate.And(x => request.Statuses.Contains((byte)x.Status));
        }

        if (request.Types != null && request.Types.Any())
        {
            predicate = predicate.And(x => request.Types.Contains((ExternalCustomObjectType)x.Type));
        }

        var externalCustomObjects = await UnitOfWork.ExternalCustomDataObjectRepository
            .GetByPredicate(predicate, request.Count, request.Index, request.SortBy);
        var totalCount = await UnitOfWork.ExternalCustomDataObjectRepository
            .GetByPredicateTotalCount(predicate);

        var list = MapperService.Map<ICollection<Data.Model.ExternalCustomDataObject>, ICollection<ExternalCustomDataObjectResponse>>(externalCustomObjects).ToList();
        result.ExternalCustomDataObjects = list;
        result.TotalAvailableRecords = totalCount;

        return result;
    }

    public async Task<bool> IsSessionExists(Guid? sessionGuid)
    {
        var externalCustomDataObject = await UnitOfWork.ExternalCustomDataObjectRepository.GetBySessionGuidAsync(sessionGuid);

        return externalCustomDataObject != null;
    }

    public async Task<bool> CanSessionAccessToExternalCustomDataObject(int externalCustomDataObjectId, Guid? sessionGuid)
    {
        var externalCustomDataObject = await UnitOfWork
            .ExternalCustomDataObjectRepository
            .GetBySessionGuidAsync(sessionGuid, externalCustomDataObjectId);

        return externalCustomDataObject != null;
    }

    public async Task<string> GetRefreshToken(Guid sessionGuid)
    {
        var externalCustomDataObject = await UnitOfWork.ExternalCustomDataObjectRepository.GetBySessionGuidAsync(sessionGuid);

        return externalCustomDataObject?.RefreshToken;
    }

    public async Task<bool> SaveRefreshToken(Guid sessionGuid, string newRefreshToken)
    {
        var externalCustomDataObject = await UnitOfWork.ExternalCustomDataObjectRepository.GetBySessionGuidAsync(sessionGuid);

        externalCustomDataObject.RefreshToken = newRefreshToken;

        UnitOfWork.ExternalCustomDataObjectRepository.Attach(externalCustomDataObject);

        var result = await UnitOfWork.Complete();
        return result.CheckSuccess();
    }

    public async Task<bool> IsActiveExternalCustomObject(int externalCustomDataObjectId)
    {
        var externalCustomDataObject = await UnitOfWork.ExternalCustomDataObjectRepository.GetByIdAsync(externalCustomDataObjectId);
        return externalCustomDataObject.IsActive ?? false;
    }
}