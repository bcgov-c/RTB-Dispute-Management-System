using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.OutcomeDocument;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.OutcomeDocument;

public class OutcomeDocContentService : CmServiceBase, IOutcomeDocContentService
{
    public OutcomeDocContentService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entityOutcomeDocContent = await UnitOfWork.OutcomeDocContentRepository.GetNoTrackingByIdAsync(c => c.OutcomeDocContentId == id);
        if (entityOutcomeDocContent != null)
        {
            var entityOutcomeDocFile = await UnitOfWork.OutcomeDocFileRepository.GetNoTrackingByIdAsync(c => c.OutcomeDocFileId == entityOutcomeDocContent.OutcomeDocFileId);
            return entityOutcomeDocFile.DisputeGuid;
        }

        return Guid.Empty;
    }

    public async Task<OutcomeDocContentResponse> CreateAsync(int outcomeDocFileId, OutcomeDocContentPostRequest outcomeDocContent)
    {
        var newOutcomeDocContent = MapperService.Map<OutcomeDocContentPostRequest, OutcomeDocContent>(outcomeDocContent);
        newOutcomeDocContent.OutcomeDocFileId = outcomeDocFileId;
        newOutcomeDocContent.IsDeleted = false;

        var outcomeDocContentResult = await UnitOfWork.OutcomeDocContentRepository.InsertAsync(newOutcomeDocContent);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<OutcomeDocContent, OutcomeDocContentResponse>(outcomeDocContentResult);
        }

        return null;
    }

    public async Task<OutcomeDocContent> PatchAsync(OutcomeDocContent outcomeDocContent)
    {
        UnitOfWork.OutcomeDocContentRepository.Attach(outcomeDocContent);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return outcomeDocContent;
        }

        return null;
    }

    public async Task<OutcomeDocContent> GetNoTrackingOutcomeDocContentAsync(int outcomeDocContentId)
    {
        var outcomeDocContent = await UnitOfWork.OutcomeDocContentRepository.GetNoTrackingByIdAsync(r =>
            r.OutcomeDocContentId == outcomeDocContentId);
        return outcomeDocContent;
    }

    public async Task<bool> DeleteAsync(int outcomeDocContentId)
    {
        var outcomeDocContent = await UnitOfWork.OutcomeDocContentRepository.GetByIdAsync(outcomeDocContentId);
        if (outcomeDocContent != null)
        {
            outcomeDocContent.IsDeleted = true;
            UnitOfWork.OutcomeDocContentRepository.Attach(outcomeDocContent);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.OutcomeDocContentRepository.GetLastModifiedDate((int)id);
        return lastModifiedDate;
    }
}