using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class LinkedFile : BaseEntity
{
    public int LinkedFileId { get; set; }

    public FileDescription FileDescription { get; set; }

    public int FileDescriptionId { get; set; }

    public Dispute Dispute { get; set; }

    [Required]
    public Guid DisputeGuid { get; set; }

    public bool? Accepted { get; set; }

    public File File { get; set; }

    public int FileId { get; set; }

    public bool? IsDeleted { get; set; }
}