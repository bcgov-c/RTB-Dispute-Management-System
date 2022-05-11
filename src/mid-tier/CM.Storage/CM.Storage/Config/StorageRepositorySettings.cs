using System.Collections.Generic;

namespace CM.Storage.Config
{
    public class StorageRepositorySettings
    {
        public string Name { get; set; }

        public Dictionary<string, string> Params { get; set; }
    }
}
