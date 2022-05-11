using System.Threading.Tasks;
using CM.Business.Entities.Models.EmailTemplate;
using CM.Common.Utilities;

namespace CM.Business.Services.EmailTemplate;

public interface IEmailTemplateService : IServiceBase
{
    Task<EmailTemplateResponse> CreateAsync(EmailTemplateRequest request);

    Task<bool> DeleteAsync(int emailTemplateId);

    Task<EmailTemplateResponse> PatchAsync(int emailTemplateId, EmailTemplateRequest emailTemplateRequest);

    Task<EmailTemplateRequest> GetForPatchAsync(int emailTemplateId);

    Task<EmailTemplateResponse> GetByIdAsync(int emailTemplateId);

    Task<EmailTemplateListResponse> GetAllAsync();

    Task<bool> IsEmailTemplateExist(int emailTemplateId);

    Task<bool> IsUniqueAssignedTemplateId(AssignedTemplate assignedTemplateId);
}