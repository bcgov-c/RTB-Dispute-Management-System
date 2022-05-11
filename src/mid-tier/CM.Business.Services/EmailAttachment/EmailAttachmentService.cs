using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.EmailAttachment;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.EmailAttachment;

public class EmailAttachmentService : CmServiceBase, IEmailAttachmentService
{
    public EmailAttachmentService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entityEmailAttachment = await UnitOfWork.EmailAttachmentRepository.GetNoTrackingByIdAsync(x => x.EmailAttachmentId == id);
        if (entityEmailAttachment != null)
        {
            var entityEmail = await UnitOfWork.EmailMessageRepository.GetNoTrackingByIdAsync(x => x.EmailMessageId == entityEmailAttachment.EmailMessageId);
            return entityEmail?.DisputeGuid ?? Guid.Empty;
        }

        return Guid.Empty;
    }

    public async Task<EmailAttachmentResponse> CreateAsync(int emailId, EmailAttachmentRequest request)
    {
        var newEmailAttachment = MapperService.Map<EmailAttachmentRequest, Data.Model.EmailAttachment>(request);
        newEmailAttachment.EmailMessageId = emailId;
        newEmailAttachment.IsDeleted = false;

        var emailAttachmentResult = await UnitOfWork.EmailAttachmentRepository.InsertAsync(newEmailAttachment);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.EmailAttachment, EmailAttachmentResponse>(emailAttachmentResult);
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int emailId)
    {
        var emailAttachment = await UnitOfWork.EmailAttachmentRepository.GetByIdAsync(emailId);
        if (emailAttachment != null)
        {
            emailAttachment.IsDeleted = true;
            UnitOfWork.EmailAttachmentRepository.Attach(emailAttachment);
            var result = await UnitOfWork.Complete();

            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<List<EmailAttachmentResponse>> GetAllAsync(int emailId)
    {
        var emailAttachments =
            await UnitOfWork.EmailAttachmentRepository.FindAllAsync(e => e.EmailMessageId == emailId);
        if (emailAttachments != null)
        {
            return MapperService.Map<List<Data.Model.EmailAttachment>, List<EmailAttachmentResponse>>(
                emailAttachments.ToList());
        }

        return new List<EmailAttachmentResponse>();
    }

    public async Task<bool> IsEmailSent(int emailAttachmentId)
    {
        var email = await UnitOfWork.EmailAttachmentRepository.GetByIdAsync(emailAttachmentId);
        if (email != null)
        {
            if (email.SendDate != null)
            {
                return true;
            }

            return false;
        }

        return false;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.EmailAttachmentRepository.GetLastModifiedDate((int)id);
        return lastModifiedDate;
    }

    public async Task<Data.Model.EmailAttachment> GetByAttachmentIdAsync(int emailAttachmentId)
    {
        var emailAttachment = await UnitOfWork.EmailAttachmentRepository.GetByIdAsync(emailAttachmentId);
        return emailAttachment;
    }
}