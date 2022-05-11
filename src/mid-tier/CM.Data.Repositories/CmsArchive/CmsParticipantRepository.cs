using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.CmsArchive;

public class CmsParticipantRepository : CmRepository<CMSParticipant>, ICmsParticipantRepository
{
    public CmsParticipantRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<List<CMSParticipant>> GetParticipantByRequestId(string requestId)
    {
        var participants = await Context.CMSParticipants.Where(e => e.Request_ID == requestId).ToListAsync();
        return participants;
    }

    public async Task<List<string>> FindRequestIdsByQuery(string queryString)
    {
        var requestIds = await Context.CMSParticipants.FromSqlRaw(queryString).Select(p => p.Request_ID).ToListAsync();
        return requestIds;
    }

    public async Task<List<CMSParticipant>> GetApplicantsByRequestIdAsync(string requestId)
    {
        return await GetParticipantsByType(requestId, 1);
    }

    public async Task<List<CMSParticipant>> GetAgentsByRequestId(string requestId)
    {
        return await GetParticipantsByType(requestId, 2);
    }

    public async Task<List<CMSParticipant>> GetRespondentsByRequestId(string requestId)
    {
        return await GetParticipantsByType(requestId, 3);
    }

    private async Task<List<CMSParticipant>> GetParticipantsByType(string requestId, int type)
    {
        var participants = await Context.CMSParticipants.Where(e => e.Request_ID == requestId && e.Participant_Type == type).ToListAsync();
        return participants;
    }
}