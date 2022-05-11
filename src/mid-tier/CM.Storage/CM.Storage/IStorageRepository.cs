using System.Threading.Tasks;
using CM.Storage.Config;

namespace CM.Storage
{
    public interface IStorageRepository
    {
        string RepositoryType { get; }
        StorageRepositorySettings Settings { get; set; }

        string GetFullPath(FileDefinition fileDefinition, ContainerDefinition containerDefinition);

        Task<FileActionStatus> TryRead(
            FileDefinition fileDefinition,
            ContainerDefinition containerDefinition,
            out byte[] data);

        Task<FileActionStatus> SaveAsync(
            FileDefinition fileDefinition,
            ContainerDefinition containerDefinition,
            FileCreateOptions fileCreateOptions = default);

        FileActionStatus Delete(FileDefinition fileDefinition, ContainerDefinition containerDefinition);

        FileActionStatus Move(
            FileDefinition fileDefinition,
            ContainerDefinition containerDefinition,
            ContainerDefinition newContainerDefinition,
            string newFileName = null);

        FileActionStatus Move(
            string fileName,
            ContainerDefinition newContainerDefinition,
            FileDefinition newFileDefinition = null);

        void Init();
    }
}