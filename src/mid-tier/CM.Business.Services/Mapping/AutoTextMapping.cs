using AutoMapper;
using CM.Business.Entities.Models.AutoText;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class AutoTextMapping : Profile
{
    public AutoTextMapping()
    {
        CreateMap<AutoTextRequest, Data.Model.AutoText>();
        CreateMap<AutoTextPatchRequest, Data.Model.AutoText>();
        CreateMap<AutoTextPostRequest, Data.Model.AutoText>();
        CreateMap<Data.Model.AutoText, AutoTextRequest>();
        CreateMap<Data.Model.AutoText, AutoTextPatchRequest>();
        CreateMap<Data.Model.AutoText, AutoTextResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
    }
}