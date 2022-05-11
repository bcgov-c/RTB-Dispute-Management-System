using System.Globalization;
using System.Text;
using CM.Business.Entities.Models.ScheduleRequest;
using CM.Common.Utilities;

namespace CM.Data.Repositories.ScheduleRequest;

public static class ScheduleRequestQueryBuilder
{
    private static readonly string RequestsMainQuery =
        $@"SELECT DISTINCT *
            FROM public.""ScheduleRequests"" SR";

    public static string GenerateRequestsQuery(ScheduleRequestsGetRequest request)
    {
        var sb = new StringBuilder();
        sb.Append(RequestsMainQuery);

        sb.Append(" WHERE 1=1 ");

        if (request.RequestType != null)
        {
            sb.And(@"SR.""RequestType""", "in", "(" + request.RequestType.CreateString(",") + ")");
        }

        if (request.StatusIn != null)
        {
            sb.And(@"SR.""RequestStatus""", "in", "(" + request.StatusIn.CreateString(",") + ")");
        }

        if (request.RequestStartAfter.HasValue)
        {
            sb.And(@"CAST(SR.""RequestStart"" AS date)", ">", request.RequestStartAfter.Value.Date.ToString(CultureInfo.InvariantCulture));
        }

        if (request.RequestEndBefore.HasValue)
        {
            sb.And(@"CAST(SR.""RequestEnd"" AS date)", "<", request.RequestEndBefore.Value.Date.ToString(CultureInfo.InvariantCulture));
        }

        if (request.RequestEndAfter.HasValue)
        {
            sb.And(@"CAST(SR.""RequestEnd"" AS date)", ">", request.RequestEndAfter.Value.Date.ToString(CultureInfo.InvariantCulture));
        }

        if (request.RequestSubmitters != null)
        {
            sb.And(@"SR.""RequestSubmitter""", "in", "(" + request.RequestSubmitters.CreateString(",") + ")");
        }

        if (request.RequestOwners != null)
        {
            sb.And(@"SR.""RequestOwnerId""", "in", "(" + request.RequestOwners.CreateString(",") + ")");
        }

        return sb.ToString();
    }
}