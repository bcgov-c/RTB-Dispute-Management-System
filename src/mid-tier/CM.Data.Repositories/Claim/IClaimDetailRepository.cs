using System;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Claim;

public interface IClaimDetailRepository : IRepository<ClaimDetail>
{
    Task<DateTime?> GetLastModifiedDate(int claimDetailId);
}