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
    public class FactResolutionServiceQueryResolver : IQueryResolver
    {
        private readonly DataWarehouseReportingContext _dataWarehouseReportingContext;
        private readonly IMapper _mapper;

        public FactResolutionServiceQueryResolver(DataWarehouseReportingContext dwContext, IMapper mapper)
        {
            _dataWarehouseReportingContext = dwContext;
            _mapper = mapper;
        }

        public void Resolve(GraphQlQuery graphQlQuery)
        {
            _ = graphQlQuery.Field<ListGraphType<FactResolutionServiceType>>(
            "getFactResolutionService",
            arguments: new QueryArguments(
                new QueryArgument<StringGraphType> { Name = "orderBy" },
                new QueryArgument<IntGraphType> { Name = "returnIndex" },
                new QueryArgument<IntGraphType> { Name = "returnCount" },
                new QueryArgument<ListGraphType<GuidGraphType>> { Name = "filterDisputeGuid" },
                new QueryArgument<DateTimeGraphType> { Name = "filterDocCompletedDateBefore" },
                new QueryArgument<DateTimeGraphType> { Name = "filterDocCompletedDateAfter" },
                new QueryArgument<DateTimeGraphType> { Name = "filterInitialPaymentDateTimeAfter" },
                new QueryArgument<DateTimeGraphType> { Name = "filterInitialPaymentDateTimeBefore" },
                new QueryArgument<DateTimeGraphType> { Name = "filterLoadDateTimeAfter" },
                new QueryArgument<DateTimeGraphType> { Name = "filterLoadDateTimeBefore" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterCreationMethod" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterLastProcessId" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterDisputeType" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterDisputeSubType" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterDocGroupCreatedBy" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterPriorSharedHearingLinkingType" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterDisputeUrgency" }),
            resolve: context =>
            {
                var orderBy = context.GetArgument<string>("orderBy");
                var returnIndex = context.GetArgument<int?>("returnIndex");
                var returnCount = context.GetArgument<int?>("returnCount");
                var filterDisputeGuid = context.GetArgument<List<Guid>>("filterDisputeGuid");
                var filterDocCompletedDateBefore = context.GetArgument<DateTime>("filterDocCompletedDateBefore");
                var filterDocCompletedDateAfter = context.GetArgument<DateTime>("filterDocCompletedDateAfter");
                var filterInitialPaymentDateTimeAfter = context.GetArgument<DateTime>("filterInitialPaymentDateTimeAfter");
                var filterInitialPaymentDateTimeBefore = context.GetArgument<DateTime>("filterInitialPaymentDateTimeBefore");
                var filterLoadDateTimeAfter = context.GetArgument<DateTime>("filterLoadDateTimeAfter");
                var filterLoadDateTimeBefore = context.GetArgument<DateTime>("filterLoadDateTimeBefore");
                var filterCreationMethod = context.GetArgument<List<int>>("filterCreationMethod");
                var filterLastProcessId = context.GetArgument<List<int>>("filterLastProcessId");
                var filterDisputeType = context.GetArgument<List<int>>("filterDisputeType");
                var filterDisputeSubType = context.GetArgument<List<int>>("filterDisputeSubType");
                var filterDocGroupCreatedBy = context.GetArgument<List<int>>("filterDocGroupCreatedBy");
                var filterPriorSharedHearingLinkingType = context.GetArgument<List<int>>("filterPriorSharedHearingLinkingType");
                var filterDisputeUrgency = context.GetArgument<List<int>>("filterDisputeUrgency");

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

                var factResolutionServices = _dataWarehouseReportingContext.FactResolutionServices.ApplyPaging(returnCount.Value, returnIndex.Value).ToList();

                if (filterDisputeGuid != null)
                {
                    factResolutionServices = factResolutionServices
                    .Where(x => x.DisputeGuid.HasValue && filterDisputeGuid.Contains(x.DisputeGuid.Value)).ToList();
                }

                if (filterDocCompletedDateAfter != default)
                {
                    if (filterDocCompletedDateAfter.TimeOfDay == TimeSpan.Zero)
                    {
                        factResolutionServices = factResolutionServices.Where(x => x.DocCompletedDate.HasValue && x.DocCompletedDate.Value.Date >= filterDocCompletedDateAfter).ToList();
                    }
                    else
                    {
                        factResolutionServices = factResolutionServices.Where(x => x.DocCompletedDate.HasValue && x.DocCompletedDate.Value >= filterDocCompletedDateAfter).ToList();
                    }
                }

                if (filterDocCompletedDateBefore != default)
                {
                    if (filterDocCompletedDateBefore.TimeOfDay == TimeSpan.Zero)
                    {
                        factResolutionServices = factResolutionServices.Where(x => x.DocCompletedDate.HasValue && x.DocCompletedDate.Value.Date < filterDocCompletedDateBefore).ToList();
                    }
                    else
                    {
                        factResolutionServices = factResolutionServices.Where(x => x.DocCompletedDate.HasValue && x.DocCompletedDate.Value < filterDocCompletedDateBefore).ToList();
                    }
                }

                if (filterInitialPaymentDateTimeAfter != default)
                {
                    if (filterInitialPaymentDateTimeAfter.TimeOfDay == TimeSpan.Zero)
                    {
                        factResolutionServices = factResolutionServices.Where(x => x.InitialPaymentDateTime.HasValue && x.InitialPaymentDateTime.Value.Date >= filterInitialPaymentDateTimeAfter).ToList();
                    }
                    else
                    {
                        factResolutionServices = factResolutionServices.Where(x => x.InitialPaymentDateTime.HasValue && x.InitialPaymentDateTime.Value >= filterInitialPaymentDateTimeAfter).ToList();
                    }
                }

                if (filterInitialPaymentDateTimeBefore != default)
                {
                    if (filterInitialPaymentDateTimeBefore.TimeOfDay == TimeSpan.Zero)
                    {
                        factResolutionServices = factResolutionServices.Where(x => x.InitialPaymentDateTime.HasValue && x.InitialPaymentDateTime.Value.Date < filterInitialPaymentDateTimeBefore).ToList();
                    }
                    else
                    {
                        factResolutionServices = factResolutionServices.Where(x => x.InitialPaymentDateTime.HasValue && x.InitialPaymentDateTime.Value < filterInitialPaymentDateTimeBefore).ToList();
                    }
                }

                if (filterLoadDateTimeAfter != default)
                {
                    if (filterLoadDateTimeAfter.TimeOfDay == TimeSpan.Zero)
                    {
                        factResolutionServices = factResolutionServices.Where(x => x.LoadDateTime.Date >= filterLoadDateTimeAfter).ToList();
                    }
                    else
                    {
                        factResolutionServices = factResolutionServices.Where(x => x.LoadDateTime >= filterLoadDateTimeAfter).ToList();
                    }
                }

                if (filterLoadDateTimeBefore != default)
                {
                    if (filterLoadDateTimeBefore.TimeOfDay == TimeSpan.Zero)
                    {
                        factResolutionServices = factResolutionServices.Where(x => x.LoadDateTime.Date < filterLoadDateTimeBefore).ToList();
                    }
                    else
                    {
                        factResolutionServices = factResolutionServices.Where(x => x.LoadDateTime < filterLoadDateTimeBefore).ToList();
                    }
                }

                if (filterCreationMethod != null)
                {
                    factResolutionServices = factResolutionServices
                    .Where(x => x.CreationMethod != null && filterCreationMethod.Contains(x.DisputeCreationMethod.Value)).ToList();
                }

                if (filterLastProcessId != null)
                {
                    factResolutionServices = factResolutionServices
                    .Where(x => x.LastProcess != null && filterLastProcessId.Contains(x.LastProcess.Value)).ToList();
                }

                if (filterDisputeType != null)
                {
                    factResolutionServices = factResolutionServices
                    .Where(x => x.DisputeType != null && filterDisputeType.Contains(x.DisputeType.Value)).ToList();
                }

                if (filterDisputeSubType != null)
                {
                    factResolutionServices = factResolutionServices
                    .Where(x => x.DisputeSubType.HasValue && filterDisputeSubType.Contains(x.DisputeSubType.Value)).ToList();
                }

                if (!string.IsNullOrEmpty(orderBy))
                {
                    factResolutionServices = orderBy.OrderByFields(factResolutionServices);
                }

                var factDisputeSummariesModel = _mapper.Map<List<FactResolutionService>>(factResolutionServices);

                return factDisputeSummariesModel;
            });
        }
    }
}
