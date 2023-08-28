# DMS CaseManagement API

[![Lifecycle:Maturing](https://img.shields.io/badge/Lifecycle-Maturing-007EC6)](<Redirect-URL>)
![APM](https://img.shields.io/apm/l/vim-mode)

<img src="https://static.wixstatic.com/media/46f106_25f15fc848a64a108492dee03a9ee7ef~mv2.png/v1/fill/w_900,h_627,al_c,q_90,enc_auto/DMS-Mobile-Desktop-Laptop-Phone.png">
CaseManagement is a full-featured Dispute Management System based on dotnetcore engine. It can be compiled for x64 processors on Linux, macOS and Windows. 


Technology Stack
-----------------

| Layer   | Technology | 
| ------- | ------------ |
| Langauage and framework | C# - dotnetcore 6.0 |
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

## Installing Prerequisites

Make sure you have installed:
* [dotnetcore 6](https://dotnet.microsoft.com/en-us/download/dotnet/6.0)
* [PostgreSQL](https://www.postgresql.org/download/)
* [RabbitMQ](https://www.rabbitmq.com/download.html)
* [libvips](https://github.com/libvips/libvips/releases)
* [ffmpeg](https://ffmpeg.org/download.html)

## Building CaseManagement

* Clone DMS CaseManagement through ```git clone https://github.com/HiveOne/dispute-cm-mid-tier.git```
* Open `CaseManagement.sln` in Visual Studio
* Build Solution or from command line ```dotnet build CaseManagement.sln```

## Running CaseManagement Tests
* Goto ```CM.Integration.Tests\```
* Run ```dotnet test```

## Configuring CaseManagement

1. Go to CM.WebAPI/secrets and CM.Services/```ServiceName```/secrets folder
2. Clone appsettings.Template as appsettings.json (in the same location)
3. Open appsettings.json for edit
4. Set appropriate values - according to your configuration 

## Running CaseManagement

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

## Contribute

Contributions to DMS CaseManagement are welcome. Here is how you can contribute to DMS CaseManagement:

* [Submit bugs](https://github.com/HiveOne/dispute-cm-mid-tier/issues) and help us verify fixes.
* [Submit pull requests](https://github.com/HiveOne/dispute-cm-mid-tier/pulls) for bug fixes and features and discuss existing proposals

## License

Code licensed under the [MIT License](https://github.com/HiveOne/dispute-cm-mid-tier/blob/master/LICENSE.txt).

## Contact Us

If you have questions about CaseManagement, or you would like to reach out to us about an issue you're having or for development advice as you work on a CaseManagement issue, you can reach us as follows:

* Open an [issue](https://github.com/HiveOne/dispute-cm-mid-tier/issues/new) and prefix the issue title with [Question]. See [Question](https://github.com/HiveOne/dispute-cm-mid-tier/issues?q=label%3AQuestion) tag for already-opened questions.

