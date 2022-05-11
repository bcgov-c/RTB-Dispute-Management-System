using System;
using System.ComponentModel.DataAnnotations;

namespace DataWarehouseReporting.Data.Models;

public class DimTime
{
    [Key]
    public int DimTimeId { get; set; }

    public DateTime DateInserted { get; set; }

    public DateTime AssociatedDate { get; set; }

    public int DayOfWeekId { get; set; }

    public int WeekId { get; set; }

    public int MonthId { get; set; }

    public int QuarterId { get; set; }

    public int YearId { get; set; }
}