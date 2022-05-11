using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CM.Data.Model;

public class DisputeLastModified
{
    [Key]
    public int DisputeLastModifiedId { get; set; }

    [ForeignKey("DisputeGuid")]
    public Guid DisputeGuid { get; set; }

    public DateTime LastModifiedDate { get; set; }

    public int LastModifiedBy { get; set; }

    [Column(TypeName = "jsonb")]
    public string LastModifiedSource { get; set; }

    public Dispute Dispute { get; set; }
}