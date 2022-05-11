using System;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.SubmissionReceipt;

public class SubmissionReceiptPostResponse : CommonResponse
{
    [JsonProperty("submission_receipt_id")]
    public int SubmissionReceiptId { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("participant_id")]
    public int ParticipantId { get; set; }

    [JsonProperty("receipt_type")]
    public byte ReceiptType { get; set; }

    [JsonProperty("receipt_subtype")]
    public byte? ReceiptSubType { get; set; }

    [JsonProperty("receipt_title")]
    public string ReceiptTitle { get; set; }

    [JsonProperty("receipt_body")]
    public string ReceiptBody { get; set; }

    [JsonProperty("receipt_date")]
    public string ReceiptDate { get; set; }

    [JsonProperty("receipt_printed")]
    public bool? ReceiptPrinted { get; set; }

    [JsonProperty("receipt_emailed")]
    public bool? ReceiptEmailed { get; set; }

    [JsonProperty("is_deleted")]
    public bool? IsDeleted { get; set; }
}