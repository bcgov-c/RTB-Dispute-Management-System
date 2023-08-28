using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Files
{
    public class CommonFileExternalResponse
    {
        public CommonFileExternalResponse()
        {
            ExternalCommonFiles = new List<ExternalCommonFile>();
        }

        [JsonProperty("total_available_records")]
        public int TotalAvailableRecords { get; set; }

        [JsonProperty("external_common_files")]
        public List<ExternalCommonFile> ExternalCommonFiles { get; set; }
    }
}
