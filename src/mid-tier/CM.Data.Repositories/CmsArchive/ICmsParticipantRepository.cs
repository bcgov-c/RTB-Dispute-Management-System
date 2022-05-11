using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.CmsArchive;

public interface ICmsParticipantRepository : IRepository<CMSParticipant>
{
    Task<List<CMSParticipant>> GetParticipantByRequestId(string requestId);

    Task<List<string>> FindRequestIdsByQuery(string queryString);

    Task<List<CMSParticipant>> GetApplicantsByRequestIdAsync(string requestId);

    Task<List<CMSParticipant>> GetAgentsByRequestId(string requestId);

    Task<List<CMSParticipant>> GetRespondentsByRequestId(string requestId);
}