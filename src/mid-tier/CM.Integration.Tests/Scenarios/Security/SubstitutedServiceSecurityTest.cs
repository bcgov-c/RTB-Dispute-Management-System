using System.Net;
using CM.Business.Entities.Models.SubstitutedService;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckSubstitutedServiceSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var substitutedServicePostResponse = SubstitutedServiceManager.CreateSubstitutedService(Client, Data.Dispute.DisputeGuid, new SubstitutedServicePostRequest());
        substitutedServicePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var substitutedServicePatchResponse = SubstitutedServiceManager.UpdateSubstitutedService(Client, Data.SubstitutedServices[0].SubstitutedServiceId, new SubstitutedServicePatchRequest());
        substitutedServicePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        var substitutedServiceDeleteResponse = SubstitutedServiceManager.DeleteSubstitutedService(Client, Data.SubstitutedServices[5].SubstitutedServiceId);
        substitutedServiceDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var substitutedServiceGetResponse = SubstitutedServiceManager.GetSubstitutedService(Client, Data.SubstitutedServices[0].SubstitutedServiceId);
        substitutedServiceGetResponse.CheckStatusCode();

        var substitutedServicesGetResponse = SubstitutedServiceManager.GeSubstitutedServices(Client, Data.Dispute.DisputeGuid);
        substitutedServicesGetResponse.CheckStatusCode();

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        substitutedServicePostResponse = SubstitutedServiceManager.CreateSubstitutedService(Client, Data.Dispute.DisputeGuid, new SubstitutedServicePostRequest());
        substitutedServicePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        substitutedServicePatchResponse = SubstitutedServiceManager.UpdateSubstitutedService(Client, Data.SubstitutedServices[0].SubstitutedServiceId, new SubstitutedServicePatchRequest());
        substitutedServicePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        substitutedServiceDeleteResponse = SubstitutedServiceManager.DeleteSubstitutedService(Client, Data.SubstitutedServices[5].SubstitutedServiceId);
        substitutedServiceDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        substitutedServiceGetResponse = SubstitutedServiceManager.GetSubstitutedService(Client, Data.SubstitutedServices[0].SubstitutedServiceId);
        substitutedServiceGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        substitutedServicesGetResponse = SubstitutedServiceManager.GeSubstitutedServices(Client, Data.Dispute.DisputeGuid);
        substitutedServicesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        substitutedServicePostResponse = SubstitutedServiceManager.CreateSubstitutedService(Client, Data.Dispute.DisputeGuid, new SubstitutedServicePostRequest());
        substitutedServicePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        substitutedServicePatchResponse = SubstitutedServiceManager.UpdateSubstitutedService(Client, Data.SubstitutedServices[0].SubstitutedServiceId, new SubstitutedServicePatchRequest());
        substitutedServicePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        substitutedServiceDeleteResponse = SubstitutedServiceManager.DeleteSubstitutedService(Client, Data.SubstitutedServices[5].SubstitutedServiceId);
        substitutedServiceDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        substitutedServiceGetResponse = SubstitutedServiceManager.GetSubstitutedService(Client, Data.SubstitutedServices[0].SubstitutedServiceId);
        substitutedServiceGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        substitutedServicesGetResponse = SubstitutedServiceManager.GeSubstitutedServices(Client, Data.Dispute.DisputeGuid);
        substitutedServicesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        substitutedServicePostResponse = SubstitutedServiceManager.CreateSubstitutedService(Client, Data.Dispute.DisputeGuid, new SubstitutedServicePostRequest());
        substitutedServicePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        substitutedServicePatchResponse = SubstitutedServiceManager.UpdateSubstitutedService(Client, Data.SubstitutedServices[0].SubstitutedServiceId, new SubstitutedServicePatchRequest());
        substitutedServicePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        substitutedServiceDeleteResponse = SubstitutedServiceManager.DeleteSubstitutedService(Client, Data.SubstitutedServices[5].SubstitutedServiceId);
        substitutedServiceDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        substitutedServiceGetResponse = SubstitutedServiceManager.GetSubstitutedService(Client, Data.SubstitutedServices[0].SubstitutedServiceId);
        substitutedServiceGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        substitutedServicesGetResponse = SubstitutedServiceManager.GeSubstitutedServices(Client, Data.Dispute.DisputeGuid);
        substitutedServicesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        substitutedServicePostResponse = SubstitutedServiceManager.CreateSubstitutedService(Client, Data.Dispute.DisputeGuid, new SubstitutedServicePostRequest());
        substitutedServicePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        substitutedServicePatchResponse = SubstitutedServiceManager.UpdateSubstitutedService(Client, Data.SubstitutedServices[0].SubstitutedServiceId, new SubstitutedServicePatchRequest());
        substitutedServicePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        substitutedServiceDeleteResponse = SubstitutedServiceManager.DeleteSubstitutedService(Client, Data.SubstitutedServices[5].SubstitutedServiceId);
        substitutedServiceDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        substitutedServiceGetResponse = SubstitutedServiceManager.GetSubstitutedService(Client, Data.SubstitutedServices[0].SubstitutedServiceId);
        substitutedServiceGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        substitutedServicesGetResponse = SubstitutedServiceManager.GeSubstitutedServices(Client, Data.Dispute.DisputeGuid);
        substitutedServicesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}