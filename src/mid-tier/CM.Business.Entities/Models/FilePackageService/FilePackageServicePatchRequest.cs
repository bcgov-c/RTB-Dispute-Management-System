using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.FilePackageService;

public class FilePackageServicePatchRequest
{
    [JsonProperty("other_participant_name")]
    [StringLength(255, MinimumLength = 3)]
    public string OtherParticipantName { get; set; }

    [JsonProperty("other_participant_role")]
    public byte? OtherParticipantRole { get; set; }

    [JsonProperty("other_participant_title")]
    [StringLength(255)]
    public string OtherParticipantTitle { get; set; }

    [JsonProperty("is_served")]
    public bool? IsServed { get; set; }

    [JsonProperty("service_method")]
    public byte? ServiceMethod { get; set; }

    [JsonProperty("service_date")]
    public DateTime? ServiceDate { get; set; }

    [JsonProperty("received_date")]
    public DateTime? ReceivedDate { get; set; }

    [JsonProperty("service_date_used")]
    public byte? ServiceDateUsed { get; set; }

    [JsonProperty("service_comment")]
    [StringLength(255)]
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
    public DateTime? ArchiveServiceDate { get; set; }

    [JsonProperty("archive_received_date")]
    public DateTime? ArchiveReceivedDate { get; set; }

    [JsonProperty("archive_service_date_used")]
    public byte? ArchiveServiceDateUsed { get; set; }

    [JsonProperty("archive_served_by")]
    public int? ArchiveServedBy { get; set; }

    [JsonProperty("archive_service_comment")]
    public string ArchiveServiceComment { get; set; }

    [JsonProperty("other_proof_file_description_id")]
    public int? OtherProofFileDescriptionId { get; set; }

    [JsonProperty("service_description")]
    public string ServiceDescription { get; set; }

    [JsonProperty("archive_service_description")]
    public string ArchiveServiceDescription { get; set; }
}