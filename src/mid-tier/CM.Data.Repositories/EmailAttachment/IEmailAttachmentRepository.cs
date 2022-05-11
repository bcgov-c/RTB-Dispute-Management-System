using System;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.EmailAttachment;

public interface IEmailAttachmentRepository : IRepository<Model.EmailAttachment>
{
    Task<DateTime?> GetLastModifiedDate(int emailAttachmentId);
}