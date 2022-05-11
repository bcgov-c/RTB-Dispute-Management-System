using AutoMapper;
using CM.Business.Entities.Models.Files;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Mapping;

public class FilesMapping : Profile
{
    public FilesMapping()
    {
        CreateMap<FileDescriptionRequest, FileDescription>();

        CreateMap<FileDescription, FileDescriptionResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
        CreateMap<FileDescription, FileDescriptionRequest>();

        CreateMap<FileRequest, File>();

        CreateMap<FileUploadInfo, File>();

        CreateMap<File, FileResponse>()
            .ForMember(x => x.FileDate, opt => opt.MapFrom(src => src.FileDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
        CreateMap<File, FileRequest>();

        CreateMap<FileInfoResponse, File>();
        CreateMap<File, FileInfoResponse>()
            .ForMember(x => x.FileUrl, opt => opt.Ignore())
            .ForMember(x => x.FileDate, opt => opt.MapFrom(src => src.FileDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

        CreateMap<FileInfoPatchRequest, File>();
        CreateMap<File, FileInfoPatchRequest>()
            .ForMember(x => x.FileDate, opt => opt.MapFrom(src => src.FileDate.ToCmDateTimeString()));

        CreateMap<File, FileInfoPatchResponse>()
            .ForMember(x => x.FileDate, opt => opt.MapFrom(src => src.FileDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
    }
}