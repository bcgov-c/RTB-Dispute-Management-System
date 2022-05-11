using System.ComponentModel.DataAnnotations;

namespace CM.Data.Model;

public class AccessCodeExcludeWord
{
    [Key]
    public int ExcludeWordId { get; set; }

    [StringLength(6)]
    public string ExcludeWord { get; set; }
}