using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.FilePackageService;

public class FilePackageServiceResponse : CommonResponse
{
    [JsonProperty("file_package_service_id")]
    public int FilePackageServiceId { get; set; }

    [JsonProperty("file_package_id")]
    public int FilePackageId { get; set; }

    [JsonProperty("participant_id")]
    public int? ParticipantId { get; set; }

    [JsonProperty("other_participant_name")]
    public string OtherParticipantName { get; set; }

    [JsonProperty("other_participant_role")]
    public byte? OtherParticipantRole { get; set; }

    [JsonProperty("other_participant_title")]
    public string OtherParticipantTitle { get; set; }

    [JsonProperty("is_served")]
    public bool? IsServed { get; set; }

    [JsonProperty("service_method")]
    public byte? ServiceMethod { get; set; }

    [JsonProperty("service_date")]
    public string ServiceDate { get; set; }

    [JsonProperty("received_date")]
    public string ReceivedDate { get; set; }

    [JsonProperty("service_date_used")]
    public byte? ServiceDateUsed { get; set; }

    [JsonProperty("service_comment")]
    public string ServiceComment { get; set; }

    [JsonProperty("served_by")]
    public int? ServedBy { get; set; }

    [JsonProperty("proof_file_description_id")]
    public int? ProofFileDescriptionId { get; set; }

    [JsonProperty("validation_status")]
    public byte? ValidationStatus { get; set; }

    [JsonProperty("archived_by")]
    public int? ArchivedBy { get; set; }

    [JsonProperty("archive_service_method")]
    public byte? ArchiveServiceMethod { get; set; }

    [JsonProperty("archive_service_date")]
    public string ArchiveServiceDate { get; set; }

    [JsonProperty("archive_received_date")]
    public string ArchiveReceivedDate { get; set; }

    [JsonProperty("archive_service_date_used")]
    public byte? ArchiveServiceDateUsed { get; set; }

    [JsonProperty("archive_served_by")]
    public int? ArchiveServedBy { get; set; }
}