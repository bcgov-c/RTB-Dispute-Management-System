using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.SubmissionReceipt;
using CM.Business.Services.Base;

namespace CM.Business.Services.SubmissionReceipt;

public interface ISubmissionReceiptService : IServiceBase, IDisputeResolver
{
    Task<SubmissionReceiptPostResponse> CreateAsync(Guid disputeGuid, SubmissionReceiptPostRequest request);

    Task<Data.Model.SubmissionReceipt> GetById(int submissionReceiptId);

    Task<SubmissionReceiptPostResponse> PatchAsync(int submissionReceiptId, SubmissionReceiptPatchRequest submissionReceiptToPatch);

    Task<bool> DeleteAsync(int submissionReceiptId);

    Task<SubmissionReceiptPostResponse> GetAsync(int submissionReceiptId);

    Task<List<SubmissionReceiptPostResponse>> GetList(Guid disputeGuid);
}