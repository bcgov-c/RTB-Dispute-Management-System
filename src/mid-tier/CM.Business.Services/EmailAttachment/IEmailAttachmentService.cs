using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.EmailAttachment;
using CM.Business.Services.Base;

namespace CM.Business.Services.EmailAttachment;

public interface IEmailAttachmentService : IServiceBase, IDisputeResolver
{
    Task<EmailAttachmentResponse> CreateAsync(int emailId, EmailAttachmentRequest request);

    Task<bool> DeleteAsync(int emailId);

    Task<List<EmailAttachmentResponse>> GetAllAsync(int emailId);

    Task<bool> IsEmailSent(int emailAttachmentId);
}