using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CM.Common.Utilities;

namespace CM.Data.Model;

public class CustomDataObject : BaseEntity
{
    public int CustomDataObjectId { get; set; }

    public Guid DisputeGuid { get; set; }

    public Dispute Dispute { get; set; }

    public CustomObjectType ObjectType { get; set; }

    public byte? ObjectSubType { get; set; }

    [StringLength(255)]
    public string Description { get; set; }

    public bool? IsActive { get; set; }

    public byte? ObjectStatus { get; set; }

    [Column(TypeName = "json")]
    public string ObjectJson { get; set; }

    public bool? IsDeleted { get; set; }

    public bool? IsAmended { get; set; }
}