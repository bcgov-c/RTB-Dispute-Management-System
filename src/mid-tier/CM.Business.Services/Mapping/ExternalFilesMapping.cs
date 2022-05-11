using AutoMapper;
using CM.Business.Entities.Models.ExternalFile;
using CM.Business.Entities.Models.Files;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Mapping;

public class ExternalFilesMapping : Profile
{
    public ExternalFilesMapping()
    {
        CreateMap<FileUploadInfo, ExternalFile>();
        CreateMap<ExternalFileRequest, ExternalFile>();
        CreateMap<ExternalFile, ExternalFileResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
        CreateMap<ExternalFilePatchRequest, ExternalFile>();

        CreateMap<ExternalFile, ExternalFilePatchRequest>();
    }
}