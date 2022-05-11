using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using CM.Storage.Config;

namespace CM.Storage.AmazonS3
{
    public class AmazonS3Storage : IStorageRepository
    {
        private AmazonS3Client _amazonS3Client;

        public string RepositoryType => "amazons3";

        public StorageRepositorySettings Settings { get; set; }

        public string GetFullPath(FileDefinition fileDefinition, ContainerDefinition containerDefinition)
        {
            throw new NotImplementedException();
        }

        public Task<FileActionStatus> TryRead(FileDefinition fileDefinition, ContainerDefinition containerDefinition, out byte[] data)
        {
            var status = new FileActionStatus();

            try
            {
                var request = new GetObjectRequest
                {
                    BucketName = containerDefinition.Path,
                    Key = PathAsUnix(fileDefinition.Name)
                };

                using var response = _amazonS3Client.GetObjectAsync(request);

                using var responseStream = response.Result.ResponseStream;
                var memoryStream = new MemoryStream();
                responseStream.CopyTo(memoryStream);

                data = memoryStream.ToArray();
                status.Status = Status.Success;
            }
            catch (Exception exception)
            {
                data = null;
                status.Status = Status.Error;
                status.Message = exception.StackTrace;
            }

            return Task.FromResult(status);
        }

        public async Task<FileActionStatus> SaveAsync(FileDefinition fileDefinition, ContainerDefinition containerDefinition, FileCreateOptions fileCreateOptions = default)
        {
            var status = new FileActionStatus();

            var request = new PutObjectRequest
            {
                BucketName = containerDefinition.Path,
                Key = PathAsUnix(fileDefinition.Name),
                InputStream = new MemoryStream(fileDefinition.Data)
            };

            try
            {
                await _amazonS3Client.PutObjectAsync(request);
            }
            catch (Exception exception)
            {
                status.Status = Status.Error;
                status.Message = exception.Message;
            }

            status.Status = Status.Success;

            return status;
        }

        public FileActionStatus Delete(FileDefinition fileDefinition, ContainerDefinition containerDefinition)
        {
            var status = new FileActionStatus();
            var deleteObjectRequest = new DeleteObjectRequest
            {
                BucketName = containerDefinition.Path,
                Key = PathAsUnix(fileDefinition.Name)
            };

            try
            {
                _amazonS3Client.DeleteObjectAsync(deleteObjectRequest);
            }
            catch (Exception exception)
            {
                status.Status = Status.Error;
                status.Message = exception.StackTrace;
            }

            status.Status = Status.Success;

            return status;
        }

        public FileActionStatus Move(FileDefinition fileDefinition, ContainerDefinition containerDefinition, ContainerDefinition newContainerDefinition, string newFileName = null)
        {
            throw new NotImplementedException();
        }

        public FileActionStatus Move(string fileName, ContainerDefinition newContainerDefinition, FileDefinition newFileDefinition = null)
        {
            throw new NotImplementedException();
        }

        public void Init()
        {
            var accessKey = Settings.Params["accessKey"];
            var secretKey = Settings.Params["secretKey"];
            var region = RegionEndpoint.GetBySystemName(Settings.Params["region"]);
            _amazonS3Client = new AmazonS3Client(accessKey, secretKey, region);
        }

        private string PathAsUnix(string filePath)
        {
            return Regex.Replace(filePath, @"\\", "/");
        }
    }
}
