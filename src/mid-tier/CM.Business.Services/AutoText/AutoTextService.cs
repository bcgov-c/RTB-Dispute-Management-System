using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.AutoText;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.AutoText;

public class AutoTextService : CmServiceBase, IAutoTextService
{
    public AutoTextService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<AutoTextResponse> CreateAsync(AutoTextPostRequest autoText)
    {
        var newAutoText = MapperService.Map<AutoTextPostRequest, Data.Model.AutoText>(autoText);
        newAutoText.IsDeleted = false;

        var autoTextResult = await UnitOfWork.AutoTextRepository.InsertAsync(newAutoText);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.AutoText, AutoTextResponse>(autoTextResult);
        }

        return null;
    }

    public async Task<AutoTextResponse> PatchAsync(int autoTextId, AutoTextPatchRequest autoTextPatchRequest)
    {
        var autoTextToPatch = await UnitOfWork.AutoTextRepository.GetNoTrackingByIdAsync(c => c.AutoTextId == autoTextId);
        MapperService.Map(autoTextPatchRequest, autoTextToPatch);

        UnitOfWork.AutoTextRepository.Attach(autoTextToPatch);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.AutoText, AutoTextResponse>(autoTextToPatch);
        }

        return null;
    }

    public async Task<AutoTextPatchRequest> GetForPatchAsync(int autoTextId)
    {
        var autoText = await UnitOfWork.AutoTextRepository
            .GetNoTrackingByIdAsync(c => c.AutoTextId == autoTextId);

        return MapperService.Map<Data.Model.AutoText, AutoTextPatchRequest>(autoText);
    }

    public async Task<bool> DeleteAsync(int autoTextId)
    {
        var autoText = await UnitOfWork.AutoTextRepository.GetByIdAsync(autoTextId);
        if (autoText != null)
        {
            autoText.IsDeleted = true;
            UnitOfWork.AutoTextRepository.Attach(autoText);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<AutoTextResponse> GetByIdAsync(int autoTextId)
    {
        var autoText = await UnitOfWork.AutoTextRepository.GetByIdAsync(autoTextId);
        if (autoText != null)
        {
            return MapperService.Map<Data.Model.AutoText, AutoTextResponse>(autoText);
        }

        return null;
    }

    public async Task<List<AutoTextResponse>> GetAllAsync(AutoTextGetRequest request)
    {
        var autoTexts = await UnitOfWork.AutoTextRepository.GetAllByRequest(request);
        if (autoTexts != null)
        {
            return MapperService.Map<List<Data.Model.AutoText>, List<AutoTextResponse>>(autoTexts);
        }

        return new List<AutoTextResponse>();
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.AutoTextRepository.GetLastModifiedDate((int)id);
        return lastModifiedDate;
    }
}