using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Files;
using CM.Business.Services.Base;
using CM.Data.Model;

namespace CM.Business.Services.Files;

public interface IFilePackageService : IServiceBase, IDisputeResolver
{
    Task<FilePackageResponse> CreateAsync(Guid disputeGuid, FilePackageRequest request);

    Task<FilePackageResponse> PatchAsync(FilePackage filePackage);

    Task<FilePackageResponse> GetByIdAsync(int filePackageId);

    Task<List<FilePackageResponse>> GetByDisputeGuidAsync(Guid disputeGuid, int count, int index);

    Task<FilePackage> GetTrackingFilePackageAsync(int filePackageId);

    Task<bool> DeleteAsync(int filePackageId);
}