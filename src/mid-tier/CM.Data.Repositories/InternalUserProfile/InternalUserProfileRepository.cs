using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.InternalUserProfile;

public class InternalUserProfileRepository : CmRepository<Model.InternalUserProfile>, IInternalUserProfileRepository
{
    public InternalUserProfileRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(int internalUserProfileId)
    {
        var dates = await Context.InternalUserProfiles
            .Where(p => p.InternalUserProfileId == internalUserProfileId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<Model.InternalUserProfile> GetByUserIdAsync(int internalUserId)
    {
        var internalUserProfile =
            await Context.InternalUserProfiles.SingleOrDefaultAsync(i => i.InternalUserId == internalUserId);

        return internalUserProfile;
    }
}