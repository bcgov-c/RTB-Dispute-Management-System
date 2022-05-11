using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class AutoText : BaseEntity
{
    public int AutoTextId { get; set; }

    [StringLength(255)]
    public string TextTitle { get; set; }

    public byte TextType { get; set; }

    public byte? TextSubType { get; set; }

    public byte? TextStatus { get; set; }

    public byte? TextPrivacy { get; set; }

    public SystemUser SystemUser { get; set; }

    public int? TextOwner { get; set; }

    public string TextContent { get; set; }

    public bool? IsDeleted { get; set; }
}