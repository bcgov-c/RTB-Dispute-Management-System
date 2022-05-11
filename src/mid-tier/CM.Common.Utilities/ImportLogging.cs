using System;
using System.Text;

namespace CM.Common.Utilities;

public abstract class ImportLogging
{
    public ImportStatus Status { get; set; }

    protected StringBuilder Log { get; set; }

    public void AddLog(string message)
    {
        Log.Append(message + "<br>");
    }

    public string GetLogs()
    {
        return Log.ToString();
    }
}

public class HearingImportLogging : ImportLogging
{
    public HearingImportLogging()
    {
        Log = new StringBuilder();
    }
}

public class ScheduleCsv
{
    public int RowNumber { get; set; }

    public string UserId { get; set; }

    public string FirstName { get; set; }

    public string LastName { get; set; }

    public string Region { get; set; }

    public string DateAssigned { get; set; }

    public TimeSpan Time { get; set; }

    public string Priority { get; set; }

    public TimeSpan? EndTime { get; set; }
}