namespace CM.Data.Repositories.Search;

public class CrossApplicationSourceParticipant
{
    public byte GroupParticipantRole { get; set; }

    public string ParticipantRole { get; set; }

    public string BusinessName { get; set; }

    public string SoundexBusinessName { get; set; }

    public string BusinessContactFirstName { get; set; }

    public string SoundexBusinessContactFirstName { get; set; }

    public string BusinessContactLastName { get; set; }

    public string SoundexBusinessContactLastName { get; set; }

    public string FirstName { get; set; }

    public string SoundexFirstName { get; set; }

    public string LastName { get; set; }

    public string SoundexLastName { get; set; }

    public string Email { get; set; }

    public string EmailNormalized { get; set; }

    public string PrimaryPhone { get; set; }

    public string PrimaryPhoneNormalized { get; set; }

    public string Address { get; set; }

    public string AddressNormalized { get; set; }

    public string City { get; set; }

    public string SoundexCity { get; set; }

    public string PostalZip { get; set; }

    public string PostalZipNormalized { get; set; }
}