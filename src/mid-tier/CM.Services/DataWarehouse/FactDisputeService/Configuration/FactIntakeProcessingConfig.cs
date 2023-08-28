using System;

namespace CM.Services.DataWarehouse.FactDisputeService.Configuration
{
    public class FactIntakeProcessingConfig
    {
        public DateTime? PrevDayStart_UTC { get; set; }

        public DateTime? PrevDayEnd_UTC { get; set; }
    }
}
