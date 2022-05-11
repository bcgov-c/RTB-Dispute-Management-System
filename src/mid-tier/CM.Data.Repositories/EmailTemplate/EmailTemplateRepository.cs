using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.EmailTemplate;

public class EmailTemplateRepository : CmRepository<Model.EmailTemplate>, IEmailTemplateRepository
{
    public EmailTemplateRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(int emailTemplateId)
    {
        var dates = await Context.EmailTemplates
            .Where(p => p.EmailTemplateId == emailTemplateId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<Model.EmailTemplate> GetByEmailTypeAsync(AssignedTemplate assignedTemplateId)
    {
        var emailTemplate =
            await Context.EmailTemplates.SingleOrDefaultAsync(e => e.AssignedTemplateId == assignedTemplateId);

        return emailTemplate;
    }

    public async Task<bool> IsAssignedTemplateIdExists(AssignedTemplate assignedTemplateId)
    {
        var isExists = await Context.EmailTemplates.AnyAsync(x => x.AssignedTemplateId == assignedTemplateId);
        return isExists;
    }
}