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

public class FactDisputeSummaryQueryResolver : IQueryResolver
{
    private readonly DataWarehouseReportingContext _dataWarehouseReportingContext;
    private readonly IMapper _mapper;

    public FactDisputeSummaryQueryResolver(DataWarehouseReportingContext dwContext, IMapper mapper)
    {
        _dataWarehouseReportingContext = dwContext;
        _mapper = mapper;
    }

    public void Resolve(GraphQlQuery graphQlQuery)
    {
        _ = graphQlQuery.Field<ListGraphType<FactDisputeSummaryType>>(
            "getFactDisputeSummary",
            arguments: new QueryArguments(
                new QueryArgument<StringGraphType> { Name = "orderBy" },
                new QueryArgument<IntGraphType> { Name = "returnIndex" },
                new QueryArgument<IntGraphType> { Name = "returnCount" },
                new QueryArgument<ListGraphType<GuidGraphType>> { Name = "filterDisputeGuid" },
                new QueryArgument<DateTimeGraphType> { Name = "filterSubmittedDateTimeAfter" },
                new QueryArgument<DateTimeGraphType> { Name = "filterSubmittedDateTimeBefore" },
                new QueryArgument<DateTimeGraphType> { Name = "filterInitialPaymentDateTimeAfter" },
                new QueryArgument<DateTimeGraphType> { Name = "filterInitialPaymentDateTimeBefore" },
                new QueryArgument<DateTimeGraphType> { Name = "filterLoadDateTimeAfter" },
                new QueryArgument<DateTimeGraphType> { Name = "filterLoadDateTimeBefore" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterCreationMethod" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterLastProcess" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterLastStatus" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterDisputeType" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterDisputeSubType" }),
            resolve: context =>
            {
                var orderBy = context.GetArgument<string>("orderBy");
                var returnIndex = context.GetArgument<int?>("returnIndex");
                var returnCount = context.GetArgument<int?>("returnCount");
                var filterDisputeGuid = context.GetArgument<List<Guid>>("filterDisputeGuid");
                var filterSubmittedDateTimeAfter = context.GetArgument<DateTime>("filterSubmittedDateTimeAfter");
                var filterSubmittedDateTimeBefore = context.GetArgument<DateTime>("filterSubmittedDateTimeBefore");
                var filterInitialPaymentDateTimeAfter = context.GetArgument<DateTime>("filterInitialPaymentDateTimeAfter");
                var filterInitialPaymentDateTimeBefore = context.GetArgument<DateTime>("filterInitialPaymentDateTimeBefore");
                var filterLoadDateTimeAfter = context.GetArgument<DateTime>("filterLoadDateTimeAfter");
                var filterLoadDateTimeBefore = context.GetArgument<DateTime>("filterLoadDateTimeBefore");
                var filterCreationMethod = context.GetArgument<List<int>>("filterCreationMethod");
                var filterLastProcess = context.GetArgument<List<int>>("filterLastProcess");
                var filterLastStatus = context.GetArgument<List<int>>("filterLastStatus");
                var filterDisputeType = context.GetArgument<List<int>>("filterDisputeType");
                var filterDisputeSubType = context.GetArgument<List<int>>("filterDisputeSubType");

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

                var factDisputeSummaries = _dataWarehouseReportingContext.FactDisputeSummaries.ApplyPaging(returnCount.Value, returnIndex.Value).ToList();

                if (filterDisputeGuid != null)
                {
                    factDisputeSummaries = factDisputeSummaries.Where(x => filterDisputeGuid.Contains(x.DisputeGuid)).ToList();
                }

                if (filterSubmittedDateTimeAfter != default)
                {
                    if (filterSubmittedDateTimeAfter.TimeOfDay == TimeSpan.Zero)
                    {
                        factDisputeSummaries = factDisputeSummaries.Where(x => x.SubmittedDateTime.HasValue && x.SubmittedDateTime.Value.Date >= filterSubmittedDateTimeAfter).ToList();
                    }
                    else
                    {
                        factDisputeSummaries = factDisputeSummaries.Where(x => x.SubmittedDateTime.HasValue && x.SubmittedDateTime.Value >= filterSubmittedDateTimeAfter).ToList();
                    }
                }

                if (filterSubmittedDateTimeBefore != default)
                {
                    if (filterSubmittedDateTimeBefore.TimeOfDay == TimeSpan.Zero)
                    {
                        factDisputeSummaries = factDisputeSummaries.Where(x => x.SubmittedDateTime.HasValue && x.SubmittedDateTime.Value.Date < filterSubmittedDateTimeBefore).ToList();
                    }
                    else
                    {
                        factDisputeSummaries = factDisputeSummaries.Where(x => x.SubmittedDateTime.HasValue && x.SubmittedDateTime.Value < filterSubmittedDateTimeBefore).ToList();
                    }
                }

                if (filterInitialPaymentDateTimeAfter != default)
                {
                    if (filterInitialPaymentDateTimeAfter.TimeOfDay == TimeSpan.Zero)
                    {
                        factDisputeSummaries = factDisputeSummaries.Where(x => x.InitialPaymentDateTime.HasValue && x.InitialPaymentDateTime.Value.Date >= filterInitialPaymentDateTimeAfter).ToList();
                    }
                    else
                    {
                        factDisputeSummaries = factDisputeSummaries.Where(x => x.InitialPaymentDateTime.HasValue && x.InitialPaymentDateTime.Value >= filterInitialPaymentDateTimeAfter).ToList();
                    }
                }

                if (filterInitialPaymentDateTimeBefore != default)
                {
                    if (filterInitialPaymentDateTimeBefore.TimeOfDay == TimeSpan.Zero)
                    {
                        factDisputeSummaries = factDisputeSummaries.Where(x => x.InitialPaymentDateTime.HasValue && x.InitialPaymentDateTime.Value.Date < filterInitialPaymentDateTimeBefore).ToList();
                    }
                    else
                    {
                        factDisputeSummaries = factDisputeSummaries.Where(x => x.InitialPaymentDateTime.HasValue && x.InitialPaymentDateTime.Value < filterInitialPaymentDateTimeBefore).ToList();
                    }
                }

                if (filterLoadDateTimeAfter != default)
                {
                    if (filterLoadDateTimeAfter.TimeOfDay == TimeSpan.Zero)
                    {
                        factDisputeSummaries = factDisputeSummaries.Where(x => x.LoadDateTime.Date >= filterLoadDateTimeAfter).ToList();
                    }
                    else
                    {
                        factDisputeSummaries = factDisputeSummaries.Where(x => x.LoadDateTime >= filterLoadDateTimeAfter).ToList();
                    }
                }

                if (filterLoadDateTimeBefore != default)
                {
                    if (filterLoadDateTimeBefore.TimeOfDay == TimeSpan.Zero)
                    {
                        factDisputeSummaries = factDisputeSummaries.Where(x => x.LoadDateTime.Date < filterLoadDateTimeBefore).ToList();
                    }
                    else
                    {
                        factDisputeSummaries = factDisputeSummaries.Where(x => x.LoadDateTime < filterLoadDateTimeBefore).ToList();
                    }
                }

                if (filterCreationMethod != null)
                {
                    factDisputeSummaries = factDisputeSummaries.Where(x => x.CreationMethod != null && filterCreationMethod.Contains(x.CreationMethod.Value)).ToList();
                }

                if (filterLastProcess != null)
                {
                    factDisputeSummaries = factDisputeSummaries.Where(x => x.LastProcess != null && filterLastProcess.Contains(x.LastProcess.Value)).ToList();
                }

                if (filterLastStatus != null)
                {
                    factDisputeSummaries = factDisputeSummaries.Where(x => filterLastStatus.Contains(x.LastStatus)).ToList();
                }

                if (filterDisputeType != null)
                {
                    factDisputeSummaries = factDisputeSummaries.Where(x => x.DisputeType != null && filterDisputeType.Contains(x.DisputeType.Value)).ToList();
                }

                if (filterDisputeSubType != null)
                {
                    factDisputeSummaries = factDisputeSummaries.Where(x => filterDisputeSubType.Contains(x.DisputeSubType)).ToList();
                }

                if (!string.IsNullOrEmpty(orderBy))
                {
                    factDisputeSummaries = orderBy.OrderByFields(factDisputeSummaries);
                }

                var factDisputeSummariesModel = _mapper.Map<List<FactDisputeSummary>>(factDisputeSummaries);

                return factDisputeSummariesModel;
            });
    }
}