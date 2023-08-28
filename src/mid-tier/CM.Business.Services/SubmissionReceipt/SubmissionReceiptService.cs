using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.SubmissionReceipt;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.SubmissionReceipt;

public class SubmissionReceiptService : CmServiceBase, ISubmissionReceiptService
{
    public SubmissionReceiptService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<SubmissionReceiptPostResponse> CreateAsync(Guid disputeGuid, SubmissionReceiptPostRequest request)
    {
        var newSubmissionReceipt = MapperService.Map<SubmissionReceiptPostRequest, Data.Model.SubmissionReceipt>(request);
        newSubmissionReceipt.DisputeGuid = disputeGuid;
        newSubmissionReceipt.IsDeleted = false;
        var submissionReceiptResult = await UnitOfWork.SubmissionReceiptRepository.InsertAsync(newSubmissionReceipt);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.SubmissionReceipt, SubmissionReceiptPostResponse>(submissionReceiptResult);
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int submissionReceiptId)
    {
        var submissionReceipt = await UnitOfWork.SubmissionReceiptRepository.GetByIdAsync(submissionReceiptId);
        if (submissionReceipt != null)
        {
            submissionReceipt.IsDeleted = true;
            UnitOfWork.SubmissionReceiptRepository.Attach(submissionReceipt);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<SubmissionReceiptPostResponse> GetAsync(int submissionReceiptId)
    {
        var submissionReceipt = await UnitOfWork.SubmissionReceiptRepository.GetByIdAsync(submissionReceiptId);
        if (submissionReceipt != null)
        {
            var res = MapperService.Map<Data.Model.SubmissionReceipt, SubmissionReceiptPostResponse>(submissionReceipt);
            return res;
        }

        return null;
    }

    public async Task<Data.Model.SubmissionReceipt> GetById(int submissionReceiptId)
    {
        var submissionReceipt = await UnitOfWork.SubmissionReceiptRepository.GetByIdAsync(submissionReceiptId);
        return submissionReceipt;
    }

    public async Task<ExternalSubmissionReceiptResponse> GetExternalSubmissionReceipts(Guid disputeGuid, ExternalSubmissionReceiptRequest request, int count, int index)
    {
        if (count == 0)
        {
            count = int.MaxValue;
        }

        var result = new ExternalSubmissionReceiptResponse();

        var(receipts, totalCount) = await UnitOfWork.SubmissionReceiptRepository.GetExternalSubmissionReceipts(disputeGuid, request);
        if (receipts != null)
        {
            result.ExternalSubmissionReceipts = MapperService.Map<List<Data.Model.SubmissionReceipt>, List<ExternalSubmissionReceipt>>(receipts).ApplyPaging(count, index);
        }

        result.TotalAvailableRecords = totalCount;

        return result;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.SubmissionReceiptRepository.GetLastModifiedDate((int)id);
        return lastModifiedDate;
    }

    public async Task<List<SubmissionReceiptPostResponse>> GetList(Guid disputeGuid)
    {
        var submissionReceiptList = await UnitOfWork.SubmissionReceiptRepository.GetByDisputeGuid(disputeGuid);
        if (submissionReceiptList != null)
        {
            return MapperService.Map<List<Data.Model.SubmissionReceipt>, List<SubmissionReceiptPostResponse>>(submissionReceiptList);
        }

        return null;
    }

    public async Task<SubmissionReceiptPostResponse> PatchAsync(int submissionReceiptId, SubmissionReceiptPatchRequest submissionReceiptToPatch)
    {
        var submissionReceipt = await UnitOfWork.SubmissionReceiptRepository.GetByIdAsync(submissionReceiptId);
        MapperService.Map(submissionReceiptToPatch, submissionReceipt);

        UnitOfWork.SubmissionReceiptRepository.Attach(submissionReceipt);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            var res = MapperService.Map<Data.Model.SubmissionReceipt, SubmissionReceiptPostResponse>(submissionReceipt);

            return res;
        }

        return null;
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entity = await UnitOfWork.SubmissionReceiptRepository.GetNoTrackingByIdAsync(x => x.SubmissionReceiptId == id);
        return entity?.DisputeGuid ?? Guid.Empty;
    }
}