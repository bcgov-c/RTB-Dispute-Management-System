using System.Threading.Tasks;
using CM.Business.Entities.Models.FilePackageService;
using CM.Business.Services.Base;
using CM.Common.Utilities;

namespace CM.Business.Services.FilePackageService;

public interface IFilePackageServiceService : IServiceBase, IDisputeResolver
{
    Task<FilePackageServiceResponse> CreateAsync(int filePackageId, FilePackageServiceRequest request);

    Task<Data.Model.FilePackageService> GetNoTrackingFilePackageServiceAsync(int filePackageServiceId);

    Task<FilePackageServiceResponse> PatchAsync(int filePackageServiceId, FilePackageServicePatchRequest filePackageService, ServiceChangeType? serviceChangeType);

    Task<bool> DeleteAsync(int filePackageServiceId);

    public ServiceChangeType? GetServiceAuditLogUseCase(Data.Model.FilePackageService originalFilePackageService, FilePackageServicePatchRequest filePackageServiceToPatch);
}