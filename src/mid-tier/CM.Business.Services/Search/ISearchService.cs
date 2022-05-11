using System.Threading.Tasks;
using CM.Business.Entities.Models.Search;

namespace CM.Business.Services.Search;

public interface ISearchService
{
    Task<FullSearchResponse> GetByFileNumber(FileNumberSearchRequest request);

    Task<FullSearchResponse> GetByDisputeInfo(DisputeInfoSearchRequest request, int count, int index);

    Task<FullSearchResponse> GetByAccessCode(AccessCodeSearchRequest request);

    Task<FullSearchResponse> GetByParticipant(ParticipantSearchRequest request, int count, int index);

    Task<FullSearchResponse> GetByDisputeStatus(DisputeStatusSearchRequest request, int count, int index);

    Task<FullSearchResponse> GetByHearing(HearingSearchRequest request, int count, int index);

    Task<FullSearchResponse> GetByCrossApplication(CrossApplicationSearchRequest request, int count, int index);

    Task<FullSearchResponse> GetByClaims(ClaimsSearchRequest request, int count, int index);

    Task<ValidateFilenumberResponse> ValidateFileNumber(int filenumber, string token);

    Task<FullSearchResponse> GetDisputeMessageOwners(DisputeMessageOwnerSearchRequest request, int count, int index);

    Task<FullSearchResponse> GetDisputeStatusOwners(DisputeStatusOwnerSearchRequest request, int count, int index);

    Task<FullSearchResponse> GetDisputeNoteOwners(DisputeNoteOwnerSearchRequest request, int count, int index);

    Task<FullSearchResponse> GetDisputeDocumentOwners(DisputeDocumentOwnerSearchRequest request, int count, int index);

    Task<int> ValidateCreatedBy(int[] createdBy);
}