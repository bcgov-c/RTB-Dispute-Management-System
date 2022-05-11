using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using CM.Common.Utilities;
using DataWarehouseReporting.Data;
using DataWarehouseReporting.Data.Models;
using DataWarehouseReporting.GraphQL.Helper;
using DataWarehouseReporting.GraphQL.Infrastructure;
using DataWarehouseReporting.GraphQL.Types;
using GraphQL;
using GraphQl.Extensions;
using GraphQL.Types;

namespace DataWarehouseReporting.GraphQL.Resolvers;

public class FactTimeStatisticQueryResolver : IQueryResolver
{
    private readonly DataWarehouseReportingContext _dataWarehouseReportingContext;
    private readonly IMapper _mapper;

    public FactTimeStatisticQueryResolver(DataWarehouseReportingContext dwContext, IMapper mapper)
    {
        _dataWarehouseReportingContext = dwContext;
        _mapper = mapper;
    }

    public void Resolve(GraphQlQuery graphQlQuery)
    {
        _ = graphQlQuery.Field<ListGraphType<FactTimeStatisticType>>(
            "getFactTimeStatistics",
            arguments: new QueryArguments(
                new QueryArgument<StringGraphType> { Name = "orderBy" },
                new QueryArgument<IntGraphType> { Name = "returnIndex" },
                new QueryArgument<IntGraphType> { Name = "returnCount" },
                new QueryArgument<DateTimeGraphType> { Name = "filterLoadDateTimeAfter" },
                new QueryArgument<DateTimeGraphType> { Name = "filterLoadDateTimeBefore" },
                new QueryArgument<DateTimeGraphType> { Name = "filterAssociatedDateAfter" },
                new QueryArgument<DateTimeGraphType> { Name = "filterAssociatedDateBefore" },
                new QueryArgument<IntGraphType> { Name = "filterDaysLoadedAgo" }),
            resolve: context =>
            {
                var orderBy = context.GetArgument<string>("orderBy");
                var returnIndex = context.GetArgument<int?>("returnIndex");
                var returnCount = context.GetArgument<int?>("returnCount");
                var filterLoadDateTimeAfter = context.GetArgument<DateTime>("filterLoadDateTimeAfter");
                var filterLoadDateTimeBefore = context.GetArgument<DateTime>("filterLoadDateTimeBefore");
                var filterAssociatedDateAfter = context.GetArgument<DateTime>("filterAssociatedDateAfter");
                var filterAssociatedDateBefore = context.GetArgument<DateTime>("filterAssociatedDateBefore");
                var filterDaysLoadedAgo = context.GetArgument<int?>("filterDaysLoadedAgo");

                returnIndex ??= 0;
                returnCount ??= int.MaxValue;

                if (returnIndex < 0)
                {
                    return new Response(StatusCodes.Error, "returnIndex must be a number 0 or greater");
                }

                if (returnCount <= 0)
                {
                    return new Response(StatusCodes.Error, "returnCount must be a positive number");
                }

                var factTimeStatistics = _dataWarehouseReportingContext.FactTimeStatistics.ApplyPaging(returnCount.Value, returnIndex.Value).ToList();

                if (filterLoadDateTimeAfter != default)
                {
                    if (filterLoadDateTimeAfter.TimeOfDay == TimeSpan.Zero)
                    {
                        factTimeStatistics = factTimeStatistics.Where(x => x.LoadDateTime.Date > filterLoadDateTimeAfter).ToList();
                    }
                    else
                    {
                        factTimeStatistics = factTimeStatistics.Where(x => x.LoadDateTime > filterLoadDateTimeAfter).ToList();
                    }
                }

                if (filterLoadDateTimeBefore != default)
                {
                    if (filterLoadDateTimeBefore.TimeOfDay == TimeSpan.Zero)
                    {
                        factTimeStatistics = factTimeStatistics.Where(x => x.LoadDateTime.Date < filterLoadDateTimeBefore).ToList();
                    }
                    else
                    {
                        factTimeStatistics = factTimeStatistics.Where(x => x.LoadDateTime < filterLoadDateTimeBefore).ToList();
                    }
                }

                if (filterAssociatedDateAfter != default)
                {
                    if (filterAssociatedDateAfter.TimeOfDay == TimeSpan.Zero)
                    {
                        factTimeStatistics = factTimeStatistics.Where(x => x.AssociatedDate.Date > filterAssociatedDateAfter).ToList();
                    }
                    else
                    {
                        factTimeStatistics = factTimeStatistics.Where(x => x.AssociatedDate > filterAssociatedDateAfter).ToList();
                    }
                }

                if (filterAssociatedDateBefore != default)
                {
                    if (filterAssociatedDateBefore.TimeOfDay == TimeSpan.Zero)
                    {
                        factTimeStatistics = factTimeStatistics.Where(x => x.AssociatedDate.Date < filterAssociatedDateBefore).ToList();
                    }
                    else
                    {
                        factTimeStatistics = factTimeStatistics.Where(x => x.AssociatedDate < filterAssociatedDateBefore).ToList();
                    }
                }

                if (filterDaysLoadedAgo != null)
                {
                    factTimeStatistics = factTimeStatistics.Where(x => x.LoadDateTime.Date == DateTime.UtcNow.AddDays(-filterDaysLoadedAgo.Value).Date).ToList();
                }

                if (!string.IsNullOrEmpty(orderBy))
                {
                    factTimeStatistics = orderBy.OrderByFields(factTimeStatistics);
                }

                var factTimeStatisticsModel = _mapper.Map<List<FactTimeStatistic>>(factTimeStatistics);

                return factTimeStatisticsModel;
            });
    }
}