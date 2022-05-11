using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class ClaimGroup : BaseEntity
{
    public int ClaimGroupId { get; set; }

    [Required]
    public Guid DisputeGuid { get; set; }

    public Dispute Dispute { get; set; }

    public virtual ICollection<ClaimGroupParticipant> ClaimGroupParticipants { get; set; }

    public virtual ICollection<Claim> Claims { get; set; }

    public bool? IsDeleted { get; set; }
}