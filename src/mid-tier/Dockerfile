FROM microsoft/dotnet:2.2-sdk
WORKDIR /src
COPY CM.WebAPI/CM.WebAPI.csproj CM.WebAPI/
COPY CM.Integration.Tests/CM.Integration.Tests.csproj CM.Integration.Tests/
COPY CM.Test.Moqito/CM.Test.Moqito.csproj CM.Test.Moqito/
COPY CM.Business.Services.Tests/CM.Business.Services.Tests.csproj CM.Business.Services.Tests/
COPY CM.Business.Entities/CM.Business.Entities.csproj CM.Business.Entities/
COPY CM.Common.Utilities/CM.Common.Utilities.csproj CM.Common.Utilities/
COPY CM.Data.Model.Postgres/CM.Data.Model.Postgres.csproj CM.Data.Model.Postgres/
COPY CM.UserResolverService/CM.UserResolverService.csproj CM.UserResolverService/
COPY CM.Scheduler.Task/CM.Scheduler.Task.csproj CM.Scheduler.Task/
COPY CM.Business.Services/CM.Business.Services.csproj CM.Business.Services/
COPY CM.Business.Services.IntegrationEvents/CM.Business.Services.IntegrationEvents.csproj CM.Business.Services.IntegrationEvents/
COPY CM.Data.Repositories/CM.Data.Repositories.csproj CM.Data.Repositories/
COPY CM.Messages/CM.Messages.csproj CM.Messages/
COPY CM.Services/CM.ServiceBase/CM.ServiceBase.csproj CM.Services/CM.ServiceBase/

WORKDIR /src/CM.WebAPI
RUN dotnet restore -nowarn:msb3202,nu1503

WORKDIR /src
COPY . .

WORKDIR /src/CM.WebAPI
RUN dotnet publish -c Release -o /app 

FROM microsoft/dotnet:2.2-sdk

RUN apt-get update && apt-get install -y libvips libvips-dev libvips-tools

ENV ASPNETCORE_URLS=http://+:8080
WORKDIR /app
COPY --from=0 /app .
EXPOSE 8080
ENTRYPOINT ["dotnet", "CM.WebAPI.dll"]
