using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.OnlineMeeting;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.OnlineMeeting
{
    public class OnlineMeetingService : CmServiceBase, IOnlineMeetingService
    {
        public OnlineMeetingService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
        {
        }

        public async Task<OnlineMeetingResponse> CreateAsync(OnlineMeetingPostRequest request)
        {
            var newOnlineMeeting = MapperService.Map<OnlineMeetingPostRequest, Data.Model.OnlineMeeting>(request);
            var onlineMeetingResult = await UnitOfWork.OnlineMeetingRepository.InsertAsync(newOnlineMeeting);
            var result = await UnitOfWork.Complete();
            if (result.CheckSuccess())
            {
                return MapperService.Map<Data.Model.OnlineMeeting, OnlineMeetingResponse>(onlineMeetingResult);
            }

            return null;
        }

        public async Task<DisputeLinkResponse> CreateDisputeLinkAsync(DisputeLinkPostRequest request)
        {
            var newDisputeLink = MapperService.Map<DisputeLinkPostRequest, DisputeLink>(request);
            newDisputeLink.DisputeLinkStatus = DisputeLinkStatus.Active;
            var disputeLinkResult = await UnitOfWork.DisputeLinkRepository.InsertAsync(newDisputeLink);
            var result = await UnitOfWork.Complete();
            if (result.CheckSuccess())
            {
                return MapperService.Map<DisputeLink, DisputeLinkResponse>(disputeLinkResult);
            }

            return null;
        }

        public async Task<bool> DeleteAsync(int onlineMeetingId)
        {
            var onlineMeeting = await UnitOfWork.OnlineMeetingRepository.GetByIdAsync(onlineMeetingId);
            if (onlineMeeting != null)
            {
                onlineMeeting.IsDeleted = true;
                UnitOfWork.OnlineMeetingRepository.Attach(onlineMeeting);
                var result = await UnitOfWork.Complete();
                return result.CheckSuccess();
            }

            return false;
        }

        public async Task<bool> DeleteDisputeLinkAsync(int disputeLinkId)
        {
            var disputeLink = await UnitOfWork.DisputeLinkRepository.GetByIdAsync(disputeLinkId);
            if (disputeLink != null)
            {
                disputeLink.IsDeleted = true;
                UnitOfWork.DisputeLinkRepository.Attach(disputeLink);
                var result = await UnitOfWork.Complete();
                return result.CheckSuccess();
            }

            return false;
        }

        public async Task<OnlineMeetingResponse> GetByIdAsync(int onlineMeetingId)
        {
            var onlineMeeting = await UnitOfWork.OnlineMeetingRepository.GetByIdAsync(onlineMeetingId);
            if (onlineMeeting != null)
            {
                return MapperService.Map<Data.Model.OnlineMeeting, OnlineMeetingResponse>(onlineMeeting);
            }

            return null;
        }

        public async Task<List<DisputeLinkResponse>> GetDisputeLinkByDisputeAsync(Guid disputeGuid, DisputeLinkGetRequest request)
        {
            var disputeLinks = await UnitOfWork.DisputeLinkRepository.GetByDisputeAsync(disputeGuid, request);
            if (disputeLinks != null)
            {
                return MapperService.Map<List<DisputeLink>, List<DisputeLinkResponse>>(disputeLinks);
            }

            return new List<DisputeLinkResponse>();
        }

        public async Task<DateTime?> GetLastModifiedDateAsync(object onlineMeetingId)
        {
            var lastModifiedDate = await UnitOfWork.OnlineMeetingRepository.GetLastModifiedDate((int)onlineMeetingId);

            return lastModifiedDate;
        }

        public async Task<Data.Model.OnlineMeeting> GetNoTrackingAsync(int onlineMeetingId)
        {
            var onlineMeeting = await UnitOfWork.OnlineMeetingRepository.GetNoTrackingByIdAsync(x => x.OnlineMeetingId == onlineMeetingId);
            return onlineMeeting;
        }

        public async Task<DisputeLink> GetNoTrackingDisputeLinkAsync(int disputeLinkId)
        {
            var disputeLink = await UnitOfWork.DisputeLinkRepository.GetNoTrackingByIdAsync(x => x.DisputeLinkId == disputeLinkId);
            return disputeLink;
        }

        public async Task<bool> IsExistedDisputeLink(DisputeLinkRole disputeLinkRole, int onlineMeetingId)
        {
            var existed = await UnitOfWork.DisputeLinkRepository.IsExists(disputeLinkRole, onlineMeetingId);
            return existed;
        }

        public async Task<OnlineMeetingResponse> PatchAsync(int onlineMeetingId, OnlineMeetingPatchRequest request)
        {
            var onlineMeetingToPatch = await UnitOfWork.OnlineMeetingRepository.GetNoTrackingByIdAsync(r => r.OnlineMeetingId == onlineMeetingId);
            MapperService.Map(request, onlineMeetingToPatch);

            UnitOfWork.OnlineMeetingRepository.Attach(onlineMeetingToPatch);
            var result = await UnitOfWork.Complete();
            if (result.CheckSuccess())
            {
                return MapperService.Map<Data.Model.OnlineMeeting, OnlineMeetingResponse>(onlineMeetingToPatch);
            }

            return null;
        }

        public async Task<DisputeLinkResponse> PatchDisputeLinkAsync(int disputeLinkId, DisputeLinkPatchRequest request)
        {
            var disputeLinkToPatch = await UnitOfWork.DisputeLinkRepository.GetNoTrackingByIdAsync(r => r.DisputeLinkId == disputeLinkId);
            MapperService.Map(request, disputeLinkToPatch);

            UnitOfWork.DisputeLinkRepository.Attach(disputeLinkToPatch);
            var result = await UnitOfWork.Complete();
            if (result.CheckSuccess())
            {
                return MapperService.Map<DisputeLink, DisputeLinkResponse>(disputeLinkToPatch);
            }

            return null;
        }

        public async Task<Guid> ResolveDisputeGuid(int id)
        {
            var entity = await UnitOfWork.DisputeLinkRepository.GetNoTrackingByIdAsync(x => x.DisputeLinkId == id);
            return entity?.DisputeGuid ?? Guid.Empty;
        }
    }
}
