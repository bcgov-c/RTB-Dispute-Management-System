using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class IntakeQuestion
{
    public int IntakeQuestionId { get; set; }

    public Dispute Dispute { get; set; }

    [Required]
    public Guid DisputeGuid { get; set; }

    [Required]
    public byte GroupId { get; set; }

    [Required]
    [StringLength(255)]
    public string QuestionName { get; set; }

    [StringLength(6)]
    public string QuestionAnswer { get; set; }

    public DateTime ModifiedDate { get; set; }
}