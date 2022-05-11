using CM.Common.Utilities;

namespace CM.Business.Entities.Models.CustomDataObject;

public class CustomObjectGetRequest
{
    public bool? IsActive { get; set; }

    public CustomObjectType[] ObjectTypes { get; set; }
}