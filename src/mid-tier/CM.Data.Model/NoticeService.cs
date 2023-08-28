using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CM.Data.Model;

public class NoticeService : BaseEntity
{
    public int NoticeServiceId { get; set; }

    public Notice Notice { get; set; }

    public int NoticeId { get; set; }

    public Participant Participant { get; set; }

    public int ParticipantId { get; set; }

    [ForeignKey("Served")]
    public int? ServedBy { get; set; }

    public Participant Served { get; set; }

    public bool? IsServed { get; set; }

    public byte? ServiceMethod { get; set; }

    public DateTime? ServiceDate { get; set; }

    public DateTime? ReceivedDate { get; set; }

    [StringLength(255)]
    public string ServiceComment { get; set; }

    public byte? ServiceDateUsed { get; set; }

    public byte? OtherParticipantRole { get; set; }

    [StringLength(255)]
    public string OtherParticipantTitle { get; set; }

    [ForeignKey("ProofFileDescription")]
    public int? ProofFileDescriptionId { get; set; }

    public FileDescription ProofFileDescription { get; set; }

    [ForeignKey("OtherProofFileDescription")]
    public int? OtherProofFileDescriptionId { get; set; }

    public FileDescription OtherProofFileDescription { get; set; }

    public byte? ValidationStatus { get; set; }

    public int? ArchivedBy { get; set; }

    public SystemUser Archived { get; set; }

    public byte? ArchiveServiceMethod { get; set; }

    public DateTime? ArchiveServiceDate { get; set; }

    public DateTime? ArchiveReceivedDate { get; set; }

    public byte? ArchiveServiceDateUsed { get; set; }

    [ForeignKey("ArchiveServedParticipant")]
    public int? ArchiveServedBy { get; set; }

    public Participant ArchiveServedParticipant { get; set; }

    [StringLength(255)]
    public string ArchiveServiceComment { get; set; }

    [StringLength(500)]
    public string ServiceDescription { get; set; }

    [StringLength(500)]
    public string ArchiveServiceDescription { get; set; }

    public bool? IsDeleted { get; set; }

    public virtual ICollection<ServiceAuditLog> ServiceAuditLogs { get; set; }
}