using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Models;

public class LoadingHistory
{
    [Key]
    public int LoadingEventId { get; set; }

    public int FactTableId { get; set; }

    [StringLength(75)]
    public string FactTableName { get; set; }

    public DateTime LoadStartDateTime { get; set; }

    public DateTime? LoadEndDateTime { get; set; }

    public int LastStatus { get; set; }

    public int? TotalRecordsLoaded { get; set; }

    [StringLength(200)]
    public string OutcomeText { get; set; }
}