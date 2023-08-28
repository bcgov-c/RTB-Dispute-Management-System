import Radio from 'backbone.radio';

const participantsChannel = Radio.channel('participants');
const configChannel = Radio.channel('config');

// Config items for Intake General page question items
export default {
  applicantType: {
    type: 'dispute',
    api_attribute: 'dispute_sub_type',
    page_item_options(api_name_attr, api_value) {
      return {
        stepText: 'Who is filing this dispute?',
        stepComplete: api_value !== null,
        helpHtml: 'Choose the person or business that is applying for dispute resolution. This is also referred to as the applicant.'
      };
    },
    question_options(api_name_attr, api_value) {
      return {
        optionData: [{ name: 'applicant-type-landlord', value: configChannel.request('get', 'DISPUTE_SUBTYPE_LANDLORD'), cssClass: 'option-button applicant-type-landlord',
          text: 'I am a landlord or represent one'},
          { name: 'applicant-type-tenant', value: configChannel.request('get', 'DISPUTE_SUBTYPE_TENANT'), cssClass: 'option-button applicant-type-tenant',
              text: 'I am a tenant or represent one'}],
        question_answer: api_value,
        apiMapping: api_name_attr,
        unselectDisabled: (participantsChannel.request('get:applicants').length > 0)
      };
    }
  },

  propertyType: {
    type: 'question',
    question_name: 'S1_HomeOrTrailer',
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

  rentalAddressQuestion: {
    type: 'question',
    question_name: 'S1_RentalUnit',
    page_item_options(questionModel) {
      return {
        stepText: 'If the rental unit is part of a larger residential property with a shared address, does it have a unique unit identifier (i.e. basement, upper, lower, coach house, etc.)?',
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: 'This might mean a basement suite, room rental, upper home, lower home, coach house or laneway.',
      }
    },
    question_options: {
      optionData: [{ name: 'rental-unit-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'rental-unit-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}]
    }
  },

  manufacturedHomeType: {
    type: 'question',
    question_name: 'S1_OwnerOfMH',
    page_item_options(questionModel) {
      return {
        stepText: 'Does the tenant own a manufactured home on a rented site?',
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: 'This determines which law applies to the tenancy. If the tenant owns the manufactured home (or rents it from a third party) <i>and</i> the tenant rents the site the home sits on from the landlord, the <i>Manufactured Home Park Tenancy Act</i> applies. If the tenant rents both the home and the site from the landlord (or if the tenant rents the home from the landlord and the site from a third party), the <i>Residential Tenancy Act</i> applies.'
      };
    },
    question_options: {
      optionData: [{ name: 'tenancy-address-confirm-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'tenancy-address-confirm-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}]
    }
  },


  tenancyStartDateQuestion: {
    type: 'question',
    question_name: 'S1_StartDateQuestion',
    page_item_options(questionModel) {
      return {
        stepText: 'Do you know the date that the tenancy started?',
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: 'Most written tenancy agreements should indicate when the tenancy started.  Refer to the written tenancy agreement if you are unsure of the exact date.'
      };
    },
    question_options: {
      optionData: [{ name: 'start-date-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'start-date-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}]
    }
  },


  securityDepositQuestion: {
    type: 'question',
    question_name: 'S1_SecurityDepositQuestion',
    page_item_options(questionModel) {
      return {
        stepText: 'Was a security deposit provided to the landlord by the tenant?',
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: 'A security deposit, also referred to as a \'damage deposit\' of a half month\'s rent can be collected by a landlord from a tenant at the beginning of the tenancy.  Select \'Yes\' if a security deposit was provided for the tenancy.'
      };
    },
    question_options: {
      optionData: [{ name: 'security-deposit-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'security-deposit-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}]
    }
  },

  petDepositQuestion: {
    type: 'question',
    question_name: 'S1_PetDepositQuestion',
    page_item_options(questionModel) {
      return {
        stepText: 'Was a pet damage deposit provided to the landlord by the tenant?',
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: 'A pet damage deposit of a half month\'s rent can be collected by a landlord on top of a security deposit at the beginning of the tenancy or when a tenant acquires a pet.  Select \'Yes\' if a pet damage deposit was provided for the tenancy. '
      };
    },
    question_options: {
      optionData: [{ name: 'pet-deposit-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'pet-deposit-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}]
    }
  },

  tenancyResidenceStatus: {
    type: 'dispute',
    api_attribute: 'tenancy_ended',
    page_item_options(api_name_attr, api_value) {
      return {
        stepText: 'Is the tenant still living in the rental unit or site?',
        stepComplete: api_value !== null,
        helpHtml: 'If the tenant has vacated the rental unit or site, select no.  If you are not sure if the tenant has vacated, <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/contact-the-residential-tenancy-branch">contact the Residential Tenancy Branch</a>.'
      };
    },
    question_options(api_name_attr, api_value) {
      return {
        optionData: [{ name: 'tenancy-status-current', value: 0, cssClass: 'option-button tenancy-status-current',
            text: 'Yes, the tenant is in the unit'},
            { name: 'tenancy-status-past', value: 1, cssClass: 'option-button tenancy-status-past',
                text: 'No, the tenant has moved out'}],
        question_answer: api_value,
        apiMapping: api_name_attr
      };
    }
  },

  tenancyEndDateLegacy: {
    type: 'question',
    question_name: 'S1_LegacyDateAccept',
    page_item_options(questionModel) {
      return {
        stepText: 'Applications must be submitted within two years of the tenancy ending.  If you continue, your application may be dismissed and your $100 filing fee will not be refunded. The only exception is filing in response to an application made against you within the two year period - and only if you file before the hearing.',
        stepComplete: questionModel.get('question_answer') !== null,
        extraCssClasses: 'warning-option'
      };
    },
    question_options: {
      optionData: [{ name: 'tenancy-end-date-legacy-accept', value: "1", cssClass: 'option-button accept-confirm', text: 'Accept and Continue'}],
      clearWhenHidden: true
    }
  },

  counterDisputeQuestion: {
    type: 'question',
    question_name: 'S1_HasCounterDispute',
    page_item_options(questionModel) {
      return {
        stepText: 'Is there currently an application for dispute resolution filed with the Residential Tenancy Branch against you at the same rental address above, and are you filing this application in response to that dispute?',
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: 'If your Application for Dispute Resolution is being made to respond to an existing application that has been filed with the Residential Tenancy Branch against you, select yes.<br/>The Residential Tenancy Branch may schedule both the hearings to be heard at the same time, with the same arbitrator. If the issues are not related or there is not enough time to meet service rules, this application may need to be heard at a separate time.'
      };
    },
    question_options: {
      optionData: [{ name: 'counter-dispute-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'counter-dispute-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}]
    }
  }
};
