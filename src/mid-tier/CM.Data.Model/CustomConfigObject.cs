using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CM.Data.Model;

public class CustomConfigObject : BaseEntity
{
    public int CustomConfigObjectId { get; set; }

    public byte ObjectType { get; set; }

    public byte? ObjectSubType { get; set; }

    public byte? ObjectStatus { get; set; }

    public decimal? ObjectVersionId { get; set; }

    [StringLength(100)]
    [Required]
    public string ObjectTitle { get; set; }

    [StringLength(255)]
    public string ObjectDescription { get; set; }

    public byte? AssociatedRoleGroup { get; set; }

    public bool IsActive { get; set; }

    public bool IsPublic { get; set; }

    public byte ObjectStorageType { get; set; }

    [Column(TypeName = "json")]
    public string ObjectJson { get; set; }

    [Column(TypeName = "jsonb")]
    public string ObjectJsonB { get; set; }

    public string ObjectText { get; set; }

    public bool? IsDeleted { get; set; }
}