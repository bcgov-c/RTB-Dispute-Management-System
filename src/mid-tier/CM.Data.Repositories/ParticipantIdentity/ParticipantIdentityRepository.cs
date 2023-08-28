using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.ParticipantIdentity
{
    public class ParticipantIdentityRepository : CmRepository<Model.ParticipantIdentity>, IParticipantIdentityRepository
    {
        public ParticipantIdentityRepository(CaseManagementContext context)
        : base(context)
        {
        }

        public async Task<DateTime?> GetLastModifiedDate(int participantIdentityId)
        {
            var dates = await Context.ParticipantIdentities
            .Where(n => n.ParticipantIdentityId == participantIdentityId)
            .Select(n => n.ModifiedDate)
            .ToListAsync();

            return dates?.FirstOrDefault();
        }
    }
}
