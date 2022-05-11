import Radio from 'backbone.radio';

const CONTRAVENTION_CLAIM_INTRO_TEXT = `Please select the specific contraventions that apply to your complaint:`;
const configChannel = Radio.channel('config');

const claimsContain = function(availableIssueContraventions=[], parsedClaims=[]) {
  // parsedClaims will be passed each time from the PageItemCreator
  return availableIssueContraventions.some(c => parsedClaims.indexOf(c) !== -1);
};

const toClaimCheckboxOptions = (availableIssueContraventions=[], parsedClaims=[]) => { 
  return availableIssueContraventions.map(code => {
    const issueConfig = configChannel.request('get:issue:ceu', code);
    return {
      claimCode: code,
      checkboxOptions: {
        html: issueConfig.selectionTitle,
        helpHtml: issueConfig.selectionHelp,
        checked: parsedClaims.indexOf(code) !== -1
      }
    };
  });
};

// Config items for Intake Respondents page question items
const config = {
  // Landlord contraventions
  LandlordOrdersRepairs: {
    type: 'claimQuestion',
    question_name: 'S6_LandlordOrdersRepairs',
    linked_claims: 'LandlordOrdersRepairsClaims',
    page_item_options(questionModel) {
      return {
        linked_claims: this.linked_claims,
        stepText: `<div style="float:left;width:calc(100% - 35px);">
        Has the landlord failed to:<br/>
          <ul>
            <li>Comply with decisions or orders made by the Residential Tenancy Branch, or</li>
            <li>Make repairs after receiving a written demand?</li>
          </ul>
        </div>`,
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: `Repairs can include regular or emergency repairs. Learn more about <a class='static-external-link' href='javascript:;' url='https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/during-a-tenancy/repairs-and-maintenance'>repairs and maintenance</a>.`,
      };
    },
    question_options: {
      optionData: [{ name: 'landlord-orders-repairs-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'landlord-orders-repairs-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}],
      clearWhenHidden: true,
    }
  },
  LandlordOrdersRepairsClaims: {
    type: 'claims',
    question_name: 'LandlordOrdersRepairsClaims',
    selection_claims: ['EREP', 'RREP', 'NCOD-L'],
    page_item_options(parsedClaims) {
      return {
        stepText: CONTRAVENTION_CLAIM_INTRO_TEXT,
        stepComplete: claimsContain(this.selection_claims, parsedClaims),
      };
    },
    claims_options(parsedClaims) {
      return toClaimCheckboxOptions(this.selection_claims, parsedClaims);
    }
  },

  LandlordIntimidation: {
    type: 'claimQuestion',
    question_name: 'S6_LandlordIntimidation',
    linked_claims: 'LandlordIntimidationClaims',
    page_item_options(questionModel) {
      return {
        linked_claims: this.linked_claims,
        stepText: `Has the landlord caused the tenant or tenant's guest(s) any unreasonable disturbances?`,
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: `Unreasonable disturbances include serving multiple eviction notices without cause, intimidation or threats, or interfering with your ability to use common areas.<br/><br/>Learn more about tenant's right to <a class='static-external-link' href='javascript:;' url='https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/during-a-tenancy/quiet-enjoyment'>quiet enjoyment</a>.`,
      };
    },
    question_options: {
      optionData: [{ name: 'landlord-intimidation-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'landlord-intimidation-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}],
      clearWhenHidden: true
    }
  },
  LandlordIntimidationClaims: {
    type: 'claims',
    question_name: 'LandlordIntimidation',
    selection_claims: ['MNTE', 'HARR', 'RTQE'],
    page_item_options(parsedClaims) {
      return {
        stepText: CONTRAVENTION_CLAIM_INTRO_TEXT,
        stepComplete: claimsContain(this.selection_claims, parsedClaims),
      };
    },
    claims_options(parsedClaims) {
      return toClaimCheckboxOptions(this.selection_claims, parsedClaims);
    }
  },

  LandlordIllegalFees: {
    type: 'claimQuestion',
    question_name: 'S6_LandlordIllegalFees',
    linked_claims: 'LandlordIllegalFeesClaims',
    page_item_options(questionModel) {
      return {
        linked_claims: this.linked_claims,
        stepText: `Has the landlord charged an illegal rent increase or an unlawful fee?`,
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: `Learn more about <a class='static-external-link' href='javascript:;' url='https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/during-a-tenancy/rent-increases'>rent increases</a>.
        <br/>
        Learn more about <a class='static-external-link' href='javascript:;' url='https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/starting-a-tenancy/deposits-and-fees'>unlawful fees</a>.`
      };
    },
    question_options: {
      optionData: [{ name: 'landlord-illegal-fees-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'landlord-illegal-fees-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}],
      clearWhenHidden: true
    }
  },
  LandlordIllegalFeesClaims: {
    type: 'claims',
    question_name: 'LandlordIllegalFees',
    selection_claims: ['ILRI', 'CHFE'],
    page_item_options(parsedClaims) {
      return {
        stepText: CONTRAVENTION_CLAIM_INTRO_TEXT,
        stepComplete: claimsContain(this.selection_claims, parsedClaims),
      };
    },
    claims_options(parsedClaims) {
      return toClaimCheckboxOptions(this.selection_claims, parsedClaims);
    }
  },

  LandlordBlockingAccess: {
    type: 'claimQuestion',
    question_name: 'S6_LandlordBlockingAccess',
    linked_claims: 'LandlordBlockingAccessClaims',
    page_item_options(questionModel) {
      return {
        linked_claims: this.linked_claims,
        stepText: `<div style="float:left;width:calc(100% - 35px);">
          Has the landlord done any of the following?
          <ul>
            <li>Blocked access to the unit or site</li>
            <li>Restricted services</li>
            <li>Entered the unit or site without proper notice</li>
            <li>Withheld belongings</li>
          </ul>
        </div>`,
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: `This includes a tenant being locked out of their rental unit of the manufactured home park, a landlord denying access to essential services, a landlord entering a rental unit or site without proper notice, or a landlord withholding belongings. Learn more about <a class='static-external-link' href='javascript:;' url='https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/during-a-tenancy/possession-of-the-unit'>possession of a rental unit or site</a>.`,
      };
    },
    question_options: {
      optionData: [{ name: 'landlord-blocking-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'landlord-blocking-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}],
      clearWhenHidden: true
    }
  },
  LandlordBlockingAccessClaims: {
    type: 'claims',
    question_name: 'LandlordBlockingAccess',
    selection_claims: ['LOCK', 'TESR', 'LEWN', 'RESG', 'SIPP'],
    page_item_options(parsedClaims) {
      return {
        stepText: CONTRAVENTION_CLAIM_INTRO_TEXT,
        stepComplete: claimsContain(this.selection_claims, parsedClaims),
      };
    },
    claims_options(parsedClaims) {
      return toClaimCheckboxOptions(this.selection_claims, parsedClaims);
    }
  },

  LandlordGeneralUnlawful: {
    type: 'claimQuestion',
    question_name: 'S6_LandlordGeneralUnlawful',
    linked_claims: 'LandlordGeneralUnlawfulClaims',
    page_item_options(questionModel) {
      return {
        linked_claims: this.linked_claims,
        stepText: `Has the landlord engaged in other activities contrary to the BC tenancy laws?`,
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: `<div style="float:left;width:calc(100% - 35px);">
        Unlawful activities include:
          <ul>
            <li>giving false or misleading information (fraud) to the Residential Tenancy Branch,</li>
            <li>attempting to end the tenancy in ways not supported by BC tenancy laws, or</li>
            <li>violating BC tenancy laws in ways not covered above</li>
          </ul>
        </div>`,
      };
    },
    question_options: {
      optionData: [{ name: 'landlord-unlawful-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'landlord-unlawful-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}],
      clearWhenHidden: true,
    }
  },
  LandlordGeneralUnlawfulClaims: {
    type: 'claims',
    question_name: 'LandlordGeneralUnlawful',
    selection_claims: ['FRAU-L', 'BFNO', 'CHPR', 'LOCA'],
    page_item_options(parsedClaims) {
      return {
        stepText: CONTRAVENTION_CLAIM_INTRO_TEXT,
        stepComplete: claimsContain(this.selection_claims, parsedClaims),
      };
    },
    claims_options(parsedClaims) {
      return toClaimCheckboxOptions(this.selection_claims, parsedClaims);
    }
  },

  // Tenant contraventions
  TenantUnpaidRent: {
    type: 'claimQuestion',
    question_name: 'S6_TenantUnpaidRent',
    linked_claims: 'TenantUnpaidRentClaims',
    page_item_options(questionModel) {
      return {
        linked_claims: this.linked_claims,
        stepText: `<div style="float:left;width:calc(100% - 35px);">
          Has the tenant repeatedly or deliberately done one or more of the following?
          <ul>
            <li>Failed to pay rent</li>
            <li>Damaged the unit, site, or common area</li>
            <li>Assigned or sublet without permission</li>
          </ul>
        </div>`,
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: `The Compliance and Enforcement Unit does not enforce orders for possession or money.
        <br/>
        Residential Tenancy Branch orders are enforced through the Provincial Courts. Learn more about <a class='static-external-link' href='javascript:;' url='https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/solving-problems/dispute-resolution/after-the-hearing/serving-and-enforcing-orders'>enforcing orders</a>.`
      };
    },
    question_options: {
      optionData: [{ name: 'tenant-unpaid-rent-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'tenant-unpaid-rent-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}],
      clearWhenHidden: true,
    }
  },
  TenantUnpaidRentClaims: {
    type: 'claims',
    question_name: 'TenantUnpaidRent',
    selection_claims: ['NPOR', 'DAPR', 'ASWP'],
    page_item_options(parsedClaims) {
      return {
        stepText: CONTRAVENTION_CLAIM_INTRO_TEXT,
        stepComplete: claimsContain(this.selection_claims, parsedClaims),
      };
    },
    claims_options(parsedClaims) {
      return toClaimCheckboxOptions(this.selection_claims, parsedClaims);
    }
  },

  TenantGeneralUnlawful: {
    type: 'claimQuestion',
    question_name: 'S6_TenantGeneralUnlawful',
    linked_claims: 'TenantGeneralUnlawfulClaims',
    page_item_options(questionModel) {
      return {
        linked_claims: this.linked_claims,
        stepText: `Has the tenant engaged in other activities contrary to the BC tenancy laws?`,
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: `<div style="float:left;width:calc(100% - 35px);">
          Unlawful activities include:
          <ul>
            <li>not complying with a Residential Tenancy Branch decision or order,</li>
            <li>giving false or misleading information (fraud) to the Residential Tenancy Branch, or</li>
            <li>violating BC tenancy laws in ways not listed above</li>
          </ul>
        </div>`,
      };
    },
    question_options: {
      optionData: [{ name: 'tenant-unlawful-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'tenant-unlawful-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}],
      clearWhenHidden: true,
    }
  },
  TenantGeneralUnlawfulClaims: {
    type: 'claims',
    question_name: 'TenantGeneralUnlawful',
    selection_claims: ['NCOD-T', 'FRAU-T', 'TOCA'],
    page_item_options(parsedClaims) {
      return {
        stepText: CONTRAVENTION_CLAIM_INTRO_TEXT,
        stepComplete: claimsContain(this.selection_claims, parsedClaims),
      };
    },
    claims_options(parsedClaims) {
      return toClaimCheckboxOptions(this.selection_claims, parsedClaims);
    }
  },

};

export default config;
