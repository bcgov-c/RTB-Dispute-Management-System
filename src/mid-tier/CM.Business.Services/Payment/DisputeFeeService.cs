using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Payment;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.Payment;

public class DisputeFeeService : CmServiceBase, IDisputeFeeService
{
    public DisputeFeeService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entity = await UnitOfWork.DisputeFeeRepository.GetNoTrackingByIdAsync(x => x.DisputeFeeId == id);
        return entity?.DisputeGuid ?? Guid.Empty;
    }

    public async Task<DisputeFeeResponse> CreateAsync(Guid disputeGuid, DisputeFeeRequest disputeFee)
    {
        var newDisputeFee = MapperService.Map<DisputeFeeRequest, DisputeFee>(disputeFee);
        newDisputeFee.DisputeGuid = disputeGuid;
        newDisputeFee.PaymentOverrideCode = await GetRandomCode(disputeGuid);
        newDisputeFee.IsDeleted = false;

        var disputeFeeResult = await UnitOfWork.DisputeFeeRepository.InsertAsync(newDisputeFee);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<DisputeFee, DisputeFeeResponse>(disputeFeeResult);
        }

        return null;
    }

    public async Task<DisputeFeeResponse> PatchAsync(int disputeFeeId, PatchDisputeFeeRequest disputeFeeRequest)
    {
        var disputeFeeToPatch = await UnitOfWork.DisputeFeeRepository.GetByIdAsync(disputeFeeId);
        MapperService.Map(disputeFeeRequest, disputeFeeToPatch);

        UnitOfWork.DisputeFeeRepository.Attach(disputeFeeToPatch);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<DisputeFee, DisputeFeeResponse>(disputeFeeToPatch);
        }

        return null;
    }

    public async Task<PatchDisputeFeeRequest> GetForPatchAsync(int disputeFeeId)
    {
        var disputeFeeToPatch = await UnitOfWork.DisputeFeeRepository.GetNoTrackingByIdAsync(
            c => c.DisputeFeeId == disputeFeeId);
        return MapperService.Map<DisputeFee, PatchDisputeFeeRequest>(disputeFeeToPatch);
    }

    public async Task<bool> DeleteAsync(int disputeFeeId)
    {
        var disputeFee = await UnitOfWork.DisputeFeeRepository.GetByIdAsync(disputeFeeId);
        if (disputeFee != null)
        {
            disputeFee.IsDeleted = true;
            UnitOfWork.DisputeFeeRepository.Attach(disputeFee);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object disputeFeeId)
    {
        var lastModifiedDate = await UnitOfWork.DisputeFeeRepository.GetLastModifiedDate((int)disputeFeeId);

        return lastModifiedDate;
    }

    public async Task<DisputeFeeResponse> GetAsync(int disputeFeeId)
    {
        var disputeFee = await UnitOfWork.DisputeFeeRepository.GetWithTransactions(disputeFeeId);
        if (disputeFee != null)
        {
            return MapperService.Map<DisputeFee, GetDisputeFeeResponse>(disputeFee);
        }

        return null;
    }

    public async Task<List<GetDisputeFeeResponse>> GetList(Guid disputeGuid)
    {
        var disputeFeeList = await UnitOfWork.DisputeFeeRepository.GetByDisputeGuid(disputeGuid);
        if (disputeFeeList != null)
        {
            return MapperService.Map<List<DisputeFee>, List<GetDisputeFeeResponse>>(disputeFeeList);
        }

        return null;
    }

    public async Task<bool> DisputeFeeExists(int disputeFeeId)
    {
        return await UnitOfWork.DisputeFeeRepository.GetByIdAsync(disputeFeeId) != null;
    }

    public async Task<bool> ChildElementExists(int disputeFeeId)
    {
        var childTransactions =
            await UnitOfWork.PaymentTransactionRepository.FindAllAsync(p => p.DisputeFeeId == disputeFeeId);

        if (childTransactions.Any())
        {
            return true;
        }

        return false;
    }

    private async Task<string> GetRandomCode(Guid disputeGuid)
    {
        const string symbols = "abcdefhiklmnopqrstuvwxyz";
        const string nums = "0123456789";
        var symbolLength = 2;
        var numLength = 7;
        var builder = new StringBuilder();
        using (var rng = RandomNumberGenerator.Create())
        {
            var uintBuffer = new byte[sizeof(uint)];

            while (symbolLength-- > 0)
            {
                rng.GetBytes(uintBuffer);
                var num = BitConverter.ToUInt32(uintBuffer, 0);
                builder.Append(symbols[(int)(num % (uint)symbols.Length)]);
            }

            builder.Append('-');

            while (numLength-- > 0)
            {
                rng.GetBytes(uintBuffer);
                var num = BitConverter.ToUInt32(uintBuffer, 0);
                builder.Append(nums[(int)(num % (uint)nums.Length)]);
            }
        }

        var exists = await UnitOfWork.DisputeFeeRepository.IsPaymentOverrideCodeExist(disputeGuid, builder.ToString());
        if (exists)
        {
            await GetRandomCode(disputeGuid);
        }

        return builder.ToString();
    }
}