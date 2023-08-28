using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CM.Business.Services.FactIssueOutcomeScheduling
{
    public interface IFactIssueOutcomeSchedulingService
    {
        Task<bool> ProcessFactIssueOutcome();
    }
}
