using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;

namespace CM.Data.Model;

public class OutcomeDocFile : BaseEntity
{
    public int OutcomeDocFileId { get; set; }

    public Guid DisputeGuid { get; set; }

    public Dispute Dispute { get; set; }

    public int OutcomeDocGroupId { get; set; }

    public OutcomeDocGroup OutcomeDocGroup { get; set; }

    public byte FileType { get; set; }

    public FileStatus? FileStatus { get; set; }

    public bool? VisibleToPublic { get; set; }

    [StringLength(100)]
    public string FileTitle { get; set; }

    [StringLength(5)]
    public string FileAcronym { get; set; }

    [StringLength(500)]
    public string FileDescription { get; set; }

    public byte? FileSource { get; set; }

    public int? FileId { get; set; }

    public File File { get; set; }

    public byte? FileSubStatus { get; set; }

    [StringLength(500)]
    public string InternalFileComment { get; set; }

    public bool? NoteWorthy { get; set; }

    public bool? MateriallyDifferent { get; set; }

    public bool? IsDeleted { get; set; }

    public byte? FileSubType { get; set; }

    public virtual ICollection<OutcomeDocContent> OutcomeDocContents { get; set; }

    public virtual ICollection<OutcomeDocDelivery> OutcomeDocDeliveries { get; set; }
}