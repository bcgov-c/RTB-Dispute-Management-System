using System.Net;
using CM.Business.Entities.Models.Note;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckNoteSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var notePostResponse = NoteManager.CreateNote(Client, Data.Dispute.DisputeGuid, new NotePostRequest { NoteLinkedTo = 1, NoteStatus = 1, NoteType = 1, NoteContent = "12345" });
        notePostResponse.CheckStatusCode();

        var notePatchResponse = NoteManager.UpdateNote(Client, Data.Notes[0].NoteId, new NotePatchRequest());
        notePatchResponse.CheckStatusCode();

        var noteDeleteResponse = NoteManager.DeleteNote(Client, Data.Notes[0].NoteId);
        noteDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var noteGetResponse = NoteManager.GetNote(Client, Data.Notes[5].NoteId);
        noteGetResponse.CheckStatusCode();

        var disputeNotesGetResponse = NoteManager.GetDisputeNotes(Client, Data.Dispute.DisputeGuid);
        disputeNotesGetResponse.CheckStatusCode();

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        notePostResponse = NoteManager.CreateNote(Client, Data.Dispute.DisputeGuid, new NotePostRequest { NoteLinkedTo = 1, NoteStatus = 1, NoteType = 1, NoteContent = "12345" });
        notePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        notePatchResponse = NoteManager.UpdateNote(Client, Data.Notes[1].NoteId, new NotePatchRequest());
        notePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noteDeleteResponse = NoteManager.DeleteNote(Client, Data.Notes[1].NoteId);
        noteDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noteGetResponse = NoteManager.GetNote(Client, Data.Notes[5].NoteId);
        noteGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeNotesGetResponse = NoteManager.GetDisputeNotes(Client, Data.Dispute.DisputeGuid);
        disputeNotesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        notePostResponse = NoteManager.CreateNote(Client, Data.Dispute.DisputeGuid, new NotePostRequest { NoteLinkedTo = 1, NoteStatus = 1, NoteType = 1, NoteContent = "12345" });
        notePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        notePatchResponse = NoteManager.UpdateNote(Client, Data.Notes[2].NoteId, new NotePatchRequest());
        notePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noteDeleteResponse = NoteManager.DeleteNote(Client, Data.Notes[2].NoteId);
        noteDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noteGetResponse = NoteManager.GetNote(Client, Data.Notes[5].NoteId);
        noteGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeNotesGetResponse = NoteManager.GetDisputeNotes(Client, Data.Dispute.DisputeGuid);
        disputeNotesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        notePostResponse = NoteManager.CreateNote(Client, Data.Dispute.DisputeGuid, new NotePostRequest { NoteLinkedTo = 1, NoteStatus = 1, NoteType = 1, NoteContent = "12345" });
        notePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        notePatchResponse = NoteManager.UpdateNote(Client, Data.Notes[3].NoteId, new NotePatchRequest());
        notePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noteDeleteResponse = NoteManager.DeleteNote(Client, Data.Notes[3].NoteId);
        noteDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noteGetResponse = NoteManager.GetNote(Client, Data.Notes[5].NoteId);
        noteGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeNotesGetResponse = NoteManager.GetDisputeNotes(Client, Data.Dispute.DisputeGuid);
        disputeNotesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        notePostResponse = NoteManager.CreateNote(Client, Data.Dispute.DisputeGuid, new NotePostRequest { NoteLinkedTo = 1, NoteStatus = 1, NoteType = 1, NoteContent = "12345" });
        notePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        notePatchResponse = NoteManager.UpdateNote(Client, Data.Notes[4].NoteId, new NotePatchRequest());
        notePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noteDeleteResponse = NoteManager.DeleteNote(Client, Data.Notes[4].NoteId);
        noteDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        noteGetResponse = NoteManager.GetNote(Client, Data.Notes[5].NoteId);
        noteGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeNotesGetResponse = NoteManager.GetDisputeNotes(Client, Data.Dispute.DisputeGuid);
        disputeNotesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}