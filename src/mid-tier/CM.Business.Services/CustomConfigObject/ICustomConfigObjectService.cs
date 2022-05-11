using System.Threading.Tasks;
using CM.Business.Entities.Models.CustomConfigObject;

namespace CM.Business.Services.CustomConfigObject;

public interface ICustomConfigObjectService : IServiceBase
{
    Task<CustomConfigObjectResponse> CreateAsync(CustomConfigObjectPostRequest customConfigObjectRequest);

    Task<CustomConfigObjectResponse> GetForPatchAsync(int customConfigObjectId);

    Task<CustomConfigObjectResponse> PatchAsync(int customConfigObjectId, CustomConfigObjectPatchRequest customConfigObjectToPatch);

    Task<bool> DeleteAsync(int customConfigObjectId);

    Task<CustomConfigObjectResponse> GetCustomObject(int customConfigObjectId);

    Task<CustomConfigObjectGetResponse> GetPublicCustomObjects(CustomConfigObjectGetRequest request);

    Task<CustomConfigObjectGetResponse> GetPrivateCustomObjects(CustomConfigObjectGetRequest request);

    Task<bool> IsDuplicateTitleExists(string objectTitle);
}