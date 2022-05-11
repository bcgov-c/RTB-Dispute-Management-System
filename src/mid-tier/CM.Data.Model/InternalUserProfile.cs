using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class InternalUserProfile : BaseEntity
{
    public int InternalUserProfileId { get; set; }

    public SystemUser SystemUser { get; set; }

    public int InternalUserId { get; set; }

    public byte? ProfileStatus { get; set; }

    public CommonFile CommonFileProfilePic { get; set; }

    public int? ProfilePictureId { get; set; }

    public CommonFile CommonFileSignature { get; set; }

    public int? SignatureFileId { get; set; }

    [StringLength(40)]
    public string ProfileNickname { get; set; }

    [StringLength(70)]
    public string ProfileTitle { get; set; }

    [StringLength(255)]
    public string ProfileDecision { get; set; }
}