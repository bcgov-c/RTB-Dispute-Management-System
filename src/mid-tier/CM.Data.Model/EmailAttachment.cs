using System;
using CM.Common.Utilities;

namespace CM.Data.Model;

public class EmailAttachment : BaseEntity
{
    public int EmailAttachmentId { get; set; }

    public EmailMessage EmailMessage { get; set; }

    public int EmailMessageId { get; set; }

    public AttachmentType AttachmentType { get; set; }

    public File File { get; set; }

    public int? FileId { get; set; }

    public CommonFile CommonFile { get; set; }

    public int? CommonFileId { get; set; }

    public bool? IsDeleted { get; set; }

    public DateTime? SendDate { get; set; }

    public DateTime? ReceivedDate { get; set; }
}