using System;
using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;

namespace CM.Data.Model;

public class HearingImport : BaseEntity
{
    public int HearingImportId { get; set; }

    public int ImportFileId { get; set; }

    public CommonFile ImportFile { get; set; }

    public ImportStatus ImportStatus { get; set; }

    public DateTime? ImportStartDateTime { get; set; }

    public DateTime? ImportEndDateTime { get; set; }

    [StringLength(255)]
    public string ImportNote { get; set; }

    public string ImportProcessLog { get; set; }

    public int? ImportOfficeId { get; set; }
}