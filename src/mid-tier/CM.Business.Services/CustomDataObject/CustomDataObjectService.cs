using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.CustomDataObject;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.CustomDataObject;

public class CustomDataObjectService : CmServiceBase, ICustomDataObjectService
{
    public CustomDataObjectService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<CustomDataObjectResponse> CreateAsync(Guid disputeGuid, CustomDataObjectRequest customDataObjectRequest)
    {
        var latestCustomDataObject = await UnitOfWork.CustomDataObjectRepository.GetCustomDataObjectByGuid(disputeGuid, customDataObjectRequest.ObjectType);

        if (latestCustomDataObject != null)
        {
            latestCustomDataObject.IsActive = false;
            UnitOfWork.CustomDataObjectRepository.Attach(latestCustomDataObject);
        }

        var newCustomDataObject = MapperService.Map<CustomDataObjectRequest, Data.Model.CustomDataObject>(customDataObjectRequest);
        newCustomDataObject.DisputeGuid = disputeGuid;
        newCustomDataObject.IsActive = true;

        await UnitOfWork.CustomDataObjectRepository.InsertAsync(newCustomDataObject);

        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.CustomDataObject, CustomDataObjectResponse>(newCustomDataObject);
        }

        return null;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.CustomDataObjectRepository.GetLastModifiedDate((int)id);
        return lastModifiedDate;
    }

    public async Task<CustomObjectPatchRequest> GetForPatchAsync(int customObjectId)
    {
        var customObject = await UnitOfWork.CustomDataObjectRepository.GetNoTrackingByIdAsync(
            cd => cd.CustomDataObjectId == customObjectId);
        return MapperService.Map<Data.Model.CustomDataObject, CustomObjectPatchRequest>(customObject);
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entityCustomObject = await UnitOfWork.CustomDataObjectRepository.GetNoTrackingByIdAsync(c => c.CustomDataObjectId == id);
        if (entityCustomObject != null)
        {
            return entityCustomObject.DisputeGuid;
        }

        return Guid.Empty;
    }

    public async Task<CustomDataObjectResponse> PatchAsync(int customObjectId, CustomObjectPatchRequest customerObjectRequest)
    {
        var customObjectToPatch = await UnitOfWork.CustomDataObjectRepository.GetByIdAsync(customObjectId);

        MapperService.Map(customerObjectRequest, customObjectToPatch);

        UnitOfWork.CustomDataObjectRepository.Attach(customObjectToPatch);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.CustomDataObject, CustomDataObjectResponse>(customObjectToPatch);
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int customObjectId)
    {
        var customObject = await UnitOfWork.CustomDataObjectRepository.GetByIdAsync(customObjectId);
        if (customObject != null)
        {
            customObject.IsDeleted = true;
            UnitOfWork.CustomDataObjectRepository.Attach(customObject);

            var prevCustomObject = await UnitOfWork.CustomDataObjectRepository.GetPreviousRecord(customObjectId);

            if (prevCustomObject != null)
            {
                prevCustomObject.IsActive = true;
                UnitOfWork.CustomDataObjectRepository.Attach(customObject);
            }

            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<bool> IsActiveCustomObject(int customObjectId)
    {
        var customObject = await UnitOfWork.CustomDataObjectRepository.GetByIdAsync(customObjectId);
        return customObject.IsActive ?? false;
    }

    public async Task<CustomDataObjectResponse> GetCustomObject(int customObjectId)
    {
        var customObject = await UnitOfWork.CustomDataObjectRepository.GetByIdAsync(customObjectId);
        return MapperService.Map<Data.Model.CustomDataObject, CustomDataObjectResponse>(customObject);
    }

    public async Task<List<CustomDataObjectResponse>> GetCustomObjects(Guid disputeGuid, CustomObjectGetRequest request)
    {
        var customObjects = await UnitOfWork.CustomDataObjectRepository.FindAllAsync(x => x.DisputeGuid == disputeGuid);

        switch (request.IsActive)
        {
            case false:
                customObjects = customObjects.Where(x => x.IsActive == false).ToList();

                break;
            case true:
                customObjects = customObjects.Where(x => x.IsActive == true).ToList();

                break;
        }

        if (request.ObjectTypes is { Length: > 0 })
        {
            customObjects = customObjects.Where(x => request.ObjectTypes.Contains(x.ObjectType)).ToList();
        }

        return MapperService.Map<ICollection<Data.Model.CustomDataObject>, ICollection<CustomDataObjectResponse>>(customObjects).ToList();
    }
}