using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using DataWarehouseReporting.Data;
using DataWarehouseReporting.Data.Models;
using DataWarehouseReporting.GraphQL.Infrastructure;
using DataWarehouseReporting.GraphQL.Types;
using GraphQl.Extensions;
using GraphQL.Types;

namespace DataWarehouseReporting.GraphQL.Resolvers;

public class LoadingHistoryQueryResolver : IQueryResolver
{
    private readonly DataWarehouseReportingContext _dataWarehouseReportingContext;
    private readonly IMapper _mapper;

    public LoadingHistoryQueryResolver(DataWarehouseReportingContext dwContext, IMapper mapper)
    {
        _dataWarehouseReportingContext = dwContext;
        _mapper = mapper;
    }

    public void Resolve(GraphQlQuery graphQlQuery)
    {
        graphQlQuery.Field<ListGraphType<LoadingHistoryType>>("getLoadingHistory", resolve: _ =>
        {
            var loadingHistories = _dataWarehouseReportingContext.LoadingHistories.ToList();
            var loadingHistoriesModel = _mapper.Map<List<LoadingHistory>>(loadingHistories);

            return loadingHistoriesModel;
        }).RequirePermission("IdentityAdministrator");
    }
}