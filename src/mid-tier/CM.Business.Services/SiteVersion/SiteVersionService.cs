using System;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.SiteVersion;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.SiteVersion;

public class SiteVersionService : CmServiceBase, ISiteVersionService
{
    public SiteVersionService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<SiteVersionResponse> Get()
    {
        var siteVersions = await UnitOfWork.SiteVersionRepository.GetAllAsync();
        var version = MapperService.Map<Data.Model.SiteVersion, SiteVersionResponse>(siteVersions.LastOrDefault());
        version.CurrentUtcDateTime = DateTime.UtcNow.ToCmDateTimeString();

        return version;
    }

    public async Task<byte> GetTokenMethod()
    {
        var tokenMethod = await UnitOfWork.SiteVersionRepository.GetTokenMethod();
        return tokenMethod;
    }
}