using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.CustomDataObject;
using CM.Business.Services.Base;

namespace CM.Business.Services.CustomDataObject;

public interface ICustomDataObjectService : IServiceBase, IDisputeResolver
{
    Task<CustomDataObjectResponse> CreateAsync(Guid disputeGuid, CustomDataObjectRequest customDataObjectRequest);

    Task<CustomObjectPatchRequest> GetForPatchAsync(int customObjectId);

    Task<CustomDataObjectResponse> PatchAsync(int customObjectId, CustomObjectPatchRequest customerObjectToPatch);

    Task<bool> DeleteAsync(int customObjectId);

    Task<bool> IsActiveCustomObject(int customObjectId);

    Task<CustomDataObjectResponse> GetCustomObject(int customObjectId);

    Task<List<CustomDataObjectResponse>> GetCustomObjects(Guid disputeGuid, CustomObjectGetRequest request);
}