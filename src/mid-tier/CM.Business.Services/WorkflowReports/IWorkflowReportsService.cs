using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.WorkflowReport;

namespace CM.Business.Services.WorkflowReports;

public interface IWorkflowReportsService
{
    Task<WorkflowReportResponse> GetReport(Guid disputeGuid);
}