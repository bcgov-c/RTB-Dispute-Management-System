using DataWarehouseReporting.Data.Models;
using GraphQL.Types;

namespace DataWarehouseReporting.GraphQL.Types;

public sealed class DimTimeType : ObjectGraphType<DimTime>
{
    public DimTimeType()
    {
        Name = "DimTimeType";
        Description = "DimTimeType";

        Field(x => x.AssociatedDate);
        Field(x => x.DateInserted);
        Field(x => x.MonthId);
        Field(x => x.QuarterId);
        Field(x => x.WeekId);
        Field(x => x.YearId);
        Field(x => x.DimTimeId);
        Field(x => x.DayOfWeekId);
    }
}