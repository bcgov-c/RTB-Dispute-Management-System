using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class Trial : BaseEntity
{
    [Key]
    public Guid TrialGuid { get; set; }

    public Guid? AssociatedTrialGuid { get; set; }

    public Trial AssociatedTrial { get; set; }

    public bool OptinRequired { get; set; }

    public byte TrialType { get; set; }

    public byte? TrialSubType { get; set; }

    public byte? TrialStatus { get; set; }

    public byte? TrialSubStatus { get; set; }

    [StringLength(100)]
    [Required]
    public string TrialTitle { get; set; }

    [StringLength(750)]
    public string TrialDescription { get; set; }

    public int? MinDisputes { get; set; }

    public int? MinParticipants { get; set; }

    public int? MinInterventions { get; set; }

    public int? MaxDisputes { get; set; }

    public int? MaxParticipants { get; set; }

    public int? MaxInterventions { get; set; }

    public DateTime? TrialStartDate { get; set; }

    public DateTime? TrialEndDate { get; set; }

    public bool? IsDeleted { get; set; }

    public virtual ICollection<TrialDispute> TrialDisputes { get; set; }

    public virtual ICollection<TrialParticipant> TrialParticipants { get; set; }

    public virtual ICollection<TrialIntervention> TrialInterventions { get; set; }

    public virtual ICollection<TrialOutcome> TrialOutcomes { get; set; }

    public virtual ICollection<Trial> RelatedTrials { get; set; }
}