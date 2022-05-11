using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CM.Common.Utilities;

namespace CM.Data.Model;

public class ExternalCustomDataObject : BaseEntity
{
    public int ExternalCustomDataObjectId { get; set; }

    [StringLength(50)]
    public string ReferenceId { get; set; }

    public Guid SessionGuid { get; set; }

    [StringLength(50)]
    public string RefreshToken { get; set; }

    public DateTime Expiry { get; set; }

    public int? OwnerId { get; set; }

    public SystemUser OwnerSystemUser { get; set; }

    public ExternalCustomObjectType? Type { get; set; }

    public byte? SubType { get; set; }

    public byte? Status { get; set; }

    public byte? SubStatus { get; set; }

    [StringLength(100)]
    public string Title { get; set; }

    [StringLength(255)]
    public string Description { get; set; }

    public bool? IsActive { get; set; }

    [Column(TypeName = "json")]
    public string ObjectJson { get; set; }

    public bool? IsDeleted { get; set; }

    public virtual ICollection<ExternalFile> ExternalFiles { get; set; }
}