using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class Participant : BaseEntity
{
    [Key]
    public int ParticipantId { get; set; }

    [Required]
    public Guid DisputeGuid { get; set; }

    public Dispute Dispute { get; set; }

    public int? SystemUserId { get; set; }

    public SystemUser SystemUser { get; set; }

    public byte? ParticipantType { get; set; }

    [DefaultValue(1)]
    [Required]
    public byte ParticipantStatus { get; set; }

    [StringLength(10)]
    public string AccessCode { get; set; }

    [StringLength(100)]
    public string BusinessName { get; set; }

    [StringLength(50)]
    public string BusinessContactFirstName { get; set; }

    [StringLength(70)]
    public string BusinessContactLastName { get; set; }

    [StringLength(50)]
    public string FirstName { get; set; }

    [StringLength(70)]
    public string LastName { get; set; }

    [StringLength(20)]
    public string NameAbbreviation { get; set; }

    public bool AcceptedTou { get; set; }

    public DateTime? AcceptedTouDate { get; set; }

    [StringLength(100)]
    public string Email { get; set; }

    public bool? NoEmail { get; set; } = true;

    public bool? EmailVerified { get; set; } = false;

    [StringLength(15)]
    public string PrimaryPhone { get; set; }

    [StringLength(4)]
    public string PrimaryPhoneExtension { get; set; }

    public byte? PrimaryPhoneType { get; set; }

    public bool? PrimaryPhoneVerified { get; set; } = false;

    [StringLength(15)]
    public string SecondaryPhone { get; set; }

    [StringLength(4)]
    public string SecondaryPhoneExtension { get; set; }

    public byte? SecondaryPhoneType { get; set; }

    public bool? SecondaryPhoneVerified { get; set; } = false;

    [StringLength(15)]
    public string Fax { get; set; }

    public byte? PrimaryContactMethod { get; set; }

    public byte? SecondaryContactMethod { get; set; }

    [StringLength(125)]
    public string Address { get; set; }

    [StringLength(50)]
    public string City { get; set; }

    [StringLength(50)]
    public string ProvinceState { get; set; }

    public byte? ProvinceStateId { get; set; }

    [StringLength(50)]
    public string Country { get; set; }

    public byte? CountryId { get; set; }

    [StringLength(15, MinimumLength = 8)]
    public string PostalZip { get; set; }

    [StringLength(125)]
    public string MailAddress { get; set; }

    [StringLength(50)]
    public string MailCity { get; set; }

    [StringLength(50)]
    public string MailProvinceState { get; set; }

    [StringLength(50)]
    public string MailCountry { get; set; }

    [StringLength(15, MinimumLength = 8)]
    public string MailPostalZip { get; set; }

    public byte? PackageDeliveryMethod { get; set; }

    public bool? IsDeleted { get; set; }

    public bool? IsAmended { get; set; }

    public bool? IsSubService { get; set; }

    public byte? UnitType { get; set; }

    [StringLength(50)]
    public string UnitText { get; set; }

    public int? DecisionDeliveryMethod { get; set; }

    public bool AddressIsValidated { get; set; }

    public byte? KnownContactFields { get; set; }

    public byte? ReceivesTextMessages { get; set; }

    public virtual ICollection<ClaimGroupParticipant> ClaimGroupParticipants { get; set; }

    public virtual ICollection<DisputeUser> DisputeUsers { get; set; }

    public virtual ICollection<DisputeProcessDetail> DisputeProcessDetail1 { get; set; }

    public virtual ICollection<DisputeProcessDetail> DisputeProcessDetail2 { get; set; }

    public virtual ICollection<ClaimDetail> ClaimDetails { get; set; }

    public virtual ICollection<RemedyDetail> RemedyDetails { get; set; }

    public virtual ICollection<PaymentTransaction> PaymentTransactions { get; set; }

    public virtual ICollection<HearingParticipation> HearingParticipations { get; set; }

    public virtual ICollection<FileDescription> FileDescriptions { get; set; }

    public virtual ICollection<Notice> Notices { get; set; }

    public virtual ICollection<NoticeService> NoticeServices { get; set; }

    public virtual ICollection<Amendment> Amendments { get; set; }

    public virtual ICollection<EmailMessage> EmailMessages { get; set; }

    public virtual ICollection<FilePackage> FilePackages { get; set; }

    public virtual ICollection<AuditLog> AuditLogs { get; set; }

    public virtual ICollection<OutcomeDocDelivery> OutcomeDocDeliveries { get; set; }

    public virtual ICollection<FilePackageService> FilePackageServices { get; set; }

    public virtual ICollection<FilePackageService> ServedFilePackageServices { get; set; }

    public virtual ICollection<OutcomeDocRequest> OutcomeDocRequests { get; set; }
}