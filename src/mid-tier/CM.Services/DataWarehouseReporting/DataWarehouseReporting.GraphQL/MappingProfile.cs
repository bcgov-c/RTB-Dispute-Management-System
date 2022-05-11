using AutoMapper;
using DataWarehouseReporting.Data.Models;
using DataWarehouseReporting.GraphQL.Types;

namespace DataWarehouseReporting.GraphQL;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<DimCity, DimCityType>(MemberList.Destination);
        CreateMap<DimTime, DimTimeType>(MemberList.Destination);
        CreateMap<FactDisputeSummary, FactDisputeSummaryType>(MemberList.Destination);
        CreateMap<FactHearingSummary, FactHearingSummaryType>(MemberList.Destination);
        CreateMap<FactTimeStatistic, FactTimeStatisticType>(MemberList.Destination);
        CreateMap<LoadingHistory, LoadingHistoryType>(MemberList.Destination);
    }
}