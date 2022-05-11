using System.Threading.Tasks;
using CM.Business.Entities.Models.FilePackageService;
using CM.Business.Services.Base;

namespace CM.Business.Services.FilePackageService;

public interface IFilePackageServiceService : IServiceBase, IDisputeResolver
{
    Task<FilePackageServiceResponse> CreateAsync(int filePackageId, FilePackageServiceRequest request);

    Task<Data.Model.FilePackageService> GetNoTrackingFilePackageServiceAsync(int filePackageServiceId);

    Task<FilePackageServiceResponse> PatchAsync(int filePackageServiceId, FilePackageServicePatchRequest filePackageService);

    Task<bool> DeleteAsync(int filePackageServiceId);
}