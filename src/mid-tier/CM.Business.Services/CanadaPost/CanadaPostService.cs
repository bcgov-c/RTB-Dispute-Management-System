using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using CM.Business.Services.SystemSettingsService;
using CM.Common.Utilities;

namespace CM.Business.Services.CanadaPost
{
    public class CanadaPostService : ICanadaPostService
    {
        public CanadaPostService(ISystemSettingsService systemSettingsService)
        {
            SystemSettingsService = systemSettingsService;
        }

        private ISystemSettingsService SystemSettingsService { get; }

        public async Task<XmlDocument> GetTrackingData(string trackingCode)
        {
            var cPTrackingUser = await SystemSettingsService.GetValueAsync<string>(SettingKeys.CPTrackingUser);
            var cPTrackingPassword = await SystemSettingsService.GetValueAsync<string>(SettingKeys.CPTrackingPassword);
            var cPTrackingUrl = await SystemSettingsService.GetValueAsync<string>(SettingKeys.CPTrackingURL);

            var client = new HttpClient();
            var auth = "Basic " + Convert.ToBase64String(Encoding.Default.GetBytes(cPTrackingUser + ":" + cPTrackingPassword));
            client.DefaultRequestHeaders.Add("Authorization", auth);
            client.DefaultRequestHeaders.Add("Accept", "application/vnd.cpc.track-v2+xml");
            client.DefaultRequestHeaders.Add("Accept-language", "en-CA");

            var res = await client
                .GetAsync($"{cPTrackingUrl}{trackingCode}/detail");

            var content = res.Content.ReadAsStringAsync().Result;

            XmlDocument xmlDoc = new XmlDocument();
            xmlDoc.LoadXml(content);

            return xmlDoc;
        }
    }
}
