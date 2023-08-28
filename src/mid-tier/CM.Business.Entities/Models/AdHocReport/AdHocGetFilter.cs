using CM.Common.Utilities;

namespace CM.Business.Entities.Models.AdHocReport
{
    public class AdHocGetFilter
    {
        public ReportType[] ReportType { get; set; }

        public ReportSubType[] ReportSubType { get; set; }

        public byte?[] ReportUserGroup { get; set; }

        public TargetDatabase?[] TargetDatabase { get; set; }

        public bool? IsActive { get; set; }
    }
}
