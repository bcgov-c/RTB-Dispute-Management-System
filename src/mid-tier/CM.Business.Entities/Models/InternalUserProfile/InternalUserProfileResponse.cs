using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.InternalUserProfile;

public class InternalUserProfileResponse : CommonResponse
{
    [JsonProperty("profile_id")]
    public int InternalUserProfileId { get; set; }

    [JsonProperty("internal_user_id")]
    public int InternalUserId { get; set; }

    [JsonProperty("internal_user_status")]
    public byte? InternalUserStatus { get; set; }

    [JsonProperty("profile_picture_id")]
    public int? ProfilePictureId { get; set; }

    [JsonProperty("signature_file_id")]
    public int? SignatureFileId { get; set; }

    [JsonProperty("profile_nickname")]
    public string ProfileNickname { get; set; }

    [JsonProperty("profile_title")]
    public string ProfileTitle { get; set; }

    [JsonProperty("profile_description")]
    public string ProfileDescription { get; set; }
}