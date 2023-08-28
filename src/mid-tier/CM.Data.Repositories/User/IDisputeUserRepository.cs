using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.User;

public interface IDisputeUserRepository : IRepository<DisputeUser>
{
    Task<DisputeUser> GetByParticipant(Participant participant);

    Task<List<DisputeUser>> GetDisputeUsers(Guid disputeGuid);

    Task<DisputeUser> GetDisputeUser(Guid disputeGuid, int userId);

    Task<DateTime?> GetLastModifiedDate(int claimDetailId);
}