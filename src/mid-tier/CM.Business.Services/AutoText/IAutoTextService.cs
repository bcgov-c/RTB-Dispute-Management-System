using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.AutoText;

namespace CM.Business.Services.AutoText;

public interface IAutoTextService : IServiceBase
{
    Task<AutoTextResponse> CreateAsync(AutoTextPostRequest autoText);

    Task<AutoTextResponse> PatchAsync(int autoTextId, AutoTextPatchRequest autoTextPatchRequest);

    Task<AutoTextPatchRequest> GetForPatchAsync(int autoTextId);

    Task<bool> DeleteAsync(int autoTextId);

    Task<AutoTextResponse> GetByIdAsync(int autoTextId);

    Task<List<AutoTextResponse>> GetAllAsync(AutoTextGetRequest request);
}