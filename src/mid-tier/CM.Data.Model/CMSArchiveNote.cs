//// ReSharper disable InconsistentNaming

using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class CMSArchiveNote
{
    [Key]
    public int CMS_Note_ID { get; set; }

    [StringLength(25)]
    [Required]
    public string File_Number { get; set; }

    [StringLength(1000)]
    [Required]
    public string CMS_Note { get; set; }

    public DateTime? Created_Date { get; set; }

    [Required]
    public string Created_By { get; set; }
}