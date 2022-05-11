using System.Threading.Tasks;
using CM.Business.Entities.Models.BulkEmailRecipient;

namespace CM.Business.Services.BulkEmailRecipient;

public interface IBulkEmailRecipientService : IServiceBase
{
    Task<string> CreateAsync(BulkEmailRecipientRequest bulkRequest);

    Task<bool> IsBulkEmailBatchIdExist(int bulkEmailBatchId);
}