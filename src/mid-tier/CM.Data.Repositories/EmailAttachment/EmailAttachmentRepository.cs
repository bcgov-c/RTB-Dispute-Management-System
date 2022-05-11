using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.EmailAttachment;

public class EmailAttachmentRepository : CmRepository<Model.EmailAttachment>, IEmailAttachmentRepository
{
    public EmailAttachmentRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<DateTime?> GetLastModifiedDate(int emailAttachmentId)
    {
        var dates = await Context.EmailAttachments
            .Where(c => c.EmailAttachmentId == emailAttachmentId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }
}