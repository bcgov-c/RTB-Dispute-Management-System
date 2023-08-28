using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.ParticipantIdentity
{
    public interface IParticipantIdentityRepository : IRepository<Model.ParticipantIdentity>
    {
        Task<DateTime?> GetLastModifiedDate(int participantIdentityId);
    }
}
