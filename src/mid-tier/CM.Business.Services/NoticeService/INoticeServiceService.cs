using System.Threading.Tasks;
using CM.Business.Entities.Models.NoticeService;
using CM.Business.Services.Base;
using CM.Common.Utilities;

namespace CM.Business.Services.NoticeService;

public interface INoticeServiceService : IServiceBase, IDisputeResolver
{
    Task<NoticeServiceResponse> CreateAsync(int noticeId, NoticeServiceRequest request);

    Task<bool> DeleteAsync(int noticeServiceId);

    Task<Data.Model.NoticeService> PatchAsync(Data.Model.NoticeService noticeService, ServiceChangeType? serviceChangeType);

    Task<Data.Model.NoticeService> GetNoTrackingNoticeServiceAsync(int noticeServiceId);

    Task<Data.Model.NoticeService> GetNoticeServiceAsync(int noticeServiceId);

    ServiceChangeType? GetServiceAuditLogUseCase(Data.Model.NoticeService originalNoticeService, NoticeServicePatchRequest noticeServiceToPatch);
}