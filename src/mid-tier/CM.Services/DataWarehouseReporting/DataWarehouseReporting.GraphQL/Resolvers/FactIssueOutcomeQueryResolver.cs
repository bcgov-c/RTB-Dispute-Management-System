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
    public class FactIssueOutcomeQueryResolver : IQueryResolver
    {
        private readonly DataWarehouseReportingContext _dataWarehouseReportingContext;
        private readonly IMapper _mapper;

        public FactIssueOutcomeQueryResolver(DataWarehouseReportingContext dwContext, IMapper mapper)
        {
            _dataWarehouseReportingContext = dwContext;
            _mapper = mapper;
        }

        public void Resolve(GraphQlQuery graphQlQuery)
        {
            _ = graphQlQuery.Field<ListGraphType<FactIssueOutcomeType>>(
            "getFactIssueOutcome",
            arguments: new QueryArguments(
                new QueryArgument<StringGraphType> { Name = "orderBy" },
                new QueryArgument<IntGraphType> { Name = "returnIndex" },
                new QueryArgument<IntGraphType> { Name = "returnCount" },
                new QueryArgument<ListGraphType<GuidGraphType>> { Name = "filterDisputeGuid" },
                new QueryArgument<DateTimeGraphType> { Name = "filterSubmittedDateTimeAfter" },
                new QueryArgument<DateTimeGraphType> { Name = "filterSubmittedDateTimeBefore" },
                new QueryArgument<DateTimeGraphType> { Name = "filterAwardDateBefore" },
                new QueryArgument<DateTimeGraphType> { Name = "filterAwardDateAfter" },
                new QueryArgument<DateTimeGraphType> { Name = "filterInitialPaymentDateTimeAfter" },
                new QueryArgument<DateTimeGraphType> { Name = "filterInitialPaymentDateTimeBefore" },
                new QueryArgument<DateTimeGraphType> { Name = "filterLoadDateTimeAfter" },
                new QueryArgument<DateTimeGraphType> { Name = "filterLoadDateTimeBefore" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterCreationMethod" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterLastProcessId" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterDisputeType" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterDisputeSubType" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterAwardedBy" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterClaimCode" },
                new QueryArgument<ListGraphType<IntGraphType>> { Name = "filterDisputeUrgency" }),
            resolve: context =>
            {
                var orderBy = context.GetArgument<string>("orderBy");
                var returnIndex = context.GetArgument<int?>("returnIndex");
                var returnCount = context.GetArgument<int?>("returnCount");
                var filterDisputeGuid = context.GetArgument<List<Guid>>("filterDisputeGuid");
                var filterSubmittedDateTimeAfter = context.GetArgument<DateTime>("filterSubmittedDateTimeAfter");
                var filterSubmittedDateTimeBefore = context.GetArgument<DateTime>("filterSubmittedDateTimeBefore");
                var filterAwardDateBefore = context.GetArgument<DateTime>("filterAwardDateBefore");
                var filterAwardDateAfter = context.GetArgument<DateTime>("filterAwardDateAfter");
                var filterInitialPaymentDateTimeAfter = context.GetArgument<DateTime>("filterInitialPaymentDateTimeAfter");
                var filterInitialPaymentDateTimeBefore = context.GetArgument<DateTime>("filterInitialPaymentDateTimeBefore");
                var filterLoadDateTimeAfter = context.GetArgument<DateTime>("filterLoadDateTimeAfter");
                var filterLoadDateTimeBefore = context.GetArgument<DateTime>("filterLoadDateTimeBefore");
                var filterCreationMethod = context.GetArgument<List<int>>("filterCreationMethod");
                var filterLastProcessId = context.GetArgument<List<int>>("filterLastProcessId");
                var filterDisputeType = context.GetArgument<List<int>>("filterDisputeType");
                var filterDisputeSubType = context.GetArgument<List<int>>("filterDisputeSubType");
                var filterAwardedBy = context.GetArgument<List<int>>("filterAwardedBy");
                var filterClaimCode = context.GetArgument<List<int>>("filterClaimCode");
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

                var factIssueOutcomes = _dataWarehouseReportingContext.FactIssueOutcomes.ApplyPaging(returnCount.Value, returnIndex.Value).ToList();

                if (filterDisputeGuid != null)
                {
                    factIssueOutcomes = factIssueOutcomes
                    .Where(x => filterDisputeGuid.Contains(x.DisputeGuid)).ToList();
                }

                if (filterSubmittedDateTimeAfter != default)
                {
                    if (filterSubmittedDateTimeAfter.TimeOfDay == TimeSpan.Zero)
                    {
                        factIssueOutcomes = factIssueOutcomes.Where(x => x.SubmittedDateTime.HasValue && x.SubmittedDateTime.Value.Date >= filterSubmittedDateTimeAfter).ToList();
                    }
                    else
                    {
                        factIssueOutcomes = factIssueOutcomes.Where(x => x.SubmittedDateTime.HasValue && x.SubmittedDateTime.Value >= filterSubmittedDateTimeAfter).ToList();
                    }
                }

                if (filterSubmittedDateTimeBefore != default)
                {
                    if (filterSubmittedDateTimeBefore.TimeOfDay == TimeSpan.Zero)
                    {
                        factIssueOutcomes = factIssueOutcomes.Where(x => x.SubmittedDateTime.HasValue && x.SubmittedDateTime.Value.Date < filterSubmittedDateTimeBefore).ToList();
                    }
                    else
                    {
                        factIssueOutcomes = factIssueOutcomes.Where(x => x.SubmittedDateTime.HasValue && x.SubmittedDateTime.Value < filterSubmittedDateTimeBefore).ToList();
                    }
                }

                if (filterAwardDateAfter != default)
                {
                    if (filterAwardDateAfter.TimeOfDay == TimeSpan.Zero)
                    {
                        factIssueOutcomes = factIssueOutcomes.Where(x => x.AwardDate.HasValue && x.AwardDate.Value.Date >= filterAwardDateAfter).ToList();
                    }
                    else
                    {
                        factIssueOutcomes = factIssueOutcomes.Where(x => x.AwardDate.HasValue && x.AwardDate.Value >= filterAwardDateAfter).ToList();
                    }
                }

                if (filterAwardDateBefore != default)
                {
                    if (filterAwardDateBefore.TimeOfDay == TimeSpan.Zero)
                    {
                        factIssueOutcomes = factIssueOutcomes.Where(x => x.AwardDate.HasValue && x.AwardDate.Value.Date < filterAwardDateBefore).ToList();
                    }
                    else
                    {
                        factIssueOutcomes = factIssueOutcomes.Where(x => x.AwardDate.HasValue && x.AwardDate.Value < filterAwardDateBefore).ToList();
                    }
                }

                if (filterInitialPaymentDateTimeAfter != default)
                {
                    if (filterInitialPaymentDateTimeAfter.TimeOfDay == TimeSpan.Zero)
                    {
                        factIssueOutcomes = factIssueOutcomes.Where(x => x.InitialPaymentDateTime.HasValue && x.InitialPaymentDateTime.Value.Date >= filterInitialPaymentDateTimeAfter).ToList();
                    }
                    else
                    {
                        factIssueOutcomes = factIssueOutcomes.Where(x => x.InitialPaymentDateTime.HasValue && x.InitialPaymentDateTime.Value >= filterInitialPaymentDateTimeAfter).ToList();
                    }
                }

                if (filterInitialPaymentDateTimeBefore != default)
                {
                    if (filterInitialPaymentDateTimeBefore.TimeOfDay == TimeSpan.Zero)
                    {
                        factIssueOutcomes = factIssueOutcomes.Where(x => x.InitialPaymentDateTime.HasValue && x.InitialPaymentDateTime.Value.Date < filterInitialPaymentDateTimeBefore).ToList();
                    }
                    else
                    {
                        factIssueOutcomes = factIssueOutcomes.Where(x => x.InitialPaymentDateTime.HasValue && x.InitialPaymentDateTime.Value < filterInitialPaymentDateTimeBefore).ToList();
                    }
                }

                if (filterLoadDateTimeAfter != default)
                {
                    if (filterLoadDateTimeAfter.TimeOfDay == TimeSpan.Zero)
                    {
                        factIssueOutcomes = factIssueOutcomes.Where(x => x.LoadDateTime.Date >= filterLoadDateTimeAfter).ToList();
                    }
                    else
                    {
                        factIssueOutcomes = factIssueOutcomes.Where(x => x.LoadDateTime >= filterLoadDateTimeAfter).ToList();
                    }
                }

                if (filterLoadDateTimeBefore != default)
                {
                    if (filterLoadDateTimeBefore.TimeOfDay == TimeSpan.Zero)
                    {
                        factIssueOutcomes = factIssueOutcomes.Where(x => x.LoadDateTime.Date < filterLoadDateTimeBefore).ToList();
                    }
                    else
                    {
                        factIssueOutcomes = factIssueOutcomes.Where(x => x.LoadDateTime < filterLoadDateTimeBefore).ToList();
                    }
                }

                if (filterCreationMethod != null)
                {
                    factIssueOutcomes = factIssueOutcomes
                    .Where(x => x.DisputeCreationMethod != null && filterCreationMethod.Contains(x.DisputeCreationMethod.Value)).ToList();
                }

                if (filterDisputeType != null)
                {
                    factIssueOutcomes = factIssueOutcomes
                    .Where(x => x.DisputeType != null && filterDisputeType.Contains(x.DisputeType.Value)).ToList();
                }

                if (filterDisputeSubType != null)
                {
                    factIssueOutcomes = factIssueOutcomes
                    .Where(x => x.DisputeSubType.HasValue && filterDisputeSubType.Contains(x.DisputeSubType.Value)).ToList();
                }

                if (!string.IsNullOrEmpty(orderBy))
                {
                    factIssueOutcomes = orderBy.OrderByFields(factIssueOutcomes);
                }

                var factIssueOutcomesModel = _mapper.Map<List<FactIssueOutcome>>(factIssueOutcomes);

                return factIssueOutcomesModel;
            });
        }
    }
}
