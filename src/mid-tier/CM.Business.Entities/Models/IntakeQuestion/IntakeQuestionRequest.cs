using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.IntakeQuestion;

public class IntakeQuestionRequest
{
    [JsonProperty("question_name")]
    [Required]
    public string QuestionName { get; set; }

    [JsonProperty("group_id")]
    [Required]
    public byte GroupId { get; set; }

    [JsonProperty("question_answer")]
    [StringLength(6)]
    public string QuestionAnswer { get; set; }
}