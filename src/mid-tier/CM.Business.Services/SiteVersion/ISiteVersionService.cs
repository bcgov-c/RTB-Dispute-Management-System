using System.Threading.Tasks;
using CM.Business.Entities.Models.SiteVersion;

namespace CM.Business.Services.SiteVersion;

public interface ISiteVersionService
{
    Task<SiteVersionResponse> Get();

    Task<byte> GetTokenMethod();
}