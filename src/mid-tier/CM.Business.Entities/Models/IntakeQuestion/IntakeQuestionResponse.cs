using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.IntakeQuestion;

public class IntakeQuestionResponse
{
    [JsonProperty("question_id")]
    public int IntakeQuestionId { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("question_name")]
    public string QuestionName { get; set; }

    [JsonProperty("group_id")]
    public byte GroupId { get; set; }

    [JsonProperty("question_answer")]
    public string QuestionAnswer { get; set; }

    [JsonProperty("modified_date")]
    public string ModifiedDate { get; set; }
}