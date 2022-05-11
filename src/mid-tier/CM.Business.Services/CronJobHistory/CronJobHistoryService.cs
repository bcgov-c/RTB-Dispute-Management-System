using AutoMapper;
using CM.Business.Entities.Models.CronJobHistory;
using CM.Data.Repositories.UnitOfWork;
using Serilog;

namespace CM.Business.Services.CronJobHistory;

public class CronJobHistoryService : CmServiceBase, ICronJobHistoryService
{
    public CronJobHistoryService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public void CreateAsync(CronJobRequest request)
    {
        Log.Warning("CronJobLog {@Details}", request);
    }
}