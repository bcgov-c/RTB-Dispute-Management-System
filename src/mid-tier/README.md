# DMS Mid-Tier

[![Lifecycle:Maturing](https://img.shields.io/badge/Lifecycle-Maturing-007EC6)](<Redirect-URL>)

The DMS is a full-featured Dispute Management System based on .NET core 6.x engine. It can be compiled for x64 processors on Linux, macOS and Windows.  This readme is for the DMS mid-tier.  A Readme document and architecture diagram is also available in the [full DMS solution readme.md](../../README.MD) and separate documentation is available in the [DMS UI (User Interface) readme.md](../../src/ui/README.MD)

![DMS System](../../DMS_Devices.jpg)


DMS Technology Stack
-----------------

| Layer   | Technology | 
| ------- | ------------ |
| Langauage and framework | C# - .NET core 6.0 |
| Application Server | Kestrel, IIS |
| API protocol | REST, GraphQL |
| Data Storage | PostgreSQL |
| Job Management | Quartz.NET |
| Authentication | BC Gov Site Minder / Custom Token |
| Document Storage | File System, S3 |
| Logging | Serilog, Console, Seq |
| CI/CD Pipeline | GitHub Actions, Jenkins |


| NuGet Packages |||| 
|----|----|----|----|
| AspNetCore | GraphQL | MailKit | NEST |
| Npgsql | PdfPig | Quartz | Serilog |
| Swashbuckle | XUnit | AutoMapper | EasyNetQ |
| FluentFTP | NetVips | Polly | Respawn |
| SSH.NET | StyleCop | CsvHelper | Diacritics |
| AWSSDK | Bogus | OpenXml | Ocelot |

## DMS Installation Prerequisites

Make sure you have installed:
* [dotnetcore 6](https://dotnet.microsoft.com/en-us/download/dotnet/6.0)
* [PostgreSQL](https://www.postgresql.org/download/)
* [RabbitMQ](https://www.rabbitmq.com/download.html)
* [libvips](https://github.com/libvips/libvips/releases)
* [ffmpeg](https://ffmpeg.org/download.html)
* [wkhtmltopdf](https://wkhtmltopdf.org)

## Building the DMS Mid-Tier

* Clone DMS CaseManagement
* Open `CaseManagement.sln` in Visual Studio
* Build Solution or from command line ```dotnet build CaseManagement.sln```

## Running the DMS Mid-Tier Tests
* Goto ```CM.Integration.Tests\```
* Run ```dotnet test```

## Configuring the DMS Mid-Tier

1. Go to CM.WebAPI/secrets and CM.Services/```ServiceName```/secrets folder
2. Clone appsettings.Template as appsettings.json (in the same location)
3. Open appsettings.json for edit
4. Set appropriate values - according to your configuration 

## Running the DMS Mid-Tier

The list of services included in DMS Solution:
* CM.WebAPI
* CM.Services/DataWarehouse
* CM.Services/DataWarehouseReporting
* CM.Services/EmailGenerator
* CM.Services/EmailNotification
* CM.Services/HearingReportSender
* CM.Services/PdfConvertor
* CM.Services/PostedDecision
* CM.Services/PostedDecisionDataCollector
* CM.Services/ReconciliationReportGenerator
* CM.Services/ReconciliationReportSender

## DMS Mid-Tier License

![MIT License](../../DMS_MIT_Permissions_Conditions_Limitations.png)

MIT: with a license and copyright notice, and a promotion and advertising notice.  See the [LICENSE.txt](../../LICENSE) for details.

## DMS Mid-Tier Contributions and Contact

This is an unsupported open-source repository that was published to share the code base with those that may benefit from its public availability.  We are initiating engagement with the broader dispute resolution marketplace to seek open-source sharing and contribution opportunities.  Our intent is to create a community of suitable co-investors and contributors that will achieve significant cost savings and technological innovation through open-source sharing.  If you are a resolution organization interested in leveraging the DMS solution, please contact Hive One through our justice services web site www.hive1-js.com and we will add you to our list that we are vetting for suitability as the second and third movers that will be critical to the establishment a viable and sustainable community.
