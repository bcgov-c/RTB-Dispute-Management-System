FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base

WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build

COPY ["CM.WebAPI/CM.WebAPI.csproj", "CM.WebAPI/"]

COPY ["CM.Business.Services.Interfaces/CM.Business.Services.Interfaces.csproj", "CM.Business.Services.Interfaces/"]
COPY ["CM.Business.Entities/CM.Business.Entities.csproj", "CM.Business.Entities/"]
COPY ["CM.Common.Utilities/CM.Common.Utilities.csproj", "CM.Common.Utilities/"]
COPY ["CM.Common.Database/CM.Common.Database.csproj", "CM.Common.Database/"]
COPY ["CM.Data.Model/CM.Data.Model.csproj", "CM.Data.Model/"]
COPY ["CM.UserResolverService/CM.UserResolverService.csproj", "CM.UserResolverService/"]
COPY ["CM.Scheduler.Task/CM.Scheduler.Task.csproj", "CM.Scheduler.Task/"]
COPY ["CM.Business.Services/CM.Business.Services.csproj", "CM.Business.Services/"]
COPY ["CM.Data.Repositories/CM.Data.Repositories.csproj", "CM.Data.Repositories/"]
COPY ["CM.Messages/CM.Messages.csproj", "CM.Messages/"]
COPY ["CM.Services/CM.ServiceBase/CM.ServiceBase.csproj", "CM.Services/CM.ServiceBase/"]
COPY ["CM.Common.ChunkedFileUpload/CM.Common.ChunkedFileUpload.csproj", "CM.Common.ChunkedFileUpload/"]
COPY ["CM.FileSystem.Service/CM.FileSystem.Service.csproj", "CM.FileSystem.Service/"]
COPY ["CM.FTP/CM.FTP.csproj", "CM.FTP/"]
COPY ["CM.SFTP/CM.SFTP.csproj", "CM.SFTP/"]
COPY ["CM.Storage/CM.Storage/CM.Storage.csproj", "CM.Storage/CM.Storage/"]
COPY ["CM.Storage/CM.Storage.AmazonS3/CM.Storage.AmazonS3.csproj", "CM.Storage/CM.Storage.AmazonS3/"]
COPY ["CM.Storage/CM.Storage.FileSystem/CM.Storage.FileSystem.csproj", "CM.Storage/CM.Storage.FileSystem/"]
COPY ["CM.Business.Services.IntegrationEvents/CM.Business.Services.IntegrationEvents.csproj", "CM.Business.Services.IntegrationEvents/"]
COPY ["CM.SFTP/CM.SFTP.csproj", "CM.SFTP/"]

RUN dotnet restore "CM.WebAPI/CM.WebAPI.csproj"
COPY . .
RUN dotnet build "CM.WebAPI/CM.WebAPI.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CM.WebAPI/CM.WebAPI.csproj" -c Release -o /app/publish

FROM base AS final

WORKDIR /app

COPY --from=publish /app/publish .
RUN apt-get update && apt-get install -y curl

ENTRYPOINT ["dotnet", "CM.WebAPI.dll"]