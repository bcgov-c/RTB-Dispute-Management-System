using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AuditLog;

public class AuditLogItemResponse : AuditLogResponse
{
    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("api_call_data")]
    public string ApiCallData { get; set; }

    [JsonProperty("api_response")]
    public string ApiResponse { get; set; }

    [JsonProperty("api_error_response")]
    public string ApiErrorResponse { get; set; }
}