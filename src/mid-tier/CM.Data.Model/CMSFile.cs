//// ReSharper disable InconsistentNaming

using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class CMSFile
{
    [Key]
    public int ETL_File_ID { get; set; }

    [StringLength(25)]
    public string File_Number { get; set; }

    [StringLength(20)]
    public string CMS_File_ID { get; set; }

    [StringLength(255)]
    public string File_Title { get; set; }

    [StringLength(255)]
    public string File_Name { get; set; }

    public byte File_Type { get; set; }

    public Guid File_GUID { get; set; }

    [StringLength(255)]
    public string File_Mime_Type { get; set; }

    public int? File_Size { get; set; }

    public string File_Path { get; set; }

    [StringLength(50)]
    public string Submitter { get; set; }

    public DateTime? Created_Date { get; set; }
}