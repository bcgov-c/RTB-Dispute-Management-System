using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CM.Data.Model
{
    public class ParticipantIdentity : BaseEntity
    {
        [Key]
        public int ParticipantIdentityId { get; set; }

        public int ParticipantId { get; set; }

        public Participant Participant { get; set; }

        public Guid DisputeGuid { get; set; }

        public Dispute Dispute { get; set; }

        public int IdentityParticipantId { get; set; }

        public Participant IdentityParticipant { get; set; }

        public Guid IdentityDisputeGuid { get; set; }

        public Dispute IdentityDispute { get; set; }

        public int? IdentitySystemUserId { get; set; }

        public SystemUser IdentitySystemUser { get; set; }

        public byte? IdentityStatus { get; set; }

        [MaxLength(250)]
        public string IdentityNote { get; set; }

        public bool? IsDeleted { get; set; }
    }
}
