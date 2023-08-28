using System;

namespace CM.Business.Entities.Models.ExternalErrorLog
{
    public class ExternalErrorLogGetRequest
    {
        public byte? ErrorType { get; set; }

        public byte? ErrorSite { get; set; }

        public byte? ErrorStatus { get; set; }

        public string DisputeGuid { get; set; }

        public int? ErrorOwner { get; set; }

        public DateTime? ErrorCreatedBeforeDate { get; set; }

        public DateTime? ErrorCreatedAfterDate { get; set; }

        public byte? SortDirection { get; set; }
    }
}
