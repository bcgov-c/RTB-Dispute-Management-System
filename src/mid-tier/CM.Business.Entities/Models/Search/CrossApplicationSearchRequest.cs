using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Search;

public class CrossApplicationSearchRequest : SearchRequestBase
{
    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("hearing_after_days")]
    public int? HearingAfterDays { get; set; }

    [JsonProperty("tenancy_address")]
    public string TenancyAddress { get; set; }

    [JsonProperty("cross_threshold")]
    public int? CrossThreshold { get; set; }
}

public class CrossApplicationSourceDisputeRequest : SearchRequestBase
{
    public string TenancyCitySoundex { get; set; }

    public string TenancyZipPostal { get; set; }

    public string TenancyAddress { get; set; }

    public int? HearingAfterDays { get; set; }
}

public class CrossApplicationParticipantRequest
{
    [JsonProperty("business_name")]
    public string BusinessName { get; set; }

    [JsonProperty("business_contact_first_name")]
    public string BusinessContactFirstName { get; set; }

    [JsonProperty("business_contact_last_name")]
    public string BusinessContactLastName { get; set; }

    [JsonProperty("first_name")]
    public string FirstName { get; set; }

    [JsonProperty("last_name")]
    public string LastName { get; set; }

    [JsonProperty("email")]
    public string Email { get; set; }

    [JsonProperty("primary_phone")]
    public string PrimaryPhone { get; set; }

    [JsonProperty("address")]
    public string Address { get; set; }

    [JsonProperty("city")]
    public string City { get; set; }

    [JsonProperty("postal_zip")]
    public string PostalZip { get; set; }
}