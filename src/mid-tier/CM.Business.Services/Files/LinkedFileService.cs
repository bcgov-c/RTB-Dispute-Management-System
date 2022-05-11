using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Files;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.Files;

public class LinkedFileService : CmServiceBase, ILinkedFileService
{
    public LinkedFileService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entity = await UnitOfWork.LinkedFileRepository.GetNoTrackingByIdAsync(x => x.LinkedFileId == id);
        return entity?.DisputeGuid ?? Guid.Empty;
    }

    public async Task<LinkedFileResponse> CreateAsync(Guid disputeGuid, LinkedFileRequest linkFile)
    {
        var newLinkFile = MapperService.Map<LinkedFileRequest, LinkedFile>(linkFile);

        newLinkFile.DisputeGuid = disputeGuid;
        newLinkFile.IsDeleted = false;

        var linkFileResult = await UnitOfWork.LinkedFileRepository.InsertAsync(newLinkFile);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<LinkedFile, LinkedFileResponse>(linkFileResult);
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int linkFileId)
    {
        var linkedFile = await UnitOfWork.LinkedFileRepository.GetByIdAsync(linkFileId);
        if (linkedFile != null)
        {
            linkedFile.IsDeleted = true;
            UnitOfWork.LinkedFileRepository.Attach(linkedFile);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<LinkedFileListResponse> GetByDisputeAsync(Guid disputeGuid, int count, int index)
    {
        if (count == 0)
        {
            count = int.MaxValue;
        }

        var disputeLinkedFiles = await UnitOfWork.LinkedFileRepository.GetDisputeLinkedFilesAsync(disputeGuid);

        if (disputeLinkedFiles != null)
        {
            var indexedLinkedFiles = disputeLinkedFiles.AsQueryable().ApplyPaging(count, index);
            var linkedFileListResponse = new LinkedFileListResponse
            {
                TotalAvailableRecords = disputeLinkedFiles.Count,
                LinkedFileResponses = MapperService.Map<List<LinkedFile>, List<LinkedFileResponse>>(indexedLinkedFiles.ToList())
            };

            return linkedFileListResponse;
        }

        return new LinkedFileListResponse();
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.LinkedFileRepository.GetLastModifiedDateAsync((int)id);
        return lastModifiedDate;
    }
}