using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Files;
using CM.Business.Services.Base;
using CM.Data.Model;

namespace CM.Business.Services.Files;

public interface IFileDescriptionService : IServiceBase, IDisputeResolver
{
    Task<FileDescriptionResponse> CreateAsync(Guid disputeGuid, FileDescriptionRequest fileDescription);

    Task<bool> DeleteAsync(int fileDescriptionId);

    Task<FileDescription> PatchAsync(int fileDescriptionId, FileDescription fileDescription);

    Task<FileDescriptionResponse> GetAsync(int fileDescriptionId);

    Task<FileDescriptionListResponse> GetDisputeFileDescriptionAsync(Guid disputeGuid, int count, int index);

    Task<FileDescription> GetTrackingFileDescriptionAsync(int fileDescriptionId);

    Task<bool> FileDescriptionExists(int fileDescriptionId);

    Task<bool> FileDescriptionExists(Guid disputeGuid, int fileDescriptionId);
}