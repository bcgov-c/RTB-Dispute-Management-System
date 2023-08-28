using System.Threading.Tasks;
using System.Xml;

namespace CM.Business.Services.CanadaPost
{
    public interface ICanadaPostService
    {
        Task<XmlDocument> GetTrackingData(string trackingCode);
    }
}
