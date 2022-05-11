using System;
using System.ComponentModel.DataAnnotations;

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

    public int? ProofFileDescriptionId { get; set; }

    public FileDescription ProofFileDescription { get; set; }

    public byte? ValidationStatus { get; set; }

    public int? ArchivedBy { get; set; }

    public byte? ArchiveServiceMethod { get; set; }

    public DateTime? ArchiveServiceDate { get; set; }

    public DateTime? ArchiveReceivedDate { get; set; }

    public byte? ArchiveServiceDateUsed { get; set; }

    public int? ArchiveServedBy { get; set; }
}