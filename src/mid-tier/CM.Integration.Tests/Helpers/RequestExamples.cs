using System;
using CM.Business.Entities.Models.Parties;
using CM.Common.Utilities;

namespace CM.Integration.Tests.Helpers;

public static class RequestExamples
{
    public static ParticipantRequest GetParticipantPostRequest_1()
    {
        var party = new ParticipantRequest
        {
            ParticipantType = (byte)ParticipantType.Individual,
            ParticipantStatus = (byte)ParticipantStatus.ValidatedAndParticipating,
            BusinessName = "BusinessName1",
            BusinessContactFirstName = "BusinessContactFirstName1",
            BusinessContactLastName = "BusinessContactLastName1",
            FirstName = "FirstName1",
            LastName = "LastName1",
            AcceptedTou = true,
            AcceptedTouDate = DateTime.Now,
            Email = "test1@test.com",
            NoEmail = true,
            PrimaryPhoneExtension = "1234",
            SecondaryPhoneExtension = "1234"
        };

        return party;
    }

    public static ParticipantRequest GetParticipantPostRequest_2()
    {
        var party = new ParticipantRequest
        {
            ParticipantType = (byte)ParticipantType.Individual,
            ParticipantStatus = (byte)ParticipantStatus.ValidatedAndParticipating,
            BusinessName = "BusinessName2",
            BusinessContactFirstName = "BusinessContactFirstName2",
            BusinessContactLastName = "BusinessContactLastName2",
            FirstName = "FirstName2",
            LastName = "LastName2",
            AcceptedTou = true,
            AcceptedTouDate = DateTime.Now,
            Email = "test2@test.com",
            NoEmail = true,
            PrimaryPhoneExtension = "123",
            SecondaryPhoneExtension = "888"
        };

        return party;
    }
}