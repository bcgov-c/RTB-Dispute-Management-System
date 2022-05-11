using System;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.DisputeProcessDetail;

public interface IDisputeProcessDetailRepository : IRepository<Model.DisputeProcessDetail>
{
    Task<Model.DisputeProcessDetail> GetLastDisputeProcessDetail(Guid disputeGuid);

    Task<DateTime?> GetLastModifiedDate(int id);
}