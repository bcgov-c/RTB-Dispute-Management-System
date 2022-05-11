using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Newtonsoft.Json;

namespace CM.Data.Model;

public sealed partial class CaseManagementContext
{
    private async Task<int> SaveChangesAsyncEx(CancellationToken cancellationToken)
    {
        Guid? disputeGuid = _userResolver.GetAssociatedDispute().GetValueOrDefault();
        if (disputeGuid != Guid.Empty)
        {
            var entities = ChangeTracker.Entries().Where(x => x.Entity is BaseEntity && x.State is EntityState.Added or EntityState.Modified);
            var userId = _userResolver.GetUserId();

            var entityEntries = entities as EntityEntry[] ?? entities.ToArray();

            var modifiedSource = entityEntries.Select(x => x.Metadata.GetTableName()).ToArray();

            var disputeLastModified = await DisputesLastModified.FirstOrDefaultAsync(x => x.DisputeGuid == disputeGuid, cancellationToken);

            if (disputeLastModified != null)
            {
                disputeLastModified.DisputeGuid = disputeGuid.Value;
                disputeLastModified.LastModifiedDate = DateTime.UtcNow;
                disputeLastModified.LastModifiedBy = userId;
                disputeLastModified.LastModifiedSource = JsonConvert.SerializeObject(modifiedSource, Formatting.Indented);
                Update(disputeLastModified);
            }
            else
            {
                disputeLastModified = new DisputeLastModified
                {
                    DisputeGuid = disputeGuid.Value,
                    LastModifiedDate = DateTime.UtcNow,
                    LastModifiedBy = userId,
                    LastModifiedSource = JsonConvert.SerializeObject(modifiedSource, Formatting.Indented)
                };
                await AddAsync(disputeLastModified, cancellationToken);
            }
        }

        var result = await base.SaveChangesAsync(true, cancellationToken);

        return result;
    }
}