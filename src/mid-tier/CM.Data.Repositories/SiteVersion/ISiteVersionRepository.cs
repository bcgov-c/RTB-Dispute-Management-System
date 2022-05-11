using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.SiteVersion;

public interface ISiteVersionRepository : IRepository<Model.SiteVersion>
{
    Task<byte> GetTokenMethod();
}