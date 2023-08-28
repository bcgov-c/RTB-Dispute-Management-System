using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace CM.Common.Utilities
{
    public static class EntityExtension
    {
        public static List<KeyValuePair<string, string>> ToDictionary(this object source)
        {
            var result = new List<KeyValuePair<string, string>>();
            var json = JsonConvert.SerializeObject(source);
            var list = JsonConvert.DeserializeObject<Dictionary<string, object>>(json);
            if (list == null)
            {
                return result;
            }

            foreach (var(key, value) in list)
            {
                if (value == null)
                {
                    continue;
                }

                if (value is JArray array)
                {
                    var itemValues = array.ToObject<List<string>>();
                    if (itemValues == null)
                    {
                        continue;
                    }

                    result.AddRange(itemValues.Select(itemVal => new KeyValuePair<string, string>(key, itemVal)));
                }
                else
                {
                    result.Add(new KeyValuePair<string, string>(key, value.ToString()));
                }
            }

            return result;
        }
    }
}
