//// ReSharper disable InconsistentNaming

using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class CMSParticipant
{
    [Key]
    public int ETL_ParticipantRow_ID { get; set; }

    [Required]
    [StringLength(20)]
    public string Request_ID { get; set; }

    [StringLength(25)]
    public string File_Number { get; set; }

    public byte Participant_Type { get; set; }

    public byte? CMS_Sequence_Number { get; set; }

    [StringLength(100)]
    public string First_Name { get; set; }

    [StringLength(100)]
    public string Last_Name { get; set; }

    [StringLength(100)]
    public string Email_Address { get; set; }

    [StringLength(100)]
    public string Unit { get; set; }

    [StringLength(200)]
    public string Street_Address { get; set; }

    [StringLength(100)]
    public string City { get; set; }

    [StringLength(100)]
    public string Province { get; set; }

    [StringLength(100)]
    public string Country { get; set; }

    [StringLength(30)]
    public string Postal_Code { get; set; }

    [StringLength(30)]
    public string DayTime_Area { get; set; }

    [StringLength(62)]
    public string DayTime_Phone { get; set; }

    [StringLength(20)]
    public string Other_Area { get; set; }

    [StringLength(50)]
    public string Other_Phone { get; set; }

    [StringLength(30)]
    public string Fax_Area { get; set; }

    [StringLength(50)]
    public string Fax_Number { get; set; }

    public byte? Preferred { get; set; }

    public byte? Commercial_landlord { get; set; }

    [StringLength(70)]
    public string Agent_For { get; set; }

    [StringLength(150)]
    public string MailingAddress { get; set; }
}