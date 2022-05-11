using AutoMapper;
using CM.Business.Entities.Models.Claim;
using CM.Business.Entities.Models.ClaimDetail;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Mapping;

public class ClaimMapping : Profile
{
    public ClaimMapping()
    {
        CreateMap<Claim, ClaimResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
        CreateMap<Claim, ClaimRequest>();
        CreateMap<ClaimRequest, Claim>();

        CreateMap<ClaimDetail, ClaimDetailResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.NoticeDate, opt => opt.MapFrom(src => src.NoticeDate.ToCmDateTimeString()));
        CreateMap<ClaimDetail, ClaimDetailRequest>();
        CreateMap<ClaimDetailRequest, ClaimDetail>();

        CreateMap<Claim, IssueClaimResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.Remedies, opt => opt.MapFrom(src => src.Remedies));
        CreateMap<ClaimDetail, IssueClaimDetailResponse>()
            .ForMember(x => x.NoticeDate, opt => opt.MapFrom(src => src.NoticeDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
    }
}