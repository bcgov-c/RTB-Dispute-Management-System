using System;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.EmailTemplate;

public interface IEmailTemplateRepository : IRepository<Model.EmailTemplate>
{
    Task<DateTime?> GetLastModifiedDateAsync(int emailTemplateId);

    Task<Model.EmailTemplate> GetByEmailTypeAsync(AssignedTemplate assignedTemplateId);

    Task<bool> IsAssignedTemplateIdExists(AssignedTemplate assignedTemplateId);
}