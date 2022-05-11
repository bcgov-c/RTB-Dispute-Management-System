using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Hearing;

public class ImportScheduleRequest
{
    [JsonProperty("import_file_id")]
    public int ImportFileId { get; set; }

    [JsonProperty("import_note")]
    public string ImportNote { get; set; }

    [JsonProperty("import_office_id")]
    public int? ImportOfficeId { get; set; }
}