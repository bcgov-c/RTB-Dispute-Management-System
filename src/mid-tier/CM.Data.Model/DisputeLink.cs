using System;
using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;

namespace CM.Data.Model
{
    public class DisputeLink : BaseEntity
    {
        [Key]
        public int DisputeLinkId { get; set; }

        public Guid DisputeGuid { get; set; }

        public Dispute Dispute { get; set; }

        public int OnlineMeetingId { get; set; }

        public OnlineMeeting OnlineMeeting { get; set; }

        public DisputeLinkRole DisputeLinkRole { get; set; }

        public DisputeLinkType DisputeLinkType { get; set; }

        public DisputeLinkStatus DisputeLinkStatus { get; set; }

        public bool IsDeleted { get; set; }
    }
}
