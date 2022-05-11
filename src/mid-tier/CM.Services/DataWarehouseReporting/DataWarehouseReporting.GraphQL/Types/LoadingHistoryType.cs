using DataWarehouseReporting.Data.Models;
using GraphQL.Types;

namespace DataWarehouseReporting.GraphQL.Types;

public sealed class LoadingHistoryType : ObjectGraphType<LoadingHistory>
{
    public LoadingHistoryType()
    {
        Name = "LoadingHistoryType";
        Description = "LoadingHistoryType";

        Field(x => x.LastStatus);
        Field(x => x.OutcomeText);
        Field(x => x.FactTableId);
        Field(x => x.FactTableName);
        Field(x => x.LoadingEventId);
        Field(x => x.TotalRecordsLoaded, true);
        Field(x => x.LoadEndDateTime, true);
        Field(x => x.LoadStartDateTime);
    }
}