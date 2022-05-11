using AutoMapper;
using CM.Business.Entities.Models.Amendment;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class AmendmentMapping : Profile
{
    public AmendmentMapping()
    {
        CreateMap<AmendmentRequest, Data.Model.Amendment>();
        CreateMap<Data.Model.Amendment, AmendmentRequest>();
        CreateMap<Data.Model.Amendment, AmendmentResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
    }
}