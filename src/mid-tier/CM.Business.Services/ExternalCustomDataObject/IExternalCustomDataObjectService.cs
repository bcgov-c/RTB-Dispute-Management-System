using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.ExternalCustomDataObject;
using CM.Business.Services.Base;

namespace CM.Business.Services.ExternalCustomDataObject;

public interface IExternalCustomDataObjectService : IServiceBase, IDisputeResolver
{
    Task<ExternalCustomDataObjectResponse> CreateAsync(
        ExternalCustomDataObjectRequest externalCustomDataObjectRequest);

    Task<ExternalCustomDataObjectResponse> CreateAsync(Guid? sessionGuid,
        ExternalCustomDataObjectRequest externalCustomDataObjectRequest);

    Task<ExternalCustomObjectPatchRequest> GetForPatchAsync(int externalCustomDataObjectId);

    Task<ExternalCustomDataObjectResponse> PatchAsync(int externalCustomDataObjectId,
        ExternalCustomObjectPatchRequest externalCustomDataObjectToPatch);

    Task<bool> DeleteAsync(int externalCustomDataObjectId);

    Task<ExternalCustomDataObjectResponse> GetExternalCustomObject(int externalCustomDataObjectId);

    Task<ExternalCustomDataObjectGetResponse> GetExternalCustomObjects(ExternalCustomObjectGetRequest request);

    Task<bool> IsSessionExists(Guid? sessionGuid);

    Task<bool> CanSessionAccessToExternalCustomDataObject(int externalCustomDataObjectId, Guid? sessionGuid);

    Task<string> GetRefreshToken(Guid sessionGuid);

    Task<bool> SaveRefreshToken(Guid sessionGuid, string newRefreshToken);
}