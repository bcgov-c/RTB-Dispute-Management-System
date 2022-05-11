using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.FilePackageService;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;
using DM = CM.Data.Model;

namespace CM.Business.Services.FilePackageService;

public class FilePackageServiceService : CmServiceBase, IFilePackageServiceService
{
    public FilePackageServiceService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entityFilePackageService = await UnitOfWork.FilePackageServiceRepository.GetNoTrackingByIdAsync(x => x.FilePackageServiceId == id);
        if (entityFilePackageService != null)
        {
            var entityFilePackage = await UnitOfWork.FilePackageRepository.GetNoTrackingByIdAsync(x => x.FilePackageId == entityFilePackageService.FilePackageId);
            return entityFilePackage?.DisputeGuid ?? Guid.Empty;
        }

        return Guid.Empty;
    }

    public async Task<FilePackageServiceResponse> CreateAsync(int filePackageId, FilePackageServiceRequest request)
    {
        var newFilePackageService = MapperService.Map<FilePackageServiceRequest, DM.FilePackageService>(request);
        newFilePackageService.FilePackageId = filePackageId;
        newFilePackageService.IsDeleted = false;

        var filePackageServiceResult = await UnitOfWork.FilePackageServiceRepository.InsertAsync(newFilePackageService);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<DM.FilePackageService, FilePackageServiceResponse>(filePackageServiceResult);
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int filePackageServiceId)
    {
        var filePackageServiceExists = await UnitOfWork.FilePackageServiceRepository.CheckFilePackageServiceExistenceAsync(filePackageServiceId);
        if (filePackageServiceExists)
        {
            await UnitOfWork.FilePackageServiceRepository.Delete(filePackageServiceId);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.FilePackageServiceRepository.GetLastModifiedDateAsync((int)id);
        return lastModifiedDate;
    }

    public async Task<DM.FilePackageService> GetNoTrackingFilePackageServiceAsync(int filePackageServiceId)
    {
        var filePackageService = await UnitOfWork.FilePackageServiceRepository.GetNoTrackingByIdAsync(p => p.FilePackageServiceId == filePackageServiceId);
        return filePackageService;
    }

    public async Task<FilePackageServiceResponse> PatchAsync(int filePackageServiceId, FilePackageServicePatchRequest filePackageServicePatchRequest)
    {
        var filePackageService = await UnitOfWork.FilePackageServiceRepository.GetByIdAsync(filePackageServiceId);

        MapperService.Map(filePackageServicePatchRequest, filePackageService);

        UnitOfWork.FilePackageServiceRepository.Attach(filePackageService);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<DM.FilePackageService, FilePackageServiceResponse>(filePackageService);
        }

        return null;
    }
}