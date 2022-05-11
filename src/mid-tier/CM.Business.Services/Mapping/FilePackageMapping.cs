using AutoMapper;
using CM.Business.Entities.Models.Files;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Mapping;

public class FilePackageMapping : Profile
{
    public FilePackageMapping()
    {
        CreateMap<FilePackage, FilePackageRequest>();

        CreateMap<FilePackageRequest, FilePackage>();
        CreateMap<FilePackagePatchRequest, FilePackage>();

        CreateMap<FilePackage, FilePackagePatchRequest>();

        CreateMap<FilePackage, FilePackageResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.PackageDate, opt => opt.MapFrom(src => src.PackageDate.ToCmDateTimeString()));
    }
}