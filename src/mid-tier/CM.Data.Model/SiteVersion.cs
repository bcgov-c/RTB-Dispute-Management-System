using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class SiteVersion
{
    public int SiteVersionId { get; set; }

    public byte TokenMethod { get; set; }

    [StringLength(10)]
    public string ReleaseNumber { get; set; }

    public DateTime? ReleaseDate { get; set; }

    [StringLength(2500)]
    public string ReleaseDetails { get; set; }

    [StringLength(10)]
    public string UiVersion { get; set; }

    public DateTime? UiVersionDate { get; set; }

    [StringLength(10)]
    public string MidTierVersion { get; set; }

    public DateTime? MidTierVersionDate { get; set; }

    [StringLength(10)]
    public string PdfVersion { get; set; }

    public DateTime? PdfVersionDate { get; set; }

    [StringLength(10)]
    public string EmailGeneratorVersion { get; set; }

    public DateTime? EmailGeneratorVersionDate { get; set; }

    [StringLength(10)]
    public string EmailNotificationVersion { get; set; }

    public DateTime? EmailNotificationVersionDate { get; set; }

    public DateTime? CreatedDate { get; set; }

    public int? CreatedBy { get; set; }
}