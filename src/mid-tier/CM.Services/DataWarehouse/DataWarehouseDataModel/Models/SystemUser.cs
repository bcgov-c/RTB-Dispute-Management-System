using System.ComponentModel.DataAnnotations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Models;

public class SystemUser
{
    [Key]
    public int SystemUserId { get; set; }

    public bool? IsActive { get; set; }

    [StringLength(50)]
    [Required]
    public string Username { get; set; }

    [StringLength(250)]
    public string Password { get; set; }

    [StringLength(100)]
    public string FullName { get; set; }

    [StringLength(100)]
    public string AccountEmail { get; set; }
}