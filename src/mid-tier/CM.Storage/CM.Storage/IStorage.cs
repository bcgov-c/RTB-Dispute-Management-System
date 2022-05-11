namespace CM.Storage
{
    public interface IStorage
    {
        IStorageRepository GetRepository<TRepositoryType>()
            where TRepositoryType : IStorageRepository, new();
    }
}
