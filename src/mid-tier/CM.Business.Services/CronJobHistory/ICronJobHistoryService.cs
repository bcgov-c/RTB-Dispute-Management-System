using CM.Business.Entities.Models.CronJobHistory;

namespace CM.Business.Services.CronJobHistory;

public interface ICronJobHistoryService
{
    void CreateAsync(CronJobRequest request);
}