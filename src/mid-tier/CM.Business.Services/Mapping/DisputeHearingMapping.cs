using AutoMapper;
using CM.Business.Entities.Models.DisputeHearing;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class DisputeHearingMapping : Profile
{
    public DisputeHearingMapping()
    {
        CreateMap<Data.Model.DisputeHearing, DisputeHearingRequest>();
        CreateMap<DisputeHearingRequest, Data.Model.DisputeHearing>();

        CreateMap<Data.Model.DisputeHearing, DisputeHearingPatchRequest>();
        CreateMap<DisputeHearingPatchRequest, Data.Model.DisputeHearing>();

        CreateMap<Data.Model.DisputeHearing, DisputeHearingResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.FileNumber, opt => opt.MapFrom(src => src.Dispute.FileNumber));
    }
}