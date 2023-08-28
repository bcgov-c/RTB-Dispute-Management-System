using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace CM.Data.Model
{
    public class PollResponse : BaseEntity
    {
        [Key]
        public int PollResponseId { get; set; }

        public int PollId { get; set; }

        public Poll Poll { get; set; }

        public Guid DisputeGuid { get; set; }

        public Dispute Dispute { get; set; }

        public int? ParticipantId { get; set; }

        public Participant Participant { get; set; }

        public byte? ResponseType { get; set; }

        public byte? ResponseSubType { get; set; }

        public byte ResponseStatus { get; set; }

        public byte? ResponseSite { get; set; }

        [Required]
        [Column(TypeName = "json")]
        public string ResponseJson { get; set; }

        public DateTime? ResponseDate { get; set; }

        [StringLength(2000)]
        public string ResponseText { get; set; }

        public int? AssociatedFileId { get; set; }

        public File AssociatedFile { get; set; }

        public bool IsDeleted { get; set; }
    }
}
