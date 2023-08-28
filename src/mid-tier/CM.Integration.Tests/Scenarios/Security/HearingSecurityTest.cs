using System.Net;
using CM.Business.Entities.Models.Hearing;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckHearingSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var hearingPostResponse = HearingManager.CreateHearing(Client, new HearingRequest());
        hearingPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var hearingPatchResponse = HearingManager.PatchHearing(Client, Data.Hearings[0].HearingId, new HearingRequest() { HearingNote = "Test Note" });
        hearingPatchResponse.CheckStatusCode();

        var hearingGetResponse = HearingManager.GetHearing(Client, Data.Hearings[0].HearingId);
        hearingGetResponse.CheckStatusCode();

        var importSchedulePostResponse = HearingManager.CreateImportSchedule(Client, new ImportScheduleRequest { ImportFileId = Constants.UndefinedUserId });
        importSchedulePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var importScheduleGetResponse = HearingManager.GetImportSchedule(Client, Constants.UndefinedUserId);
        importScheduleGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.NotFound);

        var importSchedulesGetResponse = HearingManager.GetImportSchedules(Client);
        importSchedulesGetResponse.CheckStatusCode();

        var reassignHearing = HearingManager.ReassignHearing(Client, new ReassignRequest { FirstHearingId = Data.Hearings[4].HearingId, SecondHearingId = Data.Hearings[5].HearingId });
        reassignHearing.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var rescheduleHearing = HearingManager.RescheduleHearing(Client, new RescheduleRequest { FirstHearingId = Data.Hearings[4].HearingId, SecondHearingId = Data.Hearings[5].HearingId });
        rescheduleHearing.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var reserveAvailableHearingsPostResponse = HearingManager.ReserveAvailableHearings(Client, new ReserveAvailableHearingsRequest());
        reserveAvailableHearingsPostResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        var holdHearingPostResponse = HearingManager.HoldHearing(Client, Data.Hearings[4].HearingId, new HoldHearingRequest());
        holdHearingPostResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        var bookReservedHearingPostResponse = HearingManager.BookReservedHearing(Client, Data.Hearings[4].HearingId);
        bookReservedHearingPostResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        var cancelReservedHearingPostResponse = HearingManager.CancelReservedHearing(Client, Data.Hearings[4].HearingId);
        cancelReservedHearingPostResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        var onHoldHearingsGetResponse = HearingManager.GetOnHoldHearings(Client, new OnHoldHearingsRequest());
        onHoldHearingsGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        var linkPastHearingsResponse = HearingManager.LinkPastHearings(Client, Data.Disputes[0].DisputeGuid, Data.Disputes[1].DisputeGuid);
        linkPastHearingsResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        //////////////////////////////////
        Client.Authenticate(Data.HearingUsers[0].Username, "12345" + Data.HearingUsers[0].Username);
        var hearingDeleteResponse = HearingManager.DeleteHearing(Client, Data.Hearings[1].HearingId);
        hearingDeleteResponse.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        var availableStaffGetResponse = HearingManager.GetAvailableStaff(Client, new HearingAvailableStaffRequest());
        availableStaffGetResponse.CheckStatusCode();

        var availableConferenceBridgesGetResponse = HearingManager.GetAvailableConferenceBridges(Client, new AvailableConferenceBridgesRequest());
        availableConferenceBridgesGetResponse.CheckStatusCode();

        reassignHearing = HearingManager.ReassignHearing(Client, new ReassignRequest { FirstHearingId = Data.Hearings[4].HearingId, SecondHearingId = Data.Hearings[5].HearingId });
        reassignHearing.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        rescheduleHearing = HearingManager.RescheduleHearing(Client, new RescheduleRequest { FirstHearingId = Data.Hearings[4].HearingId, SecondHearingId = Data.Hearings[5].HearingId });
        rescheduleHearing.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        // LOGIN AS UNAUTHORIZED STAFF
        Client.Authenticate("admin2", "admin2");

        hearingDeleteResponse = HearingManager.DeleteHearing(Client, Data.Hearings[1].HearingId);
        hearingDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        availableStaffGetResponse = HearingManager.GetAvailableStaff(Client, new HearingAvailableStaffRequest());
        availableStaffGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        availableConferenceBridgesGetResponse = HearingManager.GetAvailableConferenceBridges(Client, new AvailableConferenceBridgesRequest());
        availableConferenceBridgesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        reassignHearing = HearingManager.ReassignHearing(Client, new ReassignRequest { FirstHearingId = Data.Hearings[4].HearingId, SecondHearingId = Data.Hearings[5].HearingId });
        reassignHearing.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        rescheduleHearing = HearingManager.RescheduleHearing(Client, new RescheduleRequest { FirstHearingId = Data.Hearings[4].HearingId, SecondHearingId = Data.Hearings[5].HearingId });
        rescheduleHearing.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        hearingPostResponse = HearingManager.CreateHearing(Client, new HearingRequest());
        hearingPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        hearingPatchResponse = HearingManager.PatchHearing(Client, Data.Hearings[0].HearingId, new HearingRequest());
        hearingPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        hearingDeleteResponse = HearingManager.DeleteHearing(Client, Data.Hearings[1].HearingId);
        hearingDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        hearingGetResponse = HearingManager.GetHearing(Client, Data.Hearings[0].HearingId);
        hearingGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        importSchedulePostResponse = HearingManager.CreateImportSchedule(Client, new ImportScheduleRequest { ImportFileId = Data.Files[0].FileId });
        importSchedulePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        importScheduleGetResponse = HearingManager.GetImportSchedule(Client, 1);
        importScheduleGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        importSchedulesGetResponse = HearingManager.GetImportSchedules(Client);
        importSchedulesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        availableStaffGetResponse = HearingManager.GetAvailableStaff(Client, new HearingAvailableStaffRequest());
        availableStaffGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        availableConferenceBridgesGetResponse = HearingManager.GetAvailableConferenceBridges(Client, new AvailableConferenceBridgesRequest());
        availableConferenceBridgesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        reassignHearing = HearingManager.ReassignHearing(Client, new ReassignRequest { FirstHearingId = Data.Hearings[4].HearingId, SecondHearingId = Data.Hearings[5].HearingId });
        reassignHearing.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        rescheduleHearing = HearingManager.RescheduleHearing(Client, new RescheduleRequest { FirstHearingId = Data.Hearings[4].HearingId, SecondHearingId = Data.Hearings[5].HearingId });
        rescheduleHearing.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        reserveAvailableHearingsPostResponse = HearingManager.ReserveAvailableHearings(Client, new ReserveAvailableHearingsRequest());
        reserveAvailableHearingsPostResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        holdHearingPostResponse = HearingManager.HoldHearing(Client, Data.Hearings[4].HearingId, new HoldHearingRequest());
        holdHearingPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        bookReservedHearingPostResponse = HearingManager.BookReservedHearing(Client, Data.Hearings[4].HearingId);
        bookReservedHearingPostResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        cancelReservedHearingPostResponse = HearingManager.CancelReservedHearing(Client, Data.Hearings[4].HearingId);
        cancelReservedHearingPostResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        onHoldHearingsGetResponse = HearingManager.GetOnHoldHearings(Client, new OnHoldHearingsRequest());
        onHoldHearingsGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        linkPastHearingsResponse = HearingManager.LinkPastHearings(Client, Data.Disputes[0].DisputeGuid, Data.Disputes[1].DisputeGuid);
        linkPastHearingsResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        hearingPostResponse = HearingManager.CreateHearing(Client, new HearingRequest());
        hearingPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        hearingPatchResponse = HearingManager.PatchHearing(Client, Data.Hearings[0].HearingId, new HearingRequest());
        hearingPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        hearingDeleteResponse = HearingManager.DeleteHearing(Client, Data.Hearings[1].HearingId);
        hearingDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        hearingGetResponse = HearingManager.GetHearing(Client, Data.Hearings[0].HearingId);
        hearingGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        importSchedulePostResponse = HearingManager.CreateImportSchedule(Client, new ImportScheduleRequest { ImportFileId = Data.Files[0].FileId });
        importSchedulePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        importScheduleGetResponse = HearingManager.GetImportSchedule(Client, 1);
        importScheduleGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        importSchedulesGetResponse = HearingManager.GetImportSchedules(Client);
        importSchedulesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        availableStaffGetResponse = HearingManager.GetAvailableStaff(Client, new HearingAvailableStaffRequest());
        availableStaffGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        availableConferenceBridgesGetResponse = HearingManager.GetAvailableConferenceBridges(Client, new AvailableConferenceBridgesRequest());
        availableConferenceBridgesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        reassignHearing = HearingManager.ReassignHearing(Client, new ReassignRequest { FirstHearingId = Data.Hearings[4].HearingId, SecondHearingId = Data.Hearings[5].HearingId });
        reassignHearing.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        rescheduleHearing = HearingManager.RescheduleHearing(Client, new RescheduleRequest { FirstHearingId = Data.Hearings[4].HearingId, SecondHearingId = Data.Hearings[5].HearingId });
        rescheduleHearing.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        reserveAvailableHearingsPostResponse = HearingManager.ReserveAvailableHearings(Client, new ReserveAvailableHearingsRequest());
        reserveAvailableHearingsPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        holdHearingPostResponse = HearingManager.HoldHearing(Client, Data.Hearings[4].HearingId, new HoldHearingRequest());
        holdHearingPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        bookReservedHearingPostResponse = HearingManager.BookReservedHearing(Client, Data.Hearings[4].HearingId);
        bookReservedHearingPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        cancelReservedHearingPostResponse = HearingManager.CancelReservedHearing(Client, Data.Hearings[4].HearingId);
        cancelReservedHearingPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        onHoldHearingsGetResponse = HearingManager.GetOnHoldHearings(Client, new OnHoldHearingsRequest());
        onHoldHearingsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        linkPastHearingsResponse = HearingManager.LinkPastHearings(Client, Data.Disputes[0].DisputeGuid, Data.Disputes[1].DisputeGuid);
        linkPastHearingsResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        hearingPostResponse = HearingManager.CreateHearing(Client, new HearingRequest());
        hearingPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        hearingPatchResponse = HearingManager.PatchHearing(Client, Data.Hearings[0].HearingId, new HearingRequest());
        hearingPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        hearingDeleteResponse = HearingManager.DeleteHearing(Client, Data.Hearings[1].HearingId);
        hearingDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        hearingGetResponse = HearingManager.GetHearing(Client, Data.Hearings[0].HearingId);
        hearingGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        importSchedulePostResponse = HearingManager.CreateImportSchedule(Client, new ImportScheduleRequest { ImportFileId = Data.Files[0].FileId });
        importSchedulePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        importScheduleGetResponse = HearingManager.GetImportSchedule(Client, 1);
        importScheduleGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        importSchedulesGetResponse = HearingManager.GetImportSchedules(Client);
        importSchedulesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        availableStaffGetResponse = HearingManager.GetAvailableStaff(Client, new HearingAvailableStaffRequest());
        availableStaffGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        availableConferenceBridgesGetResponse = HearingManager.GetAvailableConferenceBridges(Client, new AvailableConferenceBridgesRequest());
        availableConferenceBridgesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        reassignHearing = HearingManager.ReassignHearing(Client, new ReassignRequest { FirstHearingId = Data.Hearings[4].HearingId, SecondHearingId = Data.Hearings[5].HearingId });
        reassignHearing.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        rescheduleHearing = HearingManager.RescheduleHearing(Client, new RescheduleRequest { FirstHearingId = Data.Hearings[4].HearingId, SecondHearingId = Data.Hearings[5].HearingId });
        rescheduleHearing.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        reserveAvailableHearingsPostResponse = HearingManager.ReserveAvailableHearings(Client, new ReserveAvailableHearingsRequest());
        reserveAvailableHearingsPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        holdHearingPostResponse = HearingManager.HoldHearing(Client, Data.Hearings[4].HearingId, new HoldHearingRequest());
        holdHearingPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        bookReservedHearingPostResponse = HearingManager.BookReservedHearing(Client, Data.Hearings[4].HearingId);
        bookReservedHearingPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        cancelReservedHearingPostResponse = HearingManager.CancelReservedHearing(Client, Data.Hearings[4].HearingId);
        cancelReservedHearingPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        onHoldHearingsGetResponse = HearingManager.GetOnHoldHearings(Client, new OnHoldHearingsRequest());
        onHoldHearingsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        linkPastHearingsResponse = HearingManager.LinkPastHearings(Client, Data.Disputes[0].DisputeGuid, Data.Disputes[1].DisputeGuid);
        linkPastHearingsResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}