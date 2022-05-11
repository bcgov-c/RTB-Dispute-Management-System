using System;
using CM.Business.Entities.Models.Dispute;
using CM.Common.Utilities;

namespace CM.Business.Entities.Models.DisputeHearing;

public class DisputeHearingRecordingResponse
{
    public int HearingId { get; set; }

    public DateTime LocalStartDateTime { get; set; }

    public DisputeStorageType FilesStorageSetting { get; set; }

    public DisputeResponse Dispute { get; set; }
}