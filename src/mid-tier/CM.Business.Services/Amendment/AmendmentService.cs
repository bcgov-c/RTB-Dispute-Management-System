using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Amendment;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.Amendment;

public class AmendmentService : CmServiceBase, IAmendmentService
{
    public AmendmentService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entity = await UnitOfWork.AmendmentRepository.GetNoTrackingByIdAsync(x => x.AmendmentId == id);
        return entity?.DisputeGuid ?? Guid.Empty;
    }

    public async Task<AmendmentResponse> CreateAsync(Guid disputeGuid, AmendmentRequest request)
    {
        var newAmendment = MapperService.Map<AmendmentRequest, Data.Model.Amendment>(request);
        newAmendment.DisputeGuid = disputeGuid;
        var amendmentResult = await UnitOfWork.AmendmentRepository.InsertAsync(newAmendment);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.Amendment, AmendmentResponse>(amendmentResult);
        }

        return null;
    }

    public async Task<AmendmentResponse> PatchAsync(int amendmentId, AmendmentRequest amendmentRequest)
    {
        var amendmentToPatch = await UnitOfWork.AmendmentRepository
            .GetByIdAsync(amendmentId);

        MapperService.Map(amendmentRequest, amendmentToPatch);

        UnitOfWork.AmendmentRepository.Attach(amendmentToPatch);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.Amendment, AmendmentResponse>(amendmentToPatch);
        }

        return null;
    }

    public async Task<AmendmentRequest> GetForPatchAsync(int amendmentId)
    {
        var amendment = await UnitOfWork.AmendmentRepository
            .GetNoTrackingByIdAsync(c => c.AmendmentId == amendmentId);
        return MapperService.Map<Data.Model.Amendment, AmendmentRequest>(amendment);
    }

    public async Task<AmendmentResponse> GetAsync(int amendmentId)
    {
        var amendment = await UnitOfWork.AmendmentRepository.GetByIdAsync(amendmentId);
        if (amendment != null)
        {
            return MapperService.Map<Data.Model.Amendment, AmendmentResponse>(amendment);
        }

        return null;
    }

    public async Task<List<AmendmentResponse>> GetByDisputeAsync(Guid disputeGuid)
    {
        var amendments = await UnitOfWork.AmendmentRepository.FindAllAsync(a => a.DisputeGuid == disputeGuid);
        if (amendments != null)
        {
            var amendmentsListResponse = amendments.OrderByDescending(a => a.CreatedDate).ToList();
            return MapperService.Map<List<Data.Model.Amendment>, List<AmendmentResponse>>(amendmentsListResponse);
        }

        return new List<AmendmentResponse>();
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.AmendmentRepository.GetLastModifiedDate((int)id);
        return lastModifiedDate;
    }
}