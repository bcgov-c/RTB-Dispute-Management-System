using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;

namespace CM.Data.Model;

public class OutcomeDocReqItem : BaseEntity
{
    public int OutcomeDocReqItemId { get; set; }

    public int OutcomeDocRequestId { get; set; }

    public OutcomeDocRequest OutcomeDocRequest { get; set; }

    public OutcomeDocRequestItemType ItemType { get; set; }

    public OutcomeDocRequestItemSubType? ItemSubType { get; set; }

    public byte? ItemStatus { get; set; }

    [StringLength(70)]
    public string ItemTitle { get; set; }

    [StringLength(1000)]
    public string ItemDescription { get; set; }

    public int? FileDescriptionId { get; set; }

    [StringLength(500)]
    public string ItemNote { get; set; }

    public bool? IsDeleted { get; set; }
}