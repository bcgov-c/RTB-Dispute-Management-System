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

namespace DataWarehouseReporting.GraphQL.Resolvers
{
    public class FactIntakeProcessingQueryResolver : IQueryResolver
    {
        private readonly DataWarehouseReportingContext _dataWarehouseReportingContext;
        private readonly IMapper _mapper;

        public FactIntakeProcessingQueryResolver(DataWarehouseReportingContext dwContext, IMapper mapper)
        {
            _dataWarehouseReportingContext = dwContext;
            _mapper = mapper;
        }

        public void Resolve(GraphQlQuery graphQlQuery)
        {
            _ = graphQlQuery.Field<ListGraphType<FactIntakeProcessingType>>(
            "getFactIntakeProcessing",
            arguments: new QueryArguments(
                new QueryArgument<StringGraphType> { Name = "orderBy" },
                new QueryArgument<IntGraphType> { Name = "returnIndex" },
                new QueryArgument<IntGraphType> { Name = "returnCount" },
                new QueryArgument<ListGraphType<GuidGraphType>> { Name = "filterDisputeGuid" },
                new QueryArgument<DateTimeGraphType> { Name = "filterProcessEndDateTimeBefore" },
                new QueryArgument<DateTimeGraphType> { Name = "filterProcessEndDateTimeAfter" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterLastAssignedOwner" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterProcessEndStage" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterProcessEndStatus" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterProcessEndProcess" },
                new QueryArgument<DateTimeGraphType> { Name = "filterLoadDateTimeAfter" },
                new QueryArgument<DateTimeGraphType> { Name = "filterLoadDateTimeBefore" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterCreationMethod" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterDisputeType" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterDisputeSubType" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterSharedHearingLinkType" }),
            resolve: context =>
            {
                var orderBy = context.GetArgument<string>("orderBy");
                var returnIndex = context.GetArgument<int?>("returnIndex");
                var returnCount = context.GetArgument<int?>("returnCount");
                var filterDisputeGuid = context.GetArgument<List<Guid>>("filterDisputeGuid");
                var filterProcessEndDateTimeBefore = context.GetArgument<DateTime>("filterProcessEndDateTimeBefore");
                var filterProcessEndDateTimeAfter = context.GetArgument<DateTime>("filterProcessEndDateTimeAfter");
                var filterLastAssignedOwner = context.GetArgument<List<int>>("filterLastAssignedOwner");
                var filterProcessEndStage = context.GetArgument<List<int>>("filterProcessEndStage");
                var filterProcessEndStatus = context.GetArgument<List<int>>("filterProcessEndStatus");
                var filterProcessEndProcess = context.GetArgument<List<int>>("filterProcessEndProcess");
                var filterLoadDateTimeAfter = context.GetArgument<DateTime>("filterLoadDateTimeAfter");
                var filterLoadDateTimeBefore = context.GetArgument<DateTime>("filterLoadDateTimeBefore");
                var filterCreationMethod = context.GetArgument<List<int>>("filterCreationMethod");
                var filterDisputeType = context.GetArgument<List<int>>("filterDisputeType");
                var filterDisputeSubType = context.GetArgument<List<int>>("filterDisputeSubType");
                var filterSharedHearingLinkType = context.GetArgument<List<int>>("filterSharedHearingLinkType");

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

                var factIntakeProcessing = _dataWarehouseReportingContext.FactIntakeProcessings.ApplyPaging(returnCount.Value, returnIndex.Value).ToList();

                if (filterDisputeGuid != null)
                {
                    factIntakeProcessing = factIntakeProcessing
                    .Where(x => x.DisputeGuid.HasValue && filterDisputeGuid.Contains(x.DisputeGuid.Value)).ToList();
                }

                if (filterProcessEndDateTimeAfter != default)
                {
                    if (filterProcessEndDateTimeAfter.TimeOfDay == TimeSpan.Zero)
                    {
                        factIntakeProcessing = factIntakeProcessing.Where(x => x.ProcessEndDateTime.HasValue && x.ProcessEndDateTime.Value.Date >= filterProcessEndDateTimeAfter).ToList();
                    }
                    else
                    {
                        factIntakeProcessing = factIntakeProcessing.Where(x => x.ProcessEndDateTime.HasValue && x.ProcessEndDateTime.Value >= filterProcessEndDateTimeAfter).ToList();
                    }
                }

                if (filterProcessEndDateTimeBefore != default)
                {
                    if (filterProcessEndDateTimeBefore.TimeOfDay == TimeSpan.Zero)
                    {
                        factIntakeProcessing = factIntakeProcessing.Where(x => x.ProcessEndDateTime.HasValue && x.ProcessEndDateTime.Value.Date < filterProcessEndDateTimeBefore).ToList();
                    }
                    else
                    {
                        factIntakeProcessing = factIntakeProcessing.Where(x => x.ProcessEndDateTime.HasValue && x.ProcessEndDateTime.Value < filterProcessEndDateTimeBefore).ToList();
                    }
                }

                if (filterLastAssignedOwner != null)
                {
                    factIntakeProcessing = factIntakeProcessing
                    .Where(x => x.LastAssignedOwner != null && filterLastAssignedOwner.Contains(x.LastAssignedOwner.Value)).ToList();
                }

                if (filterProcessEndStage != null)
                {
                    factIntakeProcessing = factIntakeProcessing
                    .Where(x => x.ProcessEndStage != null && filterProcessEndStage.Contains(x.ProcessEndStage.Value)).ToList();
                }

                if (filterProcessEndStatus != null)
                {
                    factIntakeProcessing = factIntakeProcessing
                    .Where(x => x.ProcessEndStatus != null && filterProcessEndStatus.Contains(x.ProcessEndStatus.Value)).ToList();
                }

                if (filterProcessEndProcess != null)
                {
                    factIntakeProcessing = factIntakeProcessing
                    .Where(x => x.ProcessEndProcess != null && filterProcessEndProcess.Contains(x.ProcessEndProcess.Value)).ToList();
                }

                if (filterLoadDateTimeAfter != default)
                {
                    if (filterLoadDateTimeAfter.TimeOfDay == TimeSpan.Zero)
                    {
                        factIntakeProcessing = factIntakeProcessing.Where(x => x.LoadDateTime.Date >= filterLoadDateTimeAfter).ToList();
                    }
                    else
                    {
                        factIntakeProcessing = factIntakeProcessing.Where(x => x.LoadDateTime >= filterLoadDateTimeAfter).ToList();
                    }
                }

                if (filterLoadDateTimeBefore != default)
                {
                    if (filterLoadDateTimeBefore.TimeOfDay == TimeSpan.Zero)
                    {
                        factIntakeProcessing = factIntakeProcessing.Where(x => x.LoadDateTime.Date < filterLoadDateTimeBefore).ToList();
                    }
                    else
                    {
                        factIntakeProcessing = factIntakeProcessing.Where(x => x.LoadDateTime < filterLoadDateTimeBefore).ToList();
                    }
                }

                if (filterCreationMethod != null)
                {
                    factIntakeProcessing = factIntakeProcessing
                    .Where(x => x.CreationMethod != null && filterCreationMethod.Contains(x.CreationMethod.Value)).ToList();
                }

                if (filterDisputeType != null)
                {
                    factIntakeProcessing = factIntakeProcessing
                    .Where(x => x.DisputeType != null && filterDisputeType.Contains(x.DisputeType.Value)).ToList();
                }

                if (filterDisputeSubType != null)
                {
                    factIntakeProcessing = factIntakeProcessing
                    .Where(x => x.DisputeSubType.HasValue && filterDisputeSubType.Contains(x.DisputeSubType.Value)).ToList();
                }

                if (filterSharedHearingLinkType != null)
                {
                    factIntakeProcessing = factIntakeProcessing
                    .Where(x => x.SharedHearingLinkingType.HasValue && filterSharedHearingLinkType.Contains(x.SharedHearingLinkingType.Value)).ToList();
                }

                if (!string.IsNullOrEmpty(orderBy))
                {
                    factIntakeProcessing = orderBy.OrderByFields(factIntakeProcessing);
                }

                var factDisputeSummariesModel = _mapper.Map<List<FactIntakeProcessing>>(factIntakeProcessing);

                return factDisputeSummariesModel;
            });
        }
    }
}
