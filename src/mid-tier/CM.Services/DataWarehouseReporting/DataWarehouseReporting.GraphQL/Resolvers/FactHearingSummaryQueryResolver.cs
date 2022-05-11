using System;
using System.Collections.Generic;
using System.Linq;
using CM.Common.Utilities;
using DataWarehouseReporting.Data;
using DataWarehouseReporting.GraphQL.Helper;
using DataWarehouseReporting.GraphQL.Infrastructure;
using DataWarehouseReporting.GraphQL.Types;
using GraphQL;
using GraphQl.Extensions;
using GraphQL.Types;

namespace DataWarehouseReporting.GraphQL.Resolvers;

public class FactHearingSummaryQueryResolver : IQueryResolver
{
    private readonly DataWarehouseReportingContext _dataWarehouseReportingContext;

    public FactHearingSummaryQueryResolver(DataWarehouseReportingContext dwContext)
    {
        _dataWarehouseReportingContext = dwContext;
    }

    public void Resolve(GraphQlQuery graphQlQuery)
    {
        _ = graphQlQuery.Field<ListGraphType<FactHearingSummaryType>>(
            "getFactHearingSummary",
            arguments: new QueryArguments(
                new QueryArgument<StringGraphType> { Name = "orderBy" },
                new QueryArgument<IntGraphType> { Name = "returnIndex" },
                new QueryArgument<IntGraphType> { Name = "returnCount" },
                new QueryArgument<ListGraphType<GuidGraphType>> { Name = "filterDisputeGuid" },
                new QueryArgument<DateTimeGraphType> { Name = "filterHearingStartingDateTimeBefore" },
                new QueryArgument<DateTimeGraphType> { Name = "filterHearingStartingDateTimeAfter" },
                new QueryArgument<DateTimeGraphType> { Name = "filterInitialPaymentDateTimeAfter" },
                new QueryArgument<DateTimeGraphType> { Name = "filterInitialPaymentDateTimeBefore" },
                new QueryArgument<DateTimeGraphType> { Name = "filterLoadDateTimeAfter" },
                new QueryArgument<DateTimeGraphType> { Name = "filterLoadDateTimeBefore" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterCreationMethod" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterPrimaryProcessId" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterPrimaryDisputeType" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterPrimaryDisputeSubType" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterHearingOwner" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterSharedHearingLinkType" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterHearingPriority" }),
            resolve: context =>
            {
                var orderBy = context.GetArgument<string>("orderBy");
                var returnIndex = context.GetArgument<int?>("returnIndex");
                var returnCount = context.GetArgument<int?>("returnCount");
                var filterDisputeGuid = context.GetArgument<List<Guid>>("filterDisputeGuid");
                var filterHearingStartingDateTimeAfter = context.GetArgument<DateTime>("filterHearingStartingDateTimeAfter");
                var filterHearingStartingDateTimeBefore = context.GetArgument<DateTime>("filterHearingStartingDateTimeBefore");
                var filterInitialPaymentDateTimeAfter = context.GetArgument<DateTime>("filterInitialPaymentDateTimeAfter");
                var filterInitialPaymentDateTimeBefore = context.GetArgument<DateTime>("filterInitialPaymentDateTimeBefore");
                var filterLoadDateTimeAfter = context.GetArgument<DateTime>("filterLoadDateTimeAfter");
                var filterLoadDateTimeBefore = context.GetArgument<DateTime>("filterLoadDateTimeBefore");
                var filterCreationMethod = context.GetArgument<List<int>>("filterCreationMethod");
                var filterPrimaryProcessId = context.GetArgument<List<int>>("filterPrimaryProcessId");
                var filterPrimaryDisputeType = context.GetArgument<List<int>>("filterPrimaryDisputeType");
                var filterPrimaryDisputeSubType = context.GetArgument<List<int>>("filterPrimaryDisputeSubType");
                var filterHearingOwner = context.GetArgument<List<int>>("filterHearingOwner");
                var filterSharedHearingLinkType = context.GetArgument<List<int>>("filterSharedHearingLinkType");
                var filterHearingPriority = context.GetArgument<List<int>>("filterHearingPriority");

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

                var factHearingSummaries = _dataWarehouseReportingContext.FactHearingSummaries.ApplyPaging(returnCount.Value, returnIndex.Value).ToList();

                if (filterDisputeGuid != null)
                {
                    factHearingSummaries = factHearingSummaries.Where(x => filterDisputeGuid.Contains(x.DisputeGuid.GetValueOrDefault())).ToList();
                }

                if (filterHearingStartingDateTimeAfter != default)
                {
                    if (filterHearingStartingDateTimeAfter.TimeOfDay == TimeSpan.Zero)
                    {
                        factHearingSummaries = factHearingSummaries.Where(x => x.HearingStartDateTime.HasValue && x.HearingStartDateTime.Value.Date >= filterHearingStartingDateTimeAfter).ToList();
                    }
                    else
                    {
                        factHearingSummaries = factHearingSummaries.Where(x => x.HearingStartDateTime.HasValue && x.HearingStartDateTime.Value >= filterHearingStartingDateTimeAfter).ToList();
                    }
                }

                if (filterHearingStartingDateTimeBefore != default)
                {
                    if (filterHearingStartingDateTimeBefore.TimeOfDay == TimeSpan.Zero)
                    {
                        factHearingSummaries = factHearingSummaries.Where(x => x.HearingStartDateTime.HasValue && x.HearingStartDateTime.Value.Date < filterHearingStartingDateTimeBefore).ToList();
                    }
                    else
                    {
                        factHearingSummaries = factHearingSummaries.Where(x => x.HearingStartDateTime.HasValue && x.HearingStartDateTime.Value < filterHearingStartingDateTimeBefore).ToList();
                    }
                }

                if (filterInitialPaymentDateTimeAfter != default)
                {
                    if (filterInitialPaymentDateTimeAfter.TimeOfDay == TimeSpan.Zero)
                    {
                        factHearingSummaries = factHearingSummaries.Where(x => x.PrimaryInitialPaymentDateTime.HasValue && x.PrimaryInitialPaymentDateTime.Value.Date >= filterInitialPaymentDateTimeAfter).ToList();
                    }
                    else
                    {
                        factHearingSummaries = factHearingSummaries.Where(x => x.PrimaryInitialPaymentDateTime.HasValue && x.PrimaryInitialPaymentDateTime.Value >= filterInitialPaymentDateTimeAfter).ToList();
                    }
                }

                if (filterInitialPaymentDateTimeBefore != default)
                {
                    if (filterInitialPaymentDateTimeBefore.TimeOfDay == TimeSpan.Zero)
                    {
                        factHearingSummaries = factHearingSummaries.Where(x => x.PrimaryInitialPaymentDateTime.HasValue && x.PrimaryInitialPaymentDateTime.Value.Date < filterInitialPaymentDateTimeAfter).ToList();
                    }
                    else
                    {
                        factHearingSummaries = factHearingSummaries.Where(x => x.PrimaryInitialPaymentDateTime.HasValue && x.PrimaryInitialPaymentDateTime.Value < filterInitialPaymentDateTimeAfter).ToList();
                    }
                }

                if (filterLoadDateTimeAfter != default)
                {
                    if (filterLoadDateTimeAfter.TimeOfDay == TimeSpan.Zero)
                    {
                        factHearingSummaries = factHearingSummaries.Where(x => x.LoadDateTime.Date >= filterLoadDateTimeAfter).ToList();
                    }
                    else
                    {
                        factHearingSummaries = factHearingSummaries.Where(x => x.LoadDateTime >= filterLoadDateTimeAfter).ToList();
                    }
                }

                if (filterLoadDateTimeBefore != default)
                {
                    if (filterLoadDateTimeBefore.TimeOfDay == TimeSpan.Zero)
                    {
                        factHearingSummaries = factHearingSummaries.Where(x => x.LoadDateTime.Date < filterLoadDateTimeBefore).ToList();
                    }
                    else
                    {
                        factHearingSummaries = factHearingSummaries.Where(x => x.LoadDateTime < filterLoadDateTimeBefore).ToList();
                    }
                }

                if (filterCreationMethod != null)
                {
                    factHearingSummaries = factHearingSummaries.Where(x => x.PrimaryCreationMethod != null && filterCreationMethod.Contains(x.PrimaryCreationMethod.Value)).ToList();
                }

                if (filterPrimaryProcessId != null)
                {
                    factHearingSummaries = factHearingSummaries.Where(x => x.PrimaryLastProcess != null && filterPrimaryProcessId.Contains(x.PrimaryLastProcess.Value)).ToList();
                }

                if (filterPrimaryDisputeType != null)
                {
                    factHearingSummaries = factHearingSummaries.Where(x => x.PrimaryDisputeType != null && filterPrimaryDisputeType.Contains(x.PrimaryDisputeType.Value)).ToList();
                }

                if (filterPrimaryDisputeSubType != null)
                {
                    factHearingSummaries = factHearingSummaries.Where(x => filterPrimaryDisputeSubType.Contains(x.PrimaryDisputeSubType.GetValueOrDefault())).ToList();
                }

                if (filterHearingOwner != null)
                {
                    factHearingSummaries = factHearingSummaries.Where(x => filterHearingOwner.Contains(x.HearingOwner.GetValueOrDefault())).ToList();
                }

                if (filterSharedHearingLinkType != null)
                {
                    factHearingSummaries = factHearingSummaries.Where(x => filterSharedHearingLinkType.Contains(x.SharedHearingLinkingType.GetValueOrDefault())).ToList();
                }

                if (filterHearingPriority != null)
                {
                    factHearingSummaries = factHearingSummaries.Where(x => filterHearingPriority.Contains(x.HearingPriority.GetValueOrDefault())).ToList();
                }

                if (!string.IsNullOrEmpty(orderBy))
                {
                    factHearingSummaries = orderBy.OrderByFields(factHearingSummaries);
                }

                return factHearingSummaries;
            });
    }
}