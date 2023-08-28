using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.ExternalErrorLog;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.ExternalErrorLog
{
    public interface IExternalErrorLogRepository : IRepository<Model.ExternalErrorLog>
    {
        Task<(List<Model.ExternalErrorLog>, int)> GetExternalErrorLogs(ExternalErrorLogGetRequest request, int index, int count);

        Task<DateTime?> GetLastModifiedDate(int externalErrorLogId);
    }
}
