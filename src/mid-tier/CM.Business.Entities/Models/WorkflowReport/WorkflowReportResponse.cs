using System;

namespace CM.Business.Entities.Models.WorkflowReport;

public class WorkflowReportResponse
{
    public Guid DisputeGuid { get; set; }

    public int TotalIncompleteItems { get; set; }

    public int FutureHearings { get; set; }

    public int IncompleteTasks { get; set; }

    public int IncompleteOutcomeDocuments { get; set; }

    public int UndeliveredDocuments { get; set; }

    public int MissingIssueOutcomes { get; set; }

    public int MissingHearingParticipations { get; set; }

    public int MissingNoticeService { get; set; }

    public int MissingHearingDetails { get; set; }

    public int MissingDocumentWritingTime { get; set; }

    public int IncompleteDocumentRequests { get; set; }

    public int NotReadyDeliveredDocuments { get; set; }

    public bool MissingDisputeNotice { get; set; }

    public int IncompleteSubServiceRequests { get; set; }

    public int NoticeNotProvided { get; set; }

    public int EmailWithErrors { get; set; }

    public int UnpaidFees { get; set; }

    public bool EvidenceOverrideOn { get; set; }

    public bool MissingKeyFileInfo { get; set; }

    public int DocumentsMissingDeliveries { get; set; }

    public int MissingEvidenceService { get; set; }

    public int MissingNoticeServiceConfirmations { get; set; }
}