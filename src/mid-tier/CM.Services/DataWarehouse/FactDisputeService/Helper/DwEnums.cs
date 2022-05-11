namespace CM.Services.DataWarehouse.FactDisputeService.Helper;

public enum LoadingHistoryStatus
{
    Initializing = 0,
    LoadStarted = 1,
    LoadComplete = 2,
    Failed = 3
}

public enum RecordType
{
    Add = 1,
    Update = 2
}