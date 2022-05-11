using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CM.Data.Model;

public class TrialOutcome : BaseEntity
{
    [Key]
    public Guid TrialOutcomeGuid { get; set; }

    public Guid TrialGuid { get; set; }

    public Trial Trial { get; set; }

    public byte OutcomeBy { get; set; }

    public Guid? TrialParticipantGuid { get; set; }

    public Guid? TrialDisputeGuid { get; set; }

    public Guid? TrialInterventionGuid { get; set; }

    public byte OutcomeType { get; set; }

    public byte? OutcomeSubType { get; set; }

    public byte OutcomeStatus { get; set; }

    [StringLength(75)]
    public string OutcomeTitle { get; set; }

    public int? OutcomeValue1 { get; set; }

    public int? OutcomeValue2 { get; set; }

    public int? OutcomeValue3 { get; set; }

    public int? OutcomeValue4 { get; set; }

    [StringLength(500)]
    public string OutcomeString1 { get; set; }

    [StringLength(500)]
    public string OutcomeString2 { get; set; }

    [StringLength(500)]
    public string OutcomeString3 { get; set; }

    [Column(TypeName = "jsonb")]
    public string OutcomeJson { get; set; }

    [StringLength(500)]
    public string OutcomeComment { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public bool? IsDeleted { get; set; }
}