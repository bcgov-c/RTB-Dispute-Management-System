using System;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Models
{
    public class CommonModel
    {
        public DateTime CreatedDate { get; set; }

        public int CreatedBy { get; set; }

        public DateTime? ModifiedDate { get; set; }

        public int? ModifiedBy { get; set; }
    }
}
