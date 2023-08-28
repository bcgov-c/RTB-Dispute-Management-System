using AutoMapper;
using CM.Business.Entities.Models.Files;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Mapping;

public class CommonFileMapping : Profile
{
    public CommonFileMapping()
    {
        CreateMap<CommonFileRequest, CommonFile>();

        CreateMap<CommonFile, CommonFileResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

        CreateMap<CommonFilePatchRequest, CommonFile>();
        CreateMap<CommonFile, CommonFilePatchRequest>();

        CreateMap<CommonFile, ExternalCommonFile>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
    }
}