using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using DataWarehouseReporting.Data;
using DataWarehouseReporting.Data.Models;
using DataWarehouseReporting.GraphQL.Infrastructure;
using DataWarehouseReporting.GraphQL.Types;
using GraphQL.Types;

namespace DataWarehouseReporting.GraphQL.Resolvers;

public class DimTimeQueryResolver : IQueryResolver
{
    private readonly DataWarehouseReportingContext _dataWarehouseReportingContext;
    private readonly IMapper _mapper;

    public DimTimeQueryResolver(DataWarehouseReportingContext dwContext, IMapper mapper)
    {
        _dataWarehouseReportingContext = dwContext;
        _mapper = mapper;
    }

    public void Resolve(GraphQlQuery graphQlQuery)
    {
        graphQlQuery.Field<ListGraphType<DimTimeType>>("getDimTime", resolve: _ =>
        {
            var dimTimes = _dataWarehouseReportingContext.DimTimes.ToList();
            var dimTimesModel = _mapper.Map<List<DimTime>>(dimTimes);

            return dimTimesModel;
        });
    }
}