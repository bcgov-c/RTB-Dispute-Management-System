using System.Collections.Generic;
using System.Linq;
using CM.Storage.Config;

namespace CM.Storage
{
    internal static class StorageRepositoryFactory<T>
        where T : IStorageRepository, new()
    {
        internal static IStorageRepository Create(IEnumerable<StorageRepositorySettings> plugins)
        {
            var repo = new T();
            repo.Settings = plugins.FirstOrDefault(p => p.Name == repo.RepositoryType);
            repo.Init();

            return repo;
        }
    }
}
