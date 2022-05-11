//// ReSharper disable InconsistentNaming

using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class CMSCorrection
{
    [Key]
    public int ETL_CorrectionRow_ID { get; set; }

    [Required]
    [StringLength(20)]
    public string Request_ID { get; set; }

    [StringLength(25)]
    public string File_Number { get; set; }

    public byte? Comment_Type { get; set; }

    public DateTime? Comment_Submitted_Date { get; set; }

    [StringLength(50)]
    public string Comment_Submitter { get; set; }

    [StringLength(2000)]
    public string Comment { get; set; }
}