using System.Collections.Generic;
using CM.Storage.Config;
using Microsoft.Extensions.Options;

namespace CM.Storage
{
    public class Storage : IStorage
    {
        private readonly IEnumerable<StorageRepositorySettings> _repositorySettings;

        public Storage(IOptions<StorageSettings> options)
        {
            _repositorySettings = options.Value.Plugins;
        }

        public IStorageRepository GetRepository<TRepositoryType>()
            where TRepositoryType : IStorageRepository, new()
        {
            return StorageRepositoryFactory<TRepositoryType>.Create(_repositorySettings);
        }
    }
}
