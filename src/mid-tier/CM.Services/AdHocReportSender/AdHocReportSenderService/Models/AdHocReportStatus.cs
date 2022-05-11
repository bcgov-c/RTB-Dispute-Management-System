namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Models;

public enum AdHocReportStatus : byte
{
    NotSent,

    Sent = 1,

    Failed = 2,

    Idle = 3
}