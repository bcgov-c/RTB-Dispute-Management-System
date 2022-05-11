using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.SubmissionReceipt;

public class SubmissionReceiptPostRequest
{
    [JsonProperty("participant_id")]
    public int ParticipantId { get; set; }

    [JsonProperty("receipt_type")]
    public byte ReceiptType { get; set; }

    [JsonProperty("receipt_subtype")]
    public byte? ReceiptSubType { get; set; }

    [JsonProperty("receipt_title")]
    [StringLength(100, MinimumLength = 3)]
    public string ReceiptTitle { get; set; }

    [MinLength(100)]
    [JsonProperty("receipt_body")]
    public string ReceiptBody { get; set; }

    [JsonProperty("receipt_date")]
    public DateTime? ReceiptDate { get; set; }

    [JsonProperty("receipt_printed")]
    public bool? ReceiptPrinted { get; set; }

    [JsonProperty("receipt_emailed")]
    public bool? ReceiptEmailed { get; set; }
}