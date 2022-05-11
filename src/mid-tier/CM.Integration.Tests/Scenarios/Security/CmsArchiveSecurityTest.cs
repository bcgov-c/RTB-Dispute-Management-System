using System.Net;
using CM.Business.Entities.Models.CmsArchive;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckCmsArchiveSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var cmsArchiveGetResponse = CmsArchiveManager.GetCmsArchive(Client, new CmsArchiveSearchRequest());
        cmsArchiveGetResponse.CheckStatusCode();

        var cmsArchiveGetRecordResponse = CmsArchiveManager.GetRecordCmsArchive(Client, "12345");
        cmsArchiveGetRecordResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var cmsArchivePostNoteResponse = CmsArchiveManager.PostNoteCmsArchive(Client, "12345", new CmsArchiveNoteRequest());
        cmsArchivePostNoteResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var cmsArchiveGetFileResponse = CmsArchiveManager.GetFileCmsArchive(Client, "guid/name", "4564-9879-3453-6565");
        cmsArchiveGetFileResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.NotFound);

        var cmsArchivePatchRecordResponse = CmsArchiveManager.UpdateRecordCmsArchive(Client, "12345", new CmsRecordRequest { DMS_File_Number = 12345 });
        cmsArchivePatchRecordResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        cmsArchiveGetResponse = CmsArchiveManager.GetCmsArchive(Client, new CmsArchiveSearchRequest());
        cmsArchiveGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        cmsArchiveGetRecordResponse = CmsArchiveManager.GetRecordCmsArchive(Client, "12345");
        cmsArchiveGetRecordResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        cmsArchivePostNoteResponse = CmsArchiveManager.PostNoteCmsArchive(Client, "12345", new CmsArchiveNoteRequest());
        cmsArchivePostNoteResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        cmsArchiveGetFileResponse = CmsArchiveManager.GetFileCmsArchive(Client, "7f49c363-ba51-4170-beb9-60277a0d3d07/name", "234234534252");
        cmsArchiveGetFileResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        cmsArchivePatchRecordResponse = CmsArchiveManager.UpdateRecordCmsArchive(Client, "12345", new CmsRecordRequest { DMS_File_Number = 12345 });
        cmsArchivePatchRecordResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        cmsArchiveGetResponse = CmsArchiveManager.GetCmsArchive(Client, new CmsArchiveSearchRequest());
        cmsArchiveGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        cmsArchiveGetRecordResponse = CmsArchiveManager.GetRecordCmsArchive(Client, "12345");
        cmsArchiveGetRecordResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        cmsArchivePostNoteResponse = CmsArchiveManager.PostNoteCmsArchive(Client, "12345", new CmsArchiveNoteRequest());
        cmsArchivePostNoteResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        cmsArchiveGetFileResponse = CmsArchiveManager.GetFileCmsArchive(Client, "7f49c363-ba51-4170-beb9-60277a0d3d07/name", "234234534252");
        cmsArchiveGetFileResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        cmsArchivePatchRecordResponse = CmsArchiveManager.UpdateRecordCmsArchive(Client, "12345", new CmsRecordRequest { DMS_File_Number = 12345 });
        cmsArchivePatchRecordResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        cmsArchiveGetResponse = CmsArchiveManager.GetCmsArchive(Client, new CmsArchiveSearchRequest());
        cmsArchiveGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        cmsArchiveGetRecordResponse = CmsArchiveManager.GetRecordCmsArchive(Client, "12345");
        cmsArchiveGetRecordResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        cmsArchivePostNoteResponse = CmsArchiveManager.PostNoteCmsArchive(Client, "12345", new CmsArchiveNoteRequest());
        cmsArchivePostNoteResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        cmsArchiveGetFileResponse = CmsArchiveManager.GetFileCmsArchive(Client, "7f49c363-ba51-4170-beb9-60277a0d3d07/name", "234234534252");
        cmsArchiveGetFileResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        cmsArchivePatchRecordResponse = CmsArchiveManager.UpdateRecordCmsArchive(Client, "12345", new CmsRecordRequest { DMS_File_Number = 12345 });
        cmsArchivePatchRecordResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}