using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ExternalErrorLog
{
    public class ExternalErrorLogGetResponse
    {
        public ExternalErrorLogGetResponse()
        {
            ExternalErrorLogs = new List<ExternalErrorLogResponse>();
        }

        [JsonProperty("total_available_records")]
        public int TotalAvailableRecords { get; set; }

        [JsonProperty("exteral_error_logs")]
        public List<ExternalErrorLogResponse> ExternalErrorLogs { get; set; }
    }
}
