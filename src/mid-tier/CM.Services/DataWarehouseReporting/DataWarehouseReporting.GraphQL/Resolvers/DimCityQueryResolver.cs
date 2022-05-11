using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using DataWarehouseReporting.Data;
using DataWarehouseReporting.Data.Models;
using DataWarehouseReporting.GraphQL.Infrastructure;
using DataWarehouseReporting.GraphQL.Types;
using GraphQL.Types;

namespace DataWarehouseReporting.GraphQL.Resolvers;

public class DimCityQueryResolver : IQueryResolver
{
    private readonly DataWarehouseReportingContext _dataWarehouseReportingContext;
    private readonly IMapper _mapper;

    public DimCityQueryResolver(DataWarehouseReportingContext dwContext, IMapper mapper)
    {
        _dataWarehouseReportingContext = dwContext;
        _mapper = mapper;
    }

    public void Resolve(GraphQlQuery graphQlQuery)
    {
        graphQlQuery.Field<ListGraphType<DimCityType>>("getDimCity", resolve: _ =>
        {
            var dimCities = _dataWarehouseReportingContext.DimCities.ToList();
            var dimCitiesModel = _mapper.Map<List<DimCity>>(dimCities);

            return dimCitiesModel;
        });
    }
}