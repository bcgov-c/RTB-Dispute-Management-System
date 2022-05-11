using System;

namespace CM.Business.Entities.Models.Payment;

public class BamboraTransaction
{
    public string TrnId { get; set; }

    public bool TrnApproved { get; set; }

    public string TrnAuthCode { get; set; }

    public string TrnDateTime { get; set; }

    public string ReceiptDate { get; set; }

    public DateTime ProcessedDate { get; set; }

    public string TrnCardType { get; set; }

    public string TrnType { get; set; }

    public string TrnAmount { get; set; }

    public decimal? RegularAmount { get; set; }

    public string TrnOrderNumber { get; set; }

    public string TrnMessageId { get; set; }

    public string TrnMessageText { get; set; }
}