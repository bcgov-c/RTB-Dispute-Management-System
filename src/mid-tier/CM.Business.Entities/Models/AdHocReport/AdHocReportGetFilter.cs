namespace CM.Business.Entities.Models.AdHocReport
{
    public class AdHocReportGetFilter
    {
        public byte?[] ReportType { get; set; }

        public byte?[] ReportSubType { get; set; }

        public byte?[] ReportUserGroup { get; set; }

        public bool? IsActive { get; set; }
    }
}
