// Config items for Intake General page question items
const allPageConfigOptions = {
  propertyType: {
    type: 'question',
    question_name: 'ARI_S1_HomeOrTrailer',
    page_item_options(api_name_attr, api_value) {
      return {
        stepText: 'What is being rented?',
        stepComplete: api_value !== null,
        helpHtml: 'Select the type of property that is being rented.'
      };
    },
    question_options: {
      optionData: [{ name: 'property-type-rta', value: "0", cssClass: 'option-button property-type-rta', text: 'A home, suite or apartment'},
            { name: 'property-type-mhpta', value: "1", cssClass: 'option-button property-type-mhpta', text: 'A site in a manufactured home park'}]
    }
  },

  manufacturedHomeType: {
    type: 'question',
    question_name: 'ARI_S1_OwnerOfMH',
    page_item_options(questionModel) {
      return {
        stepText: 'Does the tenant own a manufactured home on a rented site?',
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: 'This determines which law applies to the tenancy. If the tenant owns the manufactured home and rents the site the home sits on, the <i>Manufactured Home Park Tenancy Act</i> applies. If the tenant rents both the home and the site, the <i>Residential Tenancy Act</i> applies.'
      };
    },
    question_options: {
      optionData: [{ name: 'tenancy-address-confirm-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'tenancy-address-confirm-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}]
    }
  },


  // ARI-C questions
  repairsInPastQuestion: {
    type: 'question',
    question_name: 'ARI_S1_Repairs18monthInPast',
    page_item_options(questionModel) {
      return {
        stepText: 'Were any of the capital expenditures incurred by the landlord more than 18 months ago?',
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: 'A capital expenditure is eligible for an additional rent increase if the cost was incurred in the 18-month period preceding the month the landlord made this application. Learn more <a href="javascript:;" class="static-external-link" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/during-a-tenancy/rent-increases/additional-rent-increase">here</a>.'
      };
    },
    question_options: {
      optionData: [{ name: 'repairs-in-past-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'repairs-in-past-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}]
    }
  },

  repairsAllowedQuestion: {
    type: 'question',
    question_name: 'ARI_S1_RepairsAllowedQuestion',
    page_item_options(questionModel) {
      return {
        stepText: 'Are your capital expenditures eligible for an additional rent increase? Click "?" for more details.',
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: '<p>A capital expenditure is eligible for an additional rent increase if it:</p>'
          + '<p><ul>'
          + '<li>is made to install, repair or replace a major system or component of the residential property that required repair or replacement under section 32 of the Residential Tenancy Act or the repair or replacement of a major system or component with a useful life of at least five years that has either failed or is close to the end of its useful life; or</li>'
          + '<li>achieves one or more of the following:</li><ul>'
          +   '<li>a measurable reduction in energy use or greenhouse gas emissions;</li>'
          +   '<li>improvement in the security of the residential property; and</li></ul>'
          + '<li>is not expected to recur for at least five years; and</li>'
          + '<li>was incurred in the 18-month period preceding the month the landlord made the application.</li>'
          + '</ul></p>'
          + '<p>Learn more about capital expenditures <a href="javascript:;" class="static-external-link" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/during-a-tenancy/rent-increases/additional-rent-increase">here</a>.</p>'
      };
    },
    question_options: {
      optionData: [{ name: 'repairs-allowed-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'repairs-allowed-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}]
    }
  },

  expectedRepairsQuestion: {
    type: 'question',
    question_name: 'ARI_S1_ExpectedRepairsQuestion',
    page_item_options(questionModel) {
      return {
        stepText: 'Are any of the capital expenditures expected to recur within the next five years?',
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: '<p>To be eligible, the repairs or improvements must be expected to last at least five years. Routine, ongoing, or annual maintenance like cleaning carpets, repairing a leaky pipe under a sink, painting walls, or patching drywall are repairs or improvements that are not eligible capital expenditures for an additional rent increase.</p>'
        + '<p>Some examples of major systems or components that are expected to last at least five years may include:</p>'
        + '<p><ul>'
        + '<li>A new boiler</li>'
        + '<li>A new roof</li>'
        + '<li>New carpets in a common area</li>'
        + '<li>New windows</li>'
        + '<li>Asphalt pavement</li>'
        + '</ul></p>'
      };
    },
    question_options: {
      optionData: [{ name: 'expected-repairs-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'expected-repairs-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}]
    }
  },


  // PFR questions
  havePermitsQuestion: {
    type: 'question',
    question_name: 'PFR_S1_HavePermits',
    page_item_options(questionModel) {
      return {
        stepText: 'Do you have all of the required permits and/or necessary approvals to proceed with the renovations or repairs? If not, do you have evidence that permits or approvals are not required?',
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: 'You must provide evidence to demonstrate that you have necessary permits or approvals (or that they are not required) for renovations or repairs that require vacant possession.'
      };
    },
    question_options: {
      optionData: [{ name: 'have-permits-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'have-permits-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}]
    }
  },

  evictionsRequiredQuestion: {
    type: 'question',
    question_name: 'PFR_S1_EvictionsRequired',
    page_item_options(questionModel) {
      return {
        stepText: 'Are you able to prove that vacant possession is required to perform the renovation or repairs?',
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: `The landlord must prove that vacant possession is required to perform the renovation or repairs. For more information see <a href="javascript:;" class="static-external-link" url="https://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/policy-guidelines/gl2b.pdf">Policy Guideline 2B: Ending a Tenancy to Demolish, Renovate, or Convert a Rental Unit to a Permitted Use</a>.`
      };
    },
    question_options: {
      optionData: [{ name: 'evictions-required-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'evictions-required-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}]
    }
  }
};

export const ari_config = _.pick(allPageConfigOptions, 'propertyType', 'manufacturedHomeType', 'repairsInPastQuestion', 'repairsAllowedQuestion', 'expectedRepairsQuestion');
export const pfr_config = _.pick(allPageConfigOptions, 'propertyType', 'manufacturedHomeType', 'havePermitsQuestion', 'evictionsRequiredQuestion');