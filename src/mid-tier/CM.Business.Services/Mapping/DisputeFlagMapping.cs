using AutoMapper;
using CM.Business.Entities.Models.DisputeFlag;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class DisputeFlagMapping : Profile
{
    public DisputeFlagMapping()
    {
        CreateMap<Data.Model.DisputeFlag, PatchDisputeFlagRequest>();
        CreateMap<PatchDisputeFlagRequest, Data.Model.DisputeFlag>();
        CreateMap<PostDisputeFlagRequest, Data.Model.DisputeFlag>();
        CreateMap<Data.Model.DisputeFlag, PostDisputeFlagResponse>()
            .ForMember(x => x.FlagStartDate, opt => opt.MapFrom(src => src.FlagStartDate.ToCmDateTimeString()))
            .ForMember(x => x.FlagEndDate, opt => opt.MapFrom(src => src.FlagEndDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.FileNumber, opt => opt.MapFrom(src => src.Dispute.FileNumber));
    }
}