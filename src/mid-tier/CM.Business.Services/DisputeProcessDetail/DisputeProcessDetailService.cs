using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.DisputeProcessDetail;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.DisputeProcessDetail;

public class DisputeProcessDetailService : CmServiceBase, IDisputeProcessDetailService
{
    public DisputeProcessDetailService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entity = await UnitOfWork.DisputeProcessDetailRepository.GetNoTrackingByIdAsync(c => c.DisputeProcessDetailId == id);
        return entity?.DisputeGuid ?? Guid.Empty;
    }

    public async Task<DisputeProcessDetailResponse> CreateAsync(Guid disputeGuid, DisputeProcessDetailPostRequest request)
    {
        var disputeProcessDetail =
            MapperService.Map<DisputeProcessDetailPostRequest, Data.Model.DisputeProcessDetail>(request);
        disputeProcessDetail.DisputeGuid = disputeGuid;
        disputeProcessDetail.IsDeleted = false;

        var disputeProcessDetailResult = await UnitOfWork.DisputeProcessDetailRepository.InsertAsync(disputeProcessDetail);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.DisputeProcessDetail, DisputeProcessDetailResponse>(disputeProcessDetailResult);
        }

        return null;
    }

    public async Task<DisputeProcessDetailResponse> PatchAsync(int disputeProcessDetailId, DisputeProcessDetailPatchRequest request)
    {
        var disputeProcessDetailToPatch = await UnitOfWork.DisputeProcessDetailRepository.GetNoTrackingByIdAsync(c => c.DisputeProcessDetailId == disputeProcessDetailId);
        MapperService.Map(request, disputeProcessDetailToPatch);

        UnitOfWork.DisputeProcessDetailRepository.Attach(disputeProcessDetailToPatch);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.DisputeProcessDetail, DisputeProcessDetailResponse>(disputeProcessDetailToPatch);
        }

        return null;
    }

    public async Task<DisputeProcessDetailPatchRequest> GetForPatchAsync(int disputeProcessDetailId)
    {
        var disputeProcessDetailToPatch = await UnitOfWork.DisputeProcessDetailRepository.GetNoTrackingByIdAsync(
            c => c.DisputeProcessDetailId == disputeProcessDetailId);
        return MapperService.Map<Data.Model.DisputeProcessDetail, DisputeProcessDetailPatchRequest>(disputeProcessDetailToPatch);
    }

    public async Task<bool> DeleteAsync(int disputeProcessDetailId)
    {
        var disputeProcessDetail = await UnitOfWork.DisputeProcessDetailRepository.GetByIdAsync(disputeProcessDetailId);
        if (disputeProcessDetail != null)
        {
            disputeProcessDetail.IsDeleted = true;
            UnitOfWork.DisputeProcessDetailRepository.Attach(disputeProcessDetail);
            var result = await UnitOfWork.Complete();

            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<DisputeProcessDetailResponse> GetByIdAsync(int disputeProcessDetailId)
    {
        var disputeProcessDetail = await UnitOfWork.DisputeProcessDetailRepository.GetByIdAsync(disputeProcessDetailId);
        if (disputeProcessDetail != null)
        {
            return MapperService.Map<Data.Model.DisputeProcessDetail, DisputeProcessDetailResponse>(disputeProcessDetail);
        }

        return null;
    }

    public async Task<ICollection<DisputeProcessDetailResponse>> GetAllAsync(Guid disputeGuid)
    {
        var disputeProcessDetails = await UnitOfWork.DisputeProcessDetailRepository.FindAllAsync(d => d.DisputeGuid == disputeGuid);
        return MapperService.Map<ICollection<Data.Model.DisputeProcessDetail>, ICollection<DisputeProcessDetailResponse>>(disputeProcessDetails);
    }

    public async Task<bool> AssociatedProcessIsUsed(byte associatedProcess, Guid disputeGuid)
    {
        var disputeStatusProcesses = await UnitOfWork.DisputeStatusRepository.GetDisputeProcesses(disputeGuid);
        if (disputeStatusProcesses != null)
        {
            if (disputeStatusProcesses.Contains(associatedProcess))
            {
                return true;
            }

            return false;
        }

        return false;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.DisputeProcessDetailRepository.GetLastModifiedDate((int)id);
        return lastModifiedDate;
    }
}