using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Hearing;

public class ImportScheduleResponse : CommonResponse
{
    [JsonProperty("hearing_import_id")]
    public int HearingImportId { get; set; }

    [JsonProperty("import_file_id")]
    public int ImportFileId { get; set; }

    [JsonProperty("import_status")]
    public byte ImportStatus { get; set; }

    [JsonProperty("import_start_datetime")]
    public string ImportStartDateTime { get; set; }

    [JsonProperty("import_end_datetime")]
    public string ImportEndDateTime { get; set; }

    [JsonProperty("import_note")]
    public string ImportNote { get; set; }

    [JsonProperty("import_process_log")]
    public string ImportProcessLog { get; set; }

    [JsonProperty("import_office_id")]
    public int? ImportOfficeId { get; set; }
}