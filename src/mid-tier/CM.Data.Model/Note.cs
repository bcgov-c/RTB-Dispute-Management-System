using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class Note : BaseEntity
{
    public int NoteId { get; set; }

    public Dispute Dispute { get; set; }

    [Required]
    public Guid DisputeGuid { get; set; }

    public bool? IsDeleted { get; set; }

    [Required]
    public byte NoteStatus { get; set; }

    [Required]
    public byte NoteType { get; set; }

    [Required]
    public byte NoteLinkedTo { get; set; }

    public int? NoteLinkId { get; set; }

    [Required]
    [StringLength(1500, MinimumLength = 5)]
    public string NoteContent { get; set; }

    public byte? CreatorGroupRoleId { get; set; }
}