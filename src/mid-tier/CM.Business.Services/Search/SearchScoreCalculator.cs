using System.Collections.Generic;
using System.Linq;
using CM.Business.Entities.Models.Search;
using CM.Common.Utilities;
using CM.Data.Model.Search;
using CM.Data.Repositories.Search;

namespace CM.Business.Services.Search;

internal static class SearchScoreCalculator
{
    internal static ParticipantMatchingEntity CompareParticipantsByScore(IEnumerable<CrossApplicationSourceParticipant> requestParticipants, IEnumerable<CrossApplicationSourceParticipant> disputeParticipants, int matchedParticipantScore)
    {
        var participantMatchingEntity = new ParticipantMatchingEntity();
        var participants = disputeParticipants.ToList();
        foreach (var requestParticipant in requestParticipants)
        {
            foreach (var disputeParticipant in participants)
            {
                var score = 0;
                if (requestParticipant.ParticipantRole == disputeParticipant.ParticipantRole)
                {
                    if (requestParticipant.SoundexBusinessName.IsNotNullAndEquals(disputeParticipant.SoundexBusinessName))
                    {
                        score += 1;
                    }

                    if (requestParticipant.SoundexBusinessContactFirstName.IsNotNullAndEquals(disputeParticipant.SoundexBusinessContactFirstName) ||
                        requestParticipant.SoundexBusinessContactFirstName.IsNotNullAndEquals(disputeParticipant.SoundexFirstName) ||
                        requestParticipant.SoundexFirstName.IsNotNullAndEquals(disputeParticipant.SoundexBusinessContactFirstName) ||
                        requestParticipant.SoundexFirstName.IsNotNullAndEquals(disputeParticipant.SoundexFirstName))
                    {
                        score += 1;
                    }

                    if (requestParticipant.SoundexBusinessContactLastName.IsNotNullAndEquals(disputeParticipant.SoundexBusinessContactLastName) ||
                        requestParticipant.SoundexBusinessContactLastName.IsNotNullAndEquals(disputeParticipant.SoundexLastName) ||
                        requestParticipant.SoundexLastName.IsNotNullAndEquals(disputeParticipant.SoundexBusinessContactLastName) ||
                        requestParticipant.SoundexLastName.IsNotNullAndEquals(disputeParticipant.SoundexLastName))
                    {
                        score += 1;
                    }

                    if ((requestParticipant.Address != null && requestParticipant.Address.ToLowerIgnoreNull().Contains(disputeParticipant.Address.ToLowerIgnoreNull())) ||
                        (disputeParticipant.Address != null && disputeParticipant.Address.ToLowerIgnoreNull().Contains(requestParticipant.Address.ToLowerIgnoreNull())))
                    {
                        score += 1;
                    }

                    if (requestParticipant.SoundexCity.IsNotNullAndEquals(disputeParticipant.SoundexCity))
                    {
                        score += 1;
                    }

                    if (requestParticipant.PrimaryPhoneNormalized.IsNotNullAndEquals(disputeParticipant.PrimaryPhoneNormalized))
                    {
                        score += 1;
                    }

                    if (requestParticipant.PostalZipNormalized.IsNotNullAndEquals(disputeParticipant.PostalZipNormalized))
                    {
                        score += 1;
                    }

                    if (requestParticipant.Email.IsNotNullAndEquals(disputeParticipant.Email))
                    {
                        score += 1;
                    }

                    if (score >= matchedParticipantScore)
                    {
                        participantMatchingEntity.ParticipantOverallScore += 1;
                        participantMatchingEntity.ParticipantIndividualScore += score;
                    }
                }
            }
        }

        return participantMatchingEntity;
    }

    internal static int GetDisputeMatchScore(SearchResult searchResult, CrossApplicationSourceDisputeRequest request)
    {
        searchResult.TenancyZipPostal = StringHelper.StripZipPostal(searchResult.TenancyZipPostal);
        var disputeMatchScore = 0;
        if (request.TenancyZipPostal == searchResult.TenancyZipPostal)
        {
            disputeMatchScore++;
        }

        if (request.TenancyAddress != null && searchResult.TenancyAddress != null)
        {
            if (request.TenancyAddress.Contains(searchResult.TenancyAddress) ||
                searchResult.TenancyAddress.Contains(request.TenancyAddress))
            {
                disputeMatchScore++;
            }
        }

        if (request.TenancyCitySoundex == searchResult.TenancyCity)
        {
            disputeMatchScore++;
        }

        return disputeMatchScore;
    }
}