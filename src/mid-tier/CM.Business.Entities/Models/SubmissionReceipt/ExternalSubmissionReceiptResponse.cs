using System;
using System.Collections.Generic;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.SubmissionReceipt
{
    public class ExternalSubmissionReceiptResponse
    {
        public ExternalSubmissionReceiptResponse()
        {
            ExternalSubmissionReceipts = new List<ExternalSubmissionReceipt>();
        }

        [JsonProperty("total_available_records")]
        public int TotalAvailableRecords { get; set; }

        [JsonProperty("external_submission_receipts")]
        public List<ExternalSubmissionReceipt> ExternalSubmissionReceipts { get; set; }
    }

    public class ExternalSubmissionReceipt : CommonResponse
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
    }
}
