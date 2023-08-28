using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CM.Common.Utilities;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace CM.Data.Model
{
    public class Poll : BaseEntity
    {
        [Key]
        public int PollId { get; set; }

        [StringLength(150)]
        public string PollTitle { get; set; }

        [StringLength(2500)]
        public string PollDescription { get; set; }

        public DateTime? PollStartDate { get; set; }

        public DateTime? PollEndDate { get; set; }

        public PollStatus? PollStatus { get; set; }

        public byte PollType { get; set; }

        public PollSite? PollSite { get; set; }

        public PollAudience? PollAudience { get; set; }

        public DisputeType? PollDisputeType { get; set; }

        public DisputeSubType? PollDisputeSubType { get; set; }

        public ParticipantType? PollParticipantType { get; set; }

        [Column(TypeName = "json")]
        public string PollConfiguration { get; set; }

        public int? MinResponses { get; set; }

        public int? MaxResponses { get; set; }

        public bool IsDeleted { get; set; }

        public virtual ICollection<PollResponse> PollResponses { get; set; }
    }
}
