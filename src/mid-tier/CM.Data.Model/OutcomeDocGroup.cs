using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class OutcomeDocGroup : BaseEntity
{
    public int OutcomeDocGroupId { get; set; }

    public Guid DisputeGuid { get; set; }

    public Dispute Dispute { get; set; }

    public byte? DocGroupType { get; set; }

    public byte? DocGroupSubType { get; set; }

    public DateTime? DocCompletedDate { get; set; }

    public byte? DocStatus { get; set; }

    public DateTime? DocStatusDate { get; set; }

    public int? DocWritingTime { get; set; }

    public int? DocPreparationTime { get; set; }

    public byte? DocComplexity { get; set; }

    public bool? IsDeleted { get; set; }

    public byte? DocVersion { get; set; }

    [StringLength(255)]
    public string DocNote { get; set; }

    public virtual ICollection<OutcomeDocFile> OutcomeDocFiles { get; set; }
}