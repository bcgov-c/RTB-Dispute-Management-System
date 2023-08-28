namespace CM.Business.Services.AdHocFileCleanup;

public interface IScheduledAdHocFileCleanupService
{
    System.Threading.Tasks.Task RunAdHocFileCleanup(Data.Model.AdHocFile.AdHocFileCleanup adHocFileCleanup);
}