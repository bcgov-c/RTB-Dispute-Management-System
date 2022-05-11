using AutoMapper;
using CM.Business.Entities.Models.SiteVersion;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class SiteVersionMapping : Profile
{
    public SiteVersionMapping()
    {
        CreateMap<Data.Model.SiteVersion, SiteVersionResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ReleaseDate, opt => opt.MapFrom(src => src.ReleaseDate.ToCmDateTimeString()))
            .ForMember(x => x.UiVersionDate, opt => opt.MapFrom(src => src.UiVersionDate.ToCmDateTimeString()))
            .ForMember(x => x.MidTierVersionDate, opt => opt.MapFrom(src => src.MidTierVersionDate.ToCmDateTimeString()))
            .ForMember(x => x.PdfVersionDate, opt => opt.MapFrom(src => src.PdfVersionDate.ToCmDateTimeString()))
            .ForMember(x => x.EmailGeneratorVersionDate, opt => opt.MapFrom(src => src.EmailGeneratorVersionDate.ToCmDateTimeString()))
            .ForMember(x => x.EmailNotificationVersionDate, opt => opt.MapFrom(src => src.EmailNotificationVersionDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()));
    }
}