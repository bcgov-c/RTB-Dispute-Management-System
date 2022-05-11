using System.Collections.Generic;
using CM.Business.Entities.Models.SchedulePeriod;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ScheduleBlock;

public class ScheduledBlockByPeriodResponse : SchedulePeriodPostResponse
{
    public ScheduledBlockByPeriodResponse()
    {
        PeriodStatistics = new List<PeriodStatisticsResponse>();
        ScheduleBlocks = new List<ScheduleBlockGetResponse>();
    }

    [JsonProperty("period_statistics")]
    public List<PeriodStatisticsResponse> PeriodStatistics { get; set; }

    [JsonProperty("schedule_blocks")]
    public List<ScheduleBlockGetResponse> ScheduleBlocks { get; set; }
}