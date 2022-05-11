using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class NoticeService : BaseEntity
{
    public int NoticeServiceId { get; set; }

    public Notice Notice { get; set; }

    public int NoticeId { get; set; }

    public Participant Participant { get; set; }

    public int ParticipantId { get; set; }

    public int? ServedBy { get; set; }

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

    public File File1 { get; set; }

    public int? NoticeServiceFile1Id { get; set; }

    public File File2 { get; set; }

    public int? NoticeServiceFile2Id { get; set; }

    public File File3 { get; set; }

    public int? NoticeServiceFile3Id { get; set; }

    public File File4 { get; set; }

    public int? NoticeServiceFile4Id { get; set; }

    public File File5 { get; set; }

    public int? NoticeServiceFile5Id { get; set; }

    public int? ProofFileDescriptionId { get; set; }

    public FileDescription ProofFileDescription { get; set; }

    public byte? ValidationStatus { get; set; }

    public int? ArchivedBy { get; set; }

    public byte? ArchiveServiceMethod { get; set; }

    public DateTime? ArchiveServiceDate { get; set; }

    public DateTime? ArchiveReceivedDate { get; set; }

    public byte? ArchiveServiceDateUsed { get; set; }

    public int? ArchiveServedBy { get; set; }

    public bool? IsDeleted { get; set; }
}