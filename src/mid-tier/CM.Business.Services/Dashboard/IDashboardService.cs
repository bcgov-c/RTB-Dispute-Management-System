using System.Threading.Tasks;
using CM.Business.Entities.Models.Dashboard;

namespace CM.Business.Services.Dashboard;

public interface IDashboardService
{
    Task<DashboardSearchResponse> GetAssignedHearings(int userId, int count, int index, AssignedHearingsRequest request);

    Task<DashboardSearchResponse> GetUnAssignedHearings(int count, int index, UnAssignedHearingsRequest request);

    Task<DashboardSearchResponse> GetAssignedDisputes(int userId, int count, int index, DashboardSearchDisputesRequest request);

    Task<DashboardSearchResponse> GetUnAssignedDisputes(int count, int index, DashboardSearchDisputesRequest request);
}