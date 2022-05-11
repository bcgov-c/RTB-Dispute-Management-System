using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.WorkflowReport;
using CM.Data.Repositories.WorkflowReports;

namespace CM.Business.Services.WorkflowReports;

public class WorkflowReportsService : IWorkflowReportsService
{
    private readonly IWorkflowReportsRepository _workflowReportsRepository;

    public WorkflowReportsService(IWorkflowReportsRepository workflowReportsRepository)
    {
        _workflowReportsRepository = workflowReportsRepository;
    }

    public async Task<WorkflowReportResponse> GetReport(Guid disputeGuid)
    {
        var workflowReportsResponse = new WorkflowReportResponse
        {
            DisputeGuid = disputeGuid,
            FutureHearings = await _workflowReportsRepository.GetFutureHearingsCount(disputeGuid),
            IncompleteTasks = await _workflowReportsRepository.GetIncompleteTasksCount(disputeGuid),
            IncompleteOutcomeDocuments = await _workflowReportsRepository.GetIncompleteOutcomeDocumentsCount(disputeGuid),
            UndeliveredDocuments = await _workflowReportsRepository.GetUndeliveredDocumentsCount(disputeGuid),
            MissingIssueOutcomes = await _workflowReportsRepository.GetMissingIssueOutcomesCount(disputeGuid),
            MissingHearingParticipations = await _workflowReportsRepository.GetMissingHearingParticipationsCount(disputeGuid),
            MissingNoticeService = await _workflowReportsRepository.GetMissingNoticeServiceCount(disputeGuid),
            MissingHearingDetails = await _workflowReportsRepository.GetMissingHearingDetailsCount(disputeGuid),
            MissingDocumentWritingTime = await _workflowReportsRepository.GetMissingDocumentWritingTimeCount(disputeGuid),
            IncompleteDocumentRequests = await _workflowReportsRepository.GetIncompleteDocumentRequestsCount(disputeGuid),
            NotReadyDeliveredDocuments = await _workflowReportsRepository.GetNotReadyDeliveredDocuments(disputeGuid),
            MissingDisputeNotice = await _workflowReportsRepository.GetMissingDisputeNotice(disputeGuid),
            IncompleteSubServiceRequests = await _workflowReportsRepository.GetIncompleteSubServiceRequests(disputeGuid),
            NoticeNotProvided = await _workflowReportsRepository.GetNoticeNotProvided(disputeGuid),
            EmailWithErrors = await _workflowReportsRepository.GetEmailWithErrors(disputeGuid),
            UnpaidFees = await _workflowReportsRepository.GetUnpaidFees(disputeGuid),
            EvidenceOverrideOn = await _workflowReportsRepository.GetEvidenceOverrideOn(disputeGuid),
            MissingKeyFileInfo = await _workflowReportsRepository.GetMissingKeyFileInfo(disputeGuid),
            DocumentsMissingDeliveries = await _workflowReportsRepository.GetDocumentsMissingDeliveries(disputeGuid),
            MissingEvidenceService = await _workflowReportsRepository.GetMissingEvidenceService(disputeGuid)
        };

        workflowReportsResponse.TotalIncompleteItems = workflowReportsResponse.FutureHearings +
                                                       workflowReportsResponse.IncompleteTasks +
                                                       workflowReportsResponse.IncompleteOutcomeDocuments +
                                                       workflowReportsResponse.UndeliveredDocuments +
                                                       workflowReportsResponse.MissingIssueOutcomes +
                                                       workflowReportsResponse.MissingHearingParticipations +
                                                       workflowReportsResponse.MissingNoticeService +
                                                       workflowReportsResponse.MissingHearingDetails +
                                                       workflowReportsResponse.MissingDocumentWritingTime +
                                                       workflowReportsResponse.IncompleteDocumentRequests +
                                                       workflowReportsResponse.NotReadyDeliveredDocuments +
                                                       workflowReportsResponse.IncompleteSubServiceRequests +
                                                       workflowReportsResponse.NoticeNotProvided +
                                                       workflowReportsResponse.EmailWithErrors +
                                                       workflowReportsResponse.UnpaidFees +
                                                       workflowReportsResponse.DocumentsMissingDeliveries +
                                                       workflowReportsResponse.MissingEvidenceService;

        return workflowReportsResponse;
    }
}