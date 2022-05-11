using System;
using System.Threading.Tasks;

namespace CM.Data.Repositories.WorkflowReports;

public interface IWorkflowReportsRepository
{
    Task<int> GetFutureHearingsCount(Guid disputeGuid);

    Task<int> GetIncompleteTasksCount(Guid disputeGuid);

    Task<int> GetIncompleteOutcomeDocumentsCount(Guid disputeGuid);

    Task<int> GetNotReadyToSendDocumentsCount(Guid disputeGuid);

    Task<int> GetUndeliveredDocumentsCount(Guid disputeGuid);

    Task<int> GetMissingIssueOutcomesCount(Guid disputeGuid);

    Task<int> GetMissingHearingParticipationsCount(Guid disputeGuid);

    Task<int> GetMissingNoticeServiceCount(Guid disputeGuid);

    Task<int> GetMissingHearingDetailsCount(Guid disputeGuid);

    Task<int> GetMissingDocumentWritingTimeCount(Guid disputeGuid);

    Task<int> GetIncompleteDocumentRequestsCount(Guid disputeGuid);

    Task<int> GetNotReadyDeliveredDocuments(Guid disputeGuid);

    Task<bool> GetMissingDisputeNotice(Guid disputeGuid);

    Task<int> GetIncompleteSubServiceRequests(Guid disputeGuid);

    Task<int> GetNoticeNotProvided(Guid disputeGuid);

    Task<int> GetEmailWithErrors(Guid disputeGuid);

    Task<int> GetUnpaidFees(Guid disputeGuid);

    Task<bool> GetEvidenceOverrideOn(Guid disputeGuid);

    Task<bool> GetMissingKeyFileInfo(Guid disputeGuid);

    Task<int> GetDocumentsMissingDeliveries(Guid disputeGuid);

    Task<int> GetMissingEvidenceService(Guid disputeGuid);
}