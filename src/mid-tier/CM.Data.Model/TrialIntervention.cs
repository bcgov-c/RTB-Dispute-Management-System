using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class TrialIntervention : BaseEntity
{
    [Key]
    public Guid TrialInterventionGuid { get; set; }

    public Guid TrialGuid { get; set; }

    public Trial Trial { get; set; }

    public Guid? TrialDisputeGuid { get; set; }

    public TrialDispute TrialDispute { get; set; }

    public Guid? TrialParticipantGuid { get; set; }

    public TrialParticipant TrialParticipant { get; set; }

    public int? OtherAssociatedId { get; set; }

    public byte? InterventionSelectionMethod { get; set; }

    public byte InterventionType { get; set; }

    public byte? InterventionSubType { get; set; }

    public byte InterventionStatus { get; set; }

    public string InterventionTitle { get; set; }

    public string InterventionDescription { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public bool? IsDeleted { get; set; }

    public virtual ICollection<TrialOutcome> TrialOutcomes { get; set; }
}