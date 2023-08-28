using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AccessCode;

public class AccessCodeFileInfoResponse
{
    [JsonProperty("token_participant_id")]
    public int TokenParticipantId { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("file_number")]
    public int? FileNumber { get; set; }

    [JsonProperty("dispute_type")]
    public byte? DisputeType { get; set; }

    [JsonProperty("dispute_sub_type")]
    public byte? DisputeSubType { get; set; }

    [JsonProperty("cross_app_file_num")]
    public int? CrossAppFileNum { get; set; }

    [JsonProperty("creation_method")]
    public byte? CreationMethod { get; set; }

    [JsonProperty("migration_source_of_truth")]
    public byte? MigrationSourceOfTruth { get; set; }

    [JsonProperty("evidence_override")]
    public byte? EvidenceOverride { get; set; }

    [JsonProperty("created_date")]
    public string CreatedDate { get; set; }

    [JsonProperty("modified_date")]
    public string ModifiedDate { get; set; }

    [JsonProperty("dispute_last_modified_date")]
    public string DisputeLastModifiedDate { get; set; }

    [JsonProperty("dispute_stage")]
    public byte? DisputeStage { get; set; }

    [JsonProperty("dispute_status")]
    public byte DisputeStatus { get; set; }

    [JsonProperty("submitted_date")]
    public string SubmittedDate { get; set; }

    [JsonProperty("dispute_process")]
    public byte? DisputeProcess { get; set; }

    [JsonProperty("hearing_start_date")]
    public string HearingStartDate { get; set; }

    [JsonProperty("claim_groups")]
    public List<DisputeAccessClaimGroup> ClaimGroups { get; set; }

    [JsonProperty("claims")]
    public List<AcClaim> Claims { get; set; }

    [JsonProperty("notice_services")]
    public List<AcNoticeService> NoticeServices { get; set; }

    [JsonProperty("unlinked_file_description")]
    public List<AcFileDescription> UnlinkedFileDescriptions { get; set; }
}

public class AcClaim
{
    [JsonProperty("claim_id")]
    public int ClaimId { get; set; }

    [JsonProperty("claim_status")]
    public byte? ClaimStatus { get; set; }

    [JsonProperty("claim_type")]
    public byte? ClaimType { get; set; }

    [JsonProperty("claim_code")]
    public byte? ClaimCode { get; set; }

    [JsonProperty("claim_group_id")]
    public int ClaimGroupId { get; set; }

    [JsonProperty("claim_details")]
    public List<AcClaimDetail> ClaimDetails { get; set; }

    [JsonProperty("file_description")]
    public List<AcFileDescription> FileDescriptions { get; set; }

    [JsonProperty("remedies")]
    public List<AcRemedy> Remedies { get; set; }
}

public class AcClaimDetail
{
    [JsonProperty("claim_detail_id")]
    public int ClaimDetailId { get; set; }

    [JsonProperty("is_amended")]
    public bool? IsAmended { get; set; }
}

public class AcFileDescription
{
    [JsonProperty("file_description_id")]
    public int FileDescriptionId { get; set; }

    [JsonProperty("description_category")]
    public byte DescriptionCategory { get; set; }

    [JsonProperty("description_code")]
    public byte? DescriptionCode { get; set; }

    [JsonProperty("description_by")]
    public int? DescriptionBy { get; set; }

    [JsonProperty("linked_files")]
    public List<AcLinkedFile> LinkedFiles { get; set; }
}

public class AcLinkedFile
{
    [JsonProperty("file_type")]
    public byte FileType { get; set; }

    [JsonProperty("file_mime_type")]
    public string FileMimeType { get; set; }

    [JsonProperty("file_status")]
    public byte? FileStatus { get; set; }

    [JsonProperty("file_package_id")]
    public int? FilePackageId { get; set; }

    [JsonProperty("file_package_type")]
    public byte? FilePackageType { get; set; }

    [JsonProperty("added_by")]
    public int? AddedBy { get; set; }

    [JsonProperty("created_date")]
    public string CreatedDate { get; set; }
}

public class AcRemedy
{
    [JsonProperty("remedy_id")]
    public int RemedyId { get; set; }

    [JsonProperty("remedy_title")]
    public string RemedyTitle { get; set; }

    [JsonProperty("remedy_status")]
    public byte? RemedyStatus { get; set; }

    [JsonProperty("remedy_type")]
    public byte? RemedyType { get; set; }

    [JsonProperty("remedy_source")]
    public byte? RemedySource { get; set; }

    [JsonProperty("is_amended")]
    public bool? IsAmended { get; set; }

    [JsonProperty("created_date")]
    public string CreatedDate { get; set; }

    [JsonProperty("created_by")]
    public int? CreatedBy { get; set; }
}

public class AcNoticeService
{
    [JsonProperty("notice_service_id")]
    public int NoticeServiceId { get; set; }

    [JsonProperty("participant_id")]
    public int ParticipantId { get; set; }

    [JsonProperty("served_by")]
    public int? ServedBy { get; set; }

    [JsonProperty("is_served")]
    public bool? IsServed { get; set; }

    [JsonProperty("service_method")]
    public byte? ServiceMethod { get; set; }

    [JsonProperty("service_comment")]
    public string ServiceComment { get; set; }

    [JsonProperty("service_date")]
    public string ServiceDate { get; set; }

    [JsonProperty("proof_file_description_id")]
    public int? ProofFileDescriptionId { get; set; }

    [JsonProperty("modified_date")]
    public string ModifiedDate { get; set; }

    [JsonProperty("modified_by")]
    public int? ModifiedBy { get; set; }
}