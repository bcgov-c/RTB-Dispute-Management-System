using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;

namespace CM.Data.Model;

public class OutcomeDocRequest : BaseEntity
{
    public int OutcomeDocRequestId { get; set; }

    public Guid DisputeGuid { get; set; }

    public Dispute Dispute { get; set; }

    public OutcomeDocRequestType RequestType { get; set; }

    public OutcomeDocRequestSubType? RequestSubType { get; set; }

    public OutcomeDocAffectedDocuments? AffectedDocuments { get; set; }

    [StringLength(255)]
    public string AffectedDocumentsText { get; set; }

    public DateTime DateDocumentsReceived { get; set; }

    [StringLength(1000)]
    public string RequestDescription { get; set; }

    public int SubmitterId { get; set; }

    public Participant Submitter { get; set; }

    public int? OutcomeDocGroupId { get; set; }

    public OutcomeDocGroup OutcomeDocGroup { get; set; }

    public int? FileDescriptionId { get; set; }

    public FileDescription FileDescription { get; set; }

    public byte? RequestStatus { get; set; }

    [StringLength(100)]
    public string OtherStatusDescription { get; set; }

    public int? RequestProcessingTime { get; set; }

    public bool? IsDeleted { get; set; }

    public DateTime? RequestCompletionDate { get; set; }

    [StringLength(100)]
    public string SubmitterDetails { get; set; }

    public DateTime? RequestDate { get; set; }

    public byte? RequestSource { get; set; }

    public byte? RequestSubStatus { get; set; }

    public virtual ICollection<OutcomeDocReqItem> OutcomeDocReqItems { get; set; }
}