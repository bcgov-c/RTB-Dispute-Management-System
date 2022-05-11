using AutoMapper;
using CM.Business.Entities.Models.Remedy;
using CM.Business.Entities.Models.RemedyDetail;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Mapping;

public class RemedyMapping : Profile
{
    public RemedyMapping()
    {
        CreateMap<Remedy, RemedyResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.AwardedDate, opt => opt.MapFrom(src => src.AwardedDate.ToCmDateTimeString()))
            .ForMember(x => x.PrevAwardDate, opt => opt.MapFrom(src => src.PrevAwardDate.ToCmDateTimeString()))
            .ForMember(x => x.PrevAwardedDate, opt => opt.MapFrom(src => src.PrevAwardedDate.ToCmDateTimeString()));
        CreateMap<Remedy, RemedyRequest>();
        CreateMap<RemedyRequest, Remedy>();

        CreateMap<RemedyDetail, RemedyDetailResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.AssociatedDate, opt => opt.MapFrom(src => src.AssociatedDate.ToCmDateTimeString()));
        CreateMap<RemedyDetail, RemedyDetailRequest>();
        CreateMap<RemedyDetailRequest, RemedyDetail>();

        CreateMap<Remedy, IssueRemedyResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.AwardedDate, opt => opt.MapFrom(src => src.AwardedDate.ToCmDateTimeString()))
            .ForMember(x => x.PrevAwardDate, opt => opt.MapFrom(src => src.PrevAwardDate.ToCmDateTimeString()))
            .ForMember(x => x.PrevAwardedDate, opt => opt.MapFrom(src => src.PrevAwardedDate.ToCmDateTimeString()));
        CreateMap<RemedyDetail, IssueRemedyDetailResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
    }
}