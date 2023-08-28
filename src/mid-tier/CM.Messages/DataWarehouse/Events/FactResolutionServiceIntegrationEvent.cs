using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CM.Messages.DataWarehouse.Events
{
    public class FactResolutionServiceIntegrationEvent : BaseMessage
    {
        public FactResolutionServiceIntegrationEvent()
        {
            CorrelationGuid = Guid.NewGuid();
        }
    }
}
