using AutoMapper;
using CM.Business.Entities.Models.FilePackageService;
using CM.Common.Utilities;
using DM = CM.Data.Model;

namespace CM.Business.Services.Mapping;

public class FilePackageServiceMapping : Profile
{
    public FilePackageServiceMapping()
    {
        CreateMap<FilePackageServiceRequest, DM.FilePackageService>();

        CreateMap<DM.FilePackageService, FilePackageServiceResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.ServiceDate, opt => opt.MapFrom(src => src.ServiceDate.ToCmDateTimeString()))
            .ForMember(x => x.ReceivedDate, opt => opt.MapFrom(src => src.ReceivedDate.ToCmDateTimeString()))
            .ForMember(x => x.ArchiveServiceDate, opt => opt.MapFrom(src => src.ArchiveServiceDate.ToCmDateTimeString()))
            .ForMember(x => x.ArchiveReceivedDate, opt => opt.MapFrom(src => src.ArchiveReceivedDate.ToCmDateTimeString()));

        CreateMap<FilePackageServicePatchRequest, DM.FilePackageService>();
        CreateMap<DM.FilePackageService, FilePackageServicePatchRequest>();
    }
}