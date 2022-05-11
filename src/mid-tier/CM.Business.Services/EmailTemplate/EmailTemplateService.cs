using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web;
using AutoMapper;
using CM.Business.Entities.Models.EmailTemplate;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.EmailTemplate;

public class EmailTemplateService : CmServiceBase, IEmailTemplateService
{
    public EmailTemplateService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<EmailTemplateResponse> CreateAsync(EmailTemplateRequest request)
    {
        var decodedTemplateHtml = HttpUtility.UrlDecode(request.TemplateHtml);
        request.TemplateHtml = decodedTemplateHtml;
        var emailTemplate = MapperService.Map<EmailTemplateRequest, Data.Model.EmailTemplate>(request);
        emailTemplate.IsDeleted = false;

        var emailTemplateResult = await UnitOfWork.EmailTemplateRepository.InsertAsync(emailTemplate);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.EmailTemplate, EmailTemplateResponse>(emailTemplateResult);
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int emailTemplateId)
    {
        var emailTemplateToDelete = await UnitOfWork.EmailTemplateRepository.GetByIdAsync(emailTemplateId);
        if (emailTemplateToDelete != null)
        {
            emailTemplateToDelete.IsDeleted = true;
            UnitOfWork.EmailTemplateRepository.Attach(emailTemplateToDelete);
            var result = await UnitOfWork.Complete();

            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<EmailTemplateResponse> PatchAsync(int emailTemplateId, EmailTemplateRequest emailTemplateRequest)
    {
        var emailTemplateToPatch = await UnitOfWork.EmailTemplateRepository.GetNoTrackingByIdAsync(e => e.EmailTemplateId == emailTemplateId);
        MapperService.Map(emailTemplateRequest, emailTemplateToPatch);

        UnitOfWork.EmailTemplateRepository.Attach(emailTemplateToPatch);
        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.EmailTemplate, EmailTemplateResponse>(emailTemplateToPatch);
        }

        return null;
    }

    public async Task<EmailTemplateRequest> GetForPatchAsync(int emailTemplateId)
    {
        var emailTemplate = await
            UnitOfWork.EmailTemplateRepository.GetNoTrackingByIdAsync(e => e.EmailTemplateId == emailTemplateId);
        return MapperService.Map<Data.Model.EmailTemplate, EmailTemplateRequest>(emailTemplate);
    }

    public async Task<EmailTemplateResponse> GetByIdAsync(int emailTemplateId)
    {
        var emailTemplate = await UnitOfWork.EmailTemplateRepository.GetByIdAsync(emailTemplateId);
        if (emailTemplate != null)
        {
            return MapperService.Map<Data.Model.EmailTemplate, EmailTemplateResponse>(emailTemplate);
        }

        return null;
    }

    public async Task<EmailTemplateListResponse> GetAllAsync()
    {
        var emailTemplates = await UnitOfWork.EmailTemplateRepository.GetAllAsync();
        var emailTemplateResponse = new EmailTemplateListResponse
        {
            TotalAvailableCount = emailTemplates.Count,
            EmailTemplates = MapperService.Map<ICollection<Data.Model.EmailTemplate>, List<EmailTemplateResponse>>(emailTemplates)
        };
        return emailTemplateResponse;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var emailTemplateLastModified = await UnitOfWork.EmailTemplateRepository.GetLastModifiedDateAsync((int)id);
        return emailTemplateLastModified;
    }

    public async Task<bool> IsEmailTemplateExist(int emailTemplateId)
    {
        var emailTemplate = await UnitOfWork.EmailTemplateRepository.GetByIdAsync(emailTemplateId);
        return emailTemplate != null;
    }

    public async Task<bool> IsUniqueAssignedTemplateId(AssignedTemplate assignedTemplateId)
    {
        var isExist = await UnitOfWork.EmailTemplateRepository.IsAssignedTemplateIdExists(assignedTemplateId);
        return isExist;
    }
}