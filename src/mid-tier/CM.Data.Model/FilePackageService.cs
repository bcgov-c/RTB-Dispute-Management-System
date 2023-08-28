using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CM.Data.Model;

public class FilePackageService : BaseEntity
{
    public int FilePackageServiceId { get; set; }

    public int FilePackageId { get; set; }

    public FilePackage FilePackage { get; set; }

    public int? ParticipantId { get; set; }

    public Participant Participant { get; set; }

    [StringLength(255)]
    public string OtherParticipantName { get; set; }

    public byte? OtherParticipantRole { get; set; }

    [StringLength(255)]
    public string OtherParticipantTitle { get; set; }

    public bool? IsDeleted { get; set; }

    public bool? IsServed { get; set; }

    public byte? ServiceMethod { get; set; }

    public DateTime? ServiceDate { get; set; }

    public DateTime? ReceivedDate { get; set; }

    public byte? ServiceDateUsed { get; set; }

    [StringLength(255)]
    public string ServiceComment { get; set; }

    public int? ServedBy { get; set; }

    public Participant ServedParticipant { get; set; }

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

    public int? ArchiveServedBy { get; set; }

    public Participant ArchiveServed { get; set; }

    [StringLength(255)]
    public string ArchiveServiceComment { get; set; }

    [StringLength(500)]
    public string ServiceDescription { get; set; }

    [StringLength(500)]
    public string ArchiveServiceDescription { get; set; }

    public virtual ICollection<ServiceAuditLog> ServiceAuditLogs { get; set; }
}