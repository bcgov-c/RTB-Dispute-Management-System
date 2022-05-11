using CM.Common.Utilities;

namespace CM.Data.Model;

public class InternalUserRole : BaseEntity
{
    public int InternalUserRoleId { get; set; }

    public SystemUser SystemUser { get; set; }

    public int UserId { get; set; }

    public byte RoleGroupId { get; set; }

    public EngagementType EngagementType { get; set; }

    public ScheduleStatus ScheduleStatus { get; set; }

    public ScheduleSubStatus ScheduleSubStatus { get; set; }

    public int? ManagedById { get; set; }

    public byte? RoleSubtypeId { get; set; }

    public byte? AccessTypes { get; set; }

    public byte? AccessSubTypes { get; set; }

    public bool? IsActive { get; set; }
}