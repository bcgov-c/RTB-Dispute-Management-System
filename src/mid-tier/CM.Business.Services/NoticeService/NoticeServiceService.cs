using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.NoticeService;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.NoticeService;

public class NoticeServiceService : CmServiceBase, INoticeServiceService
{
    public NoticeServiceService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entityNoticeService = await UnitOfWork.NoticeServiceRepository.GetNoTrackingByIdAsync(x => x.NoticeServiceId == id);
        if (entityNoticeService != null)
        {
            var entityNotice = await UnitOfWork.NoticeRepository.GetNoTrackingByIdAsync(x => x.NoticeId == entityNoticeService.NoticeId);
            return entityNotice?.DisputeGuid ?? Guid.Empty;
        }

        return Guid.Empty;
    }

    public async Task<NoticeServiceResponse> CreateAsync(int noticeId, NoticeServiceRequest request)
    {
        var newNoticeService = MapperService.Map<NoticeServiceRequest, Data.Model.NoticeService>(request);
        newNoticeService.NoticeId = noticeId;
        newNoticeService.IsDeleted = false;
        var noticeServiceResult = await UnitOfWork.NoticeServiceRepository.InsertAsync(newNoticeService);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.NoticeService, NoticeServiceResponse>(noticeServiceResult);
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int noticeServiceId)
    {
        var noticeService = await UnitOfWork.NoticeServiceRepository.GetByIdAsync(noticeServiceId);
        if (noticeService != null)
        {
            noticeService.IsDeleted = true;
            UnitOfWork.NoticeServiceRepository.Attach(noticeService);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<Data.Model.NoticeService> PatchAsync(Data.Model.NoticeService noticeService)
    {
        UnitOfWork.NoticeServiceRepository.Attach(noticeService);
        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            return noticeService;
        }

        return null;
    }

    public async Task<Data.Model.NoticeService> GetNoTrackingNoticeServiceAsync(int noticeServiceId)
    {
        var noticeService = await UnitOfWork.NoticeServiceRepository.GetNoTrackingByIdAsync(r =>
            r.NoticeServiceId == noticeServiceId);
        return noticeService;
    }

    public async Task<Data.Model.NoticeService> GetNoticeServiceAsync(int noticeServiceId)
    {
        var noticeService = await UnitOfWork.NoticeServiceRepository.GetNServiceWithNotice(noticeServiceId);
        return noticeService;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object noticeServiceId)
    {
        var lastModifiedDate = await UnitOfWork.NoticeServiceRepository.GetLastModifiedDate((int)noticeServiceId);

        return lastModifiedDate;
    }
}