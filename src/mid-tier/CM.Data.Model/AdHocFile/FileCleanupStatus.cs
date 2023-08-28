namespace CM.Data.Model.AdHocFile;

public enum FileCleanupStatus : byte
{
    NotSet = 0,
    Started,
    Succeeded,
    Failed
}