using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.CustomConfigObject;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.CustomConfigObject;

public class CustomConfigObjectService : CmServiceBase, ICustomConfigObjectService
{
    public CustomConfigObjectService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<CustomConfigObjectResponse> CreateAsync(CustomConfigObjectPostRequest customConfigObjectRequest)
    {
        var newCustomConfigObject = MapperService.Map<CustomConfigObjectPostRequest, Data.Model.CustomConfigObject>(customConfigObjectRequest);
        newCustomConfigObject.IsDeleted = false;
        newCustomConfigObject.IsActive = true;

        await UnitOfWork.CustomConfigObjectRepository.InsertAsync(newCustomConfigObject);

        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.CustomConfigObject, CustomConfigObjectResponse>(newCustomConfigObject);
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int customConfigObjectId)
    {
        var customConfigObject = await UnitOfWork.CustomConfigObjectRepository.GetByIdAsync(customConfigObjectId);
        if (customConfigObject != null)
        {
            customConfigObject.IsDeleted = true;
            UnitOfWork.CustomConfigObjectRepository.Attach(customConfigObject);

            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<CustomConfigObjectResponse> GetCustomObject(int customConfigObjectId)
    {
        var customConfigObject = await UnitOfWork.CustomConfigObjectRepository.GetByIdAsync(customConfigObjectId);
        if (customConfigObject != null)
        {
            return MapperService.Map<Data.Model.CustomConfigObject, CustomConfigObjectResponse>(customConfigObject);
        }

        return null;
    }

    public async Task<CustomConfigObjectResponse> GetForPatchAsync(int customConfigObjectId)
    {
        var customConfigObject = await UnitOfWork.CustomConfigObjectRepository.GetNoTrackingByIdAsync(
            cd => cd.CustomConfigObjectId == customConfigObjectId);
        return MapperService.Map<Data.Model.CustomConfigObject, CustomConfigObjectResponse>(customConfigObject);
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.CustomConfigObjectRepository.GetLastModifiedDate((int)id);
        return lastModifiedDate;
    }

    public async Task<CustomConfigObjectGetResponse> GetPrivateCustomObjects(CustomConfigObjectGetRequest request)
    {
        var result = new CustomConfigObjectGetResponse();

        var customConfigObjects = await UnitOfWork.CustomConfigObjectRepository.GetPrivateCustomObjects(request);
        result.CustomConfigObjects = MapperService.Map<List<Data.Model.CustomConfigObject>, List<CustomConfigObjectResponse>>(customConfigObjects);
        result.TotalAvailableRecords = customConfigObjects.Count;

        return result;
    }

    public async Task<CustomConfigObjectGetResponse> GetPublicCustomObjects(CustomConfigObjectGetRequest request)
    {
        var result = new CustomConfigObjectGetResponse();

        var customConfigObjects = await UnitOfWork.CustomConfigObjectRepository.GetPublicCustomObjects(request);
        result.CustomConfigObjects = MapperService.Map<List<Data.Model.CustomConfigObject>, List<CustomConfigObjectResponse>>(customConfigObjects);
        result.TotalAvailableRecords = customConfigObjects.Count;

        return result;
    }

    public async Task<bool> IsDuplicateTitleExists(string objectTitle)
    {
        var isDuplicatedTitleExists = await UnitOfWork.CustomConfigObjectRepository.IsDuplicateTitleExists(objectTitle);
        return isDuplicatedTitleExists;
    }

    public async Task<CustomConfigObjectResponse> PatchAsync(int customConfigObjectId, CustomConfigObjectPatchRequest customerConfigObjectRequest)
    {
        var customConfigObjectToPatch = await UnitOfWork.CustomConfigObjectRepository.GetByIdAsync(customConfigObjectId);

        MapperService.Map(customerConfigObjectRequest, customConfigObjectToPatch);

        UnitOfWork.CustomConfigObjectRepository.Attach(customConfigObjectToPatch);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.CustomConfigObject, CustomConfigObjectResponse>(customConfigObjectToPatch);
        }

        return null;
    }
}