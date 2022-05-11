import Radio from 'backbone.radio';
import WebLink from '../../../../core/components/web-link/WebLink';

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');

const claimsContain = function(claim_codes, parsedClaims) {
  // parsedClaims will be passed each time from the PageItemCreator
  return _.any(claim_codes, function(claim_code) {
    return _.has(parsedClaims, claim_code);
  });
};

const PANDEMIC_RENT_INCREASE_ISSUE_STATIC_ERROR_HTML = `<p>The 2022 maximum rent increase is 1.5%. Annual rent increase notices must have an effective date no earlier than January 1, 2022. If a landlord does collect the increased amount during the period that rent increases are not allowed, the tenant can deduct the additional amount from future rent payments.</p>`;
const PANDEMIC_LEARN_MORE_HTML = `<p>Learn more on <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/covid-19">our website</a>.</p>`;
const PANDEMIC_RENT_INCREASE_LEARN_MORE_HTML = `<p>Learn more on <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/during-a-tenancy/rent-increases">our website</a>.</p>`;

// Config items for Intake Respondents page question items
const config = {
  // Landlord urgent issue
  LandlordUrgentIssue: {
    type: 'claimQuestion',
    question_name: 'S5_LandlordUrgentIssue',
    linked_claims: null,
    question_claim_code: 113,
    page_item_options(questionModel) {
      return {
        linked_claims: this.linked_claims,
        question_claim_code: this.question_claim_code,
        stepText: 'Is this is an urgent application about a tenant who poses an immediate and severe risk to the rental property, other occupants or the landlord?',
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: 'No other dispute issues can be checked with this type of application except to recover the filing fee.  You must provide evidence with this application to prove why this is urgent and how you cannot wait for a standard One Month Notice to End Tenancy for Cause to be issued.  This type of application does not require issuing a standard notice to end the tenancy.'
      };
    },
    question_options: {
      optionData: [{ name: 'urgent-issue-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
        { name: 'urgent-issue-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}],
        clearWhenHidden: true
    }
  },


  LandlordDirectRequest: {
    type: 'claimQuestion',
    question_name: 'S5_LandlordDirectRequest',
    linked_claims: 'LandlordDirectRequestClaims',
    page_item_options(questionModel) {
      return {
        linked_claims: this.linked_claims,
        stepText: 'Are you seeking possession of the rental unit or site through the direct request process?',
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: `The direct request process allows you to obtain an order of possession without a participatory hearing.  This is limited to service of a 10 Day Notice to End Tenancy when the tenant has not paid the rent or utilities and the tenant's deadline to dispute the notice has expired.  You may also apply for a monetary order for unpaid rent or utilities and recovery of the filing fee through this process.<br/><br/>You cannot submit your application until after the tenant deadline for disputing the notice or paying the unpaid rent and/or utilities has passed. ${WebLink.format({
          url: 'http://www.housing.gov.bc.ca/rtb/WebTools/OrderOfPossessionLandlord.html',
          text: 'Calculate when you can make your application'
        })}.<br/><br/>If the tenant has disputed the 10 Day Notice to End Tenancy, this application will be scheduled for a hearing with the tenant's application.<br/><br/>As this proceeding is restricted to evidence submitted by the landlord, there are very specific requirements.
        Please review the second page of the 10 Day Notice to End Tenancy or learn more on ${WebLink.format({
          url: 'http://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/apply-online/direct-request',
          text: 'our website'
        })}`
      };
    },
    question_options: {
      optionData: [{ name: 'direct-request-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'direct-request-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}],
      clearWhenHidden: true
    }
  },

  LandlordDirectRequestClaims: {
    type: 'claims',
    question_name: 'LandlordDirectRequestClaims',
    selection_claims: [123, 124, 125, 126],
    page_item_options(parsedClaims) {
      return {
        stepText: 'Please select the reason you issued the 10 Day Notice to End Tenancy:',
        stepComplete: claimsContain(this.selection_claims, parsedClaims),
        staticWarning: `You cannot submit an application for possession of a rental unit or site until after any applicable tenant deadline for disputing the notice or paying the unpaid rent and/or utilities has passed.&nbsp;<b>Your application may be dismissed if you file too early.</b>
        ${WebLink.format({
          url: 'http://www.housing.gov.bc.ca/rtb/WebTools/OrderOfPossessionLandlord.html',
          text: 'Use our tools to calculate when you can make your application'
        })}.`
      };
    },
    claims_options(parsedClaims) {
      return [{
        claimCode: {
          'rent-only': 123,
          'utilities': 124,

          '_rent-only-money': [123, 125],
          '_utilities-money': [124, 126],
        },
        checkboxOptions: {
          html: '-',
          // Don't show the checkbox item question here, always keep it checked and hidden
          checked: true
        },
        dropdownOptions: {
          required: true,
          defaultBlank: true,
          cssClass: 'max-width-400',
          optionData: [{ value: 'rent-only', text: 'Rent Only (No Utilities)'},
              { value: 'utilities', text: 'Utilities Only or Rent and Utilities'}],
          labelText: 'Reason on the 10 day notice',
          value: _.has(parsedClaims, 123) || _.has(parsedClaims, 125) ? 'rent-only' :
              (_.has(parsedClaims, 124) || _.has(parsedClaims, 126) ? 'utilities' : null)
        },
        secondDropdownOptions: {
          required: true,
          defaultBlank: true,
          cssClass: 'hold-security',
          optionData: [{ value: 'no', text: 'No'},
                   { value: 'yes', text: 'Yes'}],
          labelText: 'Do you want payment of money owed?',
          value: _.has(parsedClaims, 125) || _.has(parsedClaims, 126) ? 'yes' :
            _.has(parsedClaims, 123) || _.has(parsedClaims, 124) ? 'no' : null
        },

        getSelectedClaimCodeOverrideFn: (model) => {
          const dropdownModel = model.get('dropdown');
          const secondDropdownModel = model.get('secondDropdown');
          const isRentOnly = dropdownModel && dropdownModel.getData() === 'rent-only';
          const hasMoney = secondDropdownModel && secondDropdownModel.getData() === 'yes';
          const selectedClaimCodes = [];

          if (isRentOnly) {
            selectedClaimCodes.push(123);
          } else {
            selectedClaimCodes.push(124);
          }

          if (hasMoney) {
            selectedClaimCodes.push(isRentOnly ? 125 : 126);
          }

          return selectedClaimCodes;
        },
      }];
    }
  },

  // Landlord issues
  LandlordSeekingMoveOut: {
    type: 'claimQuestion',
    question_name: 'S5_LandlordSeekingMoveOut',
    linked_claims: 'LandlordSeekingMoveOutClaims',
    page_item_options(questionModel) {
      return {
        linked_claims: this.linked_claims,
        stepText: 'Are you seeking an order for the tenant to move out?',
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: `You may request an order of possession of a rental unit or site if you have served a notice to end tenancy to the tenant(s) and the deadline to dispute the notice has expired, or if you are seeking possession for one of the reasons that does not require a notice listed below.<br/><br/>You cannot submit your application until after the tenant deadline for disputing the notice (or paying the unpaid rent and/or utilities) has passed.
        ${WebLink.format({
          url: 'http://www.housing.gov.bc.ca/rtb/WebTools/OrderOfPossessionLandlord.html',
          text: 'Calculate when you can make your application'
        })}.`
      };
    },
    question_options: {
      optionData: [{ name: 'landlord-seeking-move-out-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'landlord-seeking-move-out-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}],
      clearWhenHidden: true
    }
  },

  LandlordSeekingMoveOutClaims: {
    type: 'claims',
    question_name: 'LandlordSeekingMoveOutClaims',
    selection_claims: [102, 122, 104, 101, 103, 105, 130, 106, 227, 226],
    page_item_options(parsedClaims) {
      return {
        stepText: 'Please select the reason(s) you are seeking an order of possession:',
        stepComplete: claimsContain(this.selection_claims, parsedClaims),
        staticWarning: `You cannot submit an application for possession of a rental unit or site until after any applicable tenant deadline for disputing the notice or paying the unpaid rent and/or utilities has passed.&nbsp;<b>Your application may be dismissed if you file too early.</b>
        ${WebLink.format({
          url: 'http://www.housing.gov.bc.ca/rtb/WebTools/OrderOfPossessionLandlord.html',
          text: 'Use our tools to calculate when you can make your application'
        })}.`
        
      };
    },
    claims_options(parsedClaims) {
      const configOPR = configChannel.request('get:issue', 102),
        configOPC = configChannel.request('get:issue', 104),
        configOPL = configChannel.request('get:issue', 103),
        configOPL4M = configChannel.request('get:issue', 131),
        configOPB = configChannel.request('get:issue', 106),
        configOPM = configChannel.request('get:issue', 227),
        configOPN = configChannel.request('get:issue', 226),
        configOPLC = configChannel.request('get:issue', 130);

      const dispute = disputeChannel.request('get'),
        isMHPTA = dispute.isMHPTA();

      return [{
        claimCode: {
          'rent-only': 102,
          'utilities': 122,
        },
        checkboxOptions: {
          html: configOPR.selectionTitle,
          checked: _.has(parsedClaims, 102) || _.has(parsedClaims, 122),
          helpHtml: configOPR.selectionHelp
        },
        dropdownOptions: {
          required: true,
          defaultBlank: true,
          cssClass: 'max-width-400',
          optionData: [{ value: 'rent-only', text: 'Rent Only (No Utilities)'},
              { value: 'utilities', text: 'Utilities Only or Rent and Utilities'}],
          labelText: 'Reason on the 10 day notice form (RTB-30)',
          value: _.has(parsedClaims, 102) ? 'rent-only' :
            (_.has(parsedClaims, 122) ? 'utilities' : null)
        },

        getSelectedClaimCodeOverrideFn: (model) => {
          const dropdownModel = model.get('dropdown');
          const isRentOnly = dropdownModel && dropdownModel.getData() === 'rent-only';
          const selectedClaimCodes = [];

          if (isRentOnly) {
            selectedClaimCodes.push(102);
          } else {
            selectedClaimCodes.push(122);
          }

          return selectedClaimCodes;
        },
      },
      {
        claimCode: {
          'other-cause': 104,
          'end-of-employment': 101
        },
        checkboxOptions: {
            html: configOPC.selectionTitle,
            checked: _.has(parsedClaims, 104) || _.has(parsedClaims, 101),
            helpHtml: configOPC.selectionHelp
        },
        dropdownOptions: {
          required: true,
          defaultBlank: true,
          cssClass: 'max-width-400',
          optionData: [{ value: 'other-cause', text: 'Other Cause (Not Employment)'},
          { value: 'end-of-employment', text: 'End of Employment'}],
          labelText: 'Reason on the one month notice form (RTB-33)',
          value: _.has(parsedClaims, 104) ? 'other-cause' : _.has(parsedClaims, 101) ? 'end-of-employment' : null
        }
      },
      {
        hidden: isMHPTA ? true : false,
        claimCode: {
          'landlord-use': 103,
          'unqualified-for-subsidized-housing': 105
        },
        checkboxOptions: {
          html: configOPL.selectionTitle,
          checked: _.has(parsedClaims, 103) || _.has(parsedClaims, 105),
          helpHtml: configOPL.selectionHelp
        },
        dropdownOptions: {
          required: true,
          defaultBlank: true,
          cssClass: 'max-width-400',
          optionData: [{ value: 'landlord-use', text: 'Landlord use of property'},
              { value: 'unqualified-for-subsidized-housing', text: 'Does not qualify for subsidized housing'}],
          labelText: 'Reason on the two month notice form (RTB-32)',
          value: _.has(parsedClaims, 103) ? 'landlord-use' : _.has(parsedClaims, 105) ? 'unqualified-for-subsidized-housing' : null
        }
      },
      {
        hidden: isMHPTA ? true : false,
        claimCode: 131,
        checkboxOptions: {
          html: configOPL4M.selectionTitle,
          helpHtml: configOPL4M.selectionHelp,
          checked: _.has(parsedClaims, 131)
        }
      },
      {
        hidden: isMHPTA ? false : true,
        claimCode: 130,
        checkboxOptions: {
          html: configOPLC.selectionTitle,
          helpHtml: configOPLC.selectionHelp,
          checked: _.has(parsedClaims, 130)
        }
      },
      {
        claimCode: 106,
        checkboxOptions: {
          html: configOPB.selectionTitle,
          helpHtml: configOPB.selectionHelp,
          checked: _.has(parsedClaims, 106)
        }
      },
      {
        claimCode: 227,
        checkboxOptions: {
          html: configOPM.selectionTitle,
          helpHtml: configOPM.selectionHelp,
          checked: _.has(parsedClaims, 227)
        }
      },
      {
        claimCode: 226,
        checkboxOptions: {
          html: configOPN.selectionTitle,
          helpHtml: configOPN.selectionHelp,
          checked: _.has(parsedClaims, 226)
        }
      }];
    }
  },

  LandlordSeekingMoney: {
    type: 'claimQuestion',
    question_name: 'S5_LandlordSeekingMoney',
    linked_claims: 'LandlordSeekingMoneyClaims',
    page_item_options(questionModel) {
      return {
        linked_claims: this.linked_claims,
        stepText: 'Are you seeking an order for the tenant to pay money?',
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: `You may request a monetary order if a tenant owes money for rent, damages or compensation for other losses.  This may include utilities, fines, late fees, etc.<br/><br/>Your total monetary issue cannot exceed $35,000.`,
      };
    },
    question_options: {
      optionData: [{ name: 'landlord-seeking-money-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'landlord-seeking-money-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}],
      clearWhenHidden: true
    }
  },


  LandlordSeekingMoneyClaims: {
    type: 'claims',
    question_name: 'LandlordSeekingMoneyClaims',
    selection_claims: [107, 127, 108, 128, 110, 129],
    page_item_options(parsedClaims) {
      return {
        stepText: 'Please select the reason(s) you are seeking money:',
        stepComplete: claimsContain(this.selection_claims, parsedClaims),
      };
    },
    claims_options(parsedClaims) {
      const dispute = disputeChannel.request('get'),
        hasDeposit = dispute.hasDeposit(),
        configMND = configChannel.request('get:issue', 107),
        configMNR = configChannel.request('get:issue', 108),
        configMNDC = configChannel.request('get:issue', 110);

      return [{
        claimCode: !hasDeposit ?
          107 : {
            no: 107,
            yes: 127
          },
        checkboxOptions: {
          html: configMND.selectionTitle,
          checked: _.has(parsedClaims, 107) || _.has(parsedClaims, 127),
          helpHtml: configMND.selectionHelp
        },
        dropdownOptions: !hasDeposit ? null : {
          required: true,
          defaultBlank: true,
          cssClass: 'hold-security',
          optionData: [{ value: 'no', text: 'No'},
                   { value: 'yes', text: 'Yes'}],
          labelText: 'Hold deposit against amount owed?',
          value: _.has(parsedClaims, 107) ? 'no' : _.has(parsedClaims, 127) ? 'yes' : null
        }
      }, {
        claimCode: !hasDeposit ?
          108 : {
            no: 108,
            yes: 128
          },
        checkboxOptions: {
          html: configMNR.selectionTitle,
          checked: _.has(parsedClaims, 108) || _.has(parsedClaims, 128),
          helpHtml: configMNR.selectionHelp
        },
        dropdownOptions: !hasDeposit ? null : {
          required: true,
          defaultBlank: true,
          cssClass: 'hold-security',
          optionData: [{ value: 'no', text: 'No'},
                   { value: 'yes', text: 'Yes'}],
          labelText: 'Hold deposit against amount owed?',
          value: _.has(parsedClaims, 108) ? 'no' : _.has(parsedClaims, 128) ? 'yes' : null
        }
      }, {
        claimCode: !hasDeposit ?
          110 : {
            no: 110,
            yes: 129
          },
        checkboxOptions: {
          html: configMNDC.selectionTitle,
          checked: _.has(parsedClaims, 110) || _.has(parsedClaims, 129),
          helpHtml: configMNDC.selectionHelp
        },
        dropdownOptions: !hasDeposit ? null : {
          required: true,
          defaultBlank: true,
          cssClass: 'hold-security',
          optionData: [{ value: 'no', text: 'No'},
                   { value: 'yes', text: 'Yes'}],
          labelText: 'Hold deposit against amount owed?',
          value: _.has(parsedClaims, 110) ? 'no' : _.has(parsedClaims, 129) ? 'yes' : null
        }
      }];
    }
  },


  // Tenant

  // Tenant urgent issues
  TenantUrgentPossession: {
    type: 'claimQuestion',
    question_name: 'S5_TenantUrgentPossession',
    linked_claims: null,
    question_claim_code: 218,
    page_item_options(questionModel) {
      return {
        linked_claims: this.linked_claims,
        question_claim_code: this.question_claim_code,
        stepText: 'Are you unable to access the rental unit or site because you have been denied access by the landlord and require an order of possession?',
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: 'No other dispute issues can be checked with this type of application except to recover the filing fee.<br/><br/>' +
          'You must provide evidence with this application to prove that the landlord has changed the locks or is otherwise not allowing you to access the rental unit.'
      };
    },
    question_options: {
      optionData: [{ name: 'tenant-urgent-possession-no', value: "0", cssClass: 'option-button-no option-button yes-no', text: 'NO'},
        { name: 'tenant-urgent-possession-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}],
        clearWhenHidden: true
    }
  },

  TenantUrgentRepairs: {
    type: 'claimQuestion',
    question_name: 'S5_TenantUrgentRepairs',
    linked_claims: null,
    question_claim_code: 213,
    page_item_options(questionModel) {
      return {
        linked_claims: this.linked_claims,
        question_claim_code: this.question_claim_code,
        stepText: 'Do you need the landlord to make emergency repairs for health or safety reasons and have you contacted the landlord to make repairs which have not been completed?',
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: "No other dispute issues can be checked with this type of application except to recover the filing fee.<br/><br/>" +
          "Select this issue if you are requesting emergency repairs that are necessary for health or safety or for the preservation or use of rental property.  These are typically limited to major leaks in pipes or the roof;  damaged or blocked water or sewer pipes or plumbing fixtures; necessary urgent repairs to the primary heating system or electrical system.<br/><br/>"+
          `There are very specific requirements in order to be successful with this claim.  Learn more on ${WebLink.format({
            url: 'http://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/during-a-tenancy/repairs-and-maintenance#Emergency',
            text: 'our website' })}.<br/><br/>` +
          "If you have already completed and paid for emergency repairs and want compensation from your landlord please select the claim box for seeking monetary compensation, or, for requesting a rent reduction; do not choose the box for emergency repairs if they have already been done."
      };
    },
    question_options: {
      optionData: [{ name: 'tenant-urgent-repairs-no', value: "0", cssClass: 'option-button-no option-button yes-no', text: 'NO'},
        { name: 'tenant-urgent-repairs-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}],
        clearWhenHidden: true
    }
  },

  TenantDirectRequest: {
    type: 'claimQuestion',
    question_name: 'S5_TenantDirectRequest',
    linked_claims: 'TenantDirectRequestClaims',
    page_item_options(questionModel) {
      return {
        linked_claims: this.linked_claims,
        stepText: 'Are you seeking the return of your security and/or pet damage deposit through the direct request process?',
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: `The direct request process allows you to obtain a monetary order for your security deposit and/or pet damage deposit without a participatory hearing.<br/><br/>`+
        `If the landlord has made a claim to retain the deposit(s), this application will be scheduled for a hearing with the landlord's application.<br/><br/>`+
        `As this proceeding is restricted to evidence submitted by the tenant, there are very specific requirements. Learn more about <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/apply-online/tenants-direct-request?keyword=security&keyword=deposit">Tenant's Direct Request</a>.`
      };
    },
    question_options: {
      optionData: [{ name: 'tenant-direct-request-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'tenant-direct-request-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}],
      clearWhenHidden: true
    }
  },

  TenantDirectRequestClaims: {
    type: 'claims',
    question_name: 'TenantDirectRequestClaims',
    selection_claims: [237, 238, 239],
    page_item_options(parsedClaims) {
      return {
        stepText: 'Please select the deposit(s) that you want returned',
        stepComplete: claimsContain(this.selection_claims, parsedClaims),
        staticWarning: `<p><b>Before you proceed</b></p> You can submit this application 20 days after the tenancy has ended and the landlord has your forwarding address (15 days to return the deposit(s) plus 5 days to allow for mail to be received). Your application may be dismissed if you apply too early and your filing fee will not be returned.`
      };
    },
    claims_options(parsedClaims) {
      const dispute = disputeChannel.request('get');
      const hasSecurityDeposit = dispute.hasSecurityDeposit();
      const hasPetDeposit = dispute.hasPetDeposit();

      return [{
        claimCode: {
          'security': 237,
          'pet': 238,
          'both': 239
        },
        checkboxOptions: {
          html: '-',
          // Don't show the checkbox item question here, always keep it checked and hidden
          checked: true
        },
        dropdownOptions: {
          required: true,
          defaultBlank: true,
          cssClass: 'max-width-400',
          optionData: [
            ...( hasSecurityDeposit ? [{ value: 'security', text: 'Security Deposit Only'}] : []),
            ...( hasPetDeposit ? [{ value: 'pet', text: 'Pet Damage Deposit Only'}] : []),
            ...( hasSecurityDeposit && hasPetDeposit ? [{ value: 'both', text: 'Both Security and Pet Damage Deposits'}] : []),
          ],
          labelText: 'Deposit you want returned',
          value: _.has(parsedClaims, 237) ? 'security' : 
              _.has(parsedClaims, 238) ? 'pet' :
              _.has(parsedClaims, 239) ? 'both' :
              null
        }
      }];
    }
  },


  TenantSeekingMoveOut: {
    type: 'claimQuestion',
    question_name: 'S5_TenantSeekingMoveOut',
    linked_claims: 'TenantSeekingMoveOutClaims',
    page_item_options(questionModel) {
      return {
        linked_claims: this.linked_claims,
        stepText: 'Do you want to dispute a notice to end your tenancy that you received from the landlord?',
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: `You may dispute a notice to end tenancy, if the deadline for disputing the notice (or paying the unpaid rent or utilities) has not passed.<br/><br/>${WebLink.format({
          url: 'http://www.housing.gov.bc.ca/rtb/WebTools/DisputeLandlordNotice.html',
          text: 'Calculate if the deadline to dispute the notice has passed'})}.  If you are filing your application after the dispute period indicated on the notice and requesting more time to file the application, you must select that claim below.<br/><br/>A landlord's notice to end a tenancy must be on the approved government form.  A verbal notice to end a tenancy is not valid.`
      };
    },
    question_options: {
      optionData: [{ name: 'tenant-seeking-move-out-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
        { name: 'tenant-seeking-move-out-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}],
      clearWhenHidden: true
    }
  },


  TenantSeekingMoveOutClaims: {
    type: 'claims',
    question_name: 'TenantSeekingMoveOutClaims',
    selection_claims: [208, 205, 207, 206, 204, 203, 230, 231, 232, 233, 234, 235, 236],
    page_item_options(parsedClaims) {
      return {
        stepText: 'Select the landlord notice that you want to dispute:',
        stepComplete: claimsContain(this.selection_claims, parsedClaims),
        staticError: `${PANDEMIC_RENT_INCREASE_ISSUE_STATIC_ERROR_HTML}${PANDEMIC_RENT_INCREASE_LEARN_MORE_HTML}`,
        staticWarning: `If you are filing an application to dispute a notice to end tenancy after the dispute period indicated on the notice and requesting more time to file the application, you must indicate this when you choose your claim below.<br/><br/>Not sure if you're past the deadline to dispute the notice to end tenancy?&nbsp;<a class='static-external-link' url='http://www.housing.gov.bc.ca/rtb/WebTools/DisputeLandlordNotice.html' href='javascript:;'>Use our tools to calculate if the deadline to dispute the notice has passed.</a>`
      };
    },
    claims_options(parsedClaims) {
      const configCNR = configChannel.request('get:issue', 208),
        configCNC = configChannel.request('get:issue', 205),
        configCNL = configChannel.request('get:issue', 207),
        configCNL4M = configChannel.request('get:issue', 224),
        configCNLC = configChannel.request('get:issue', 206);
        

      const dispute = disputeChannel.request('get'),
        isMHPTA = dispute.isMHPTA();

      return [{
        claimCode: {
          'no': 208,
          'yes': 230
        },
        checkboxOptions: {
          html: configCNR.selectionTitle,
          checked: _.has(parsedClaims, 208) || _.has(parsedClaims, 230),
          helpHtml: configCNR.selectionHelp
        },
        dropdownOptions: {
          required: true,
          defaultBlank: true,
          cssClass: 'filing-late',
          optionData: [{ value: 'no', text: 'No'},
            { value: 'yes', text: 'Yes'}],
          labelText: 'Are you filing late?',
          value: _.has(parsedClaims, 208) ? 'no' : _.has(parsedClaims, 230) ? 'yes' : null
        }
      },
      {
        claimCode: {
          'other-cause': 205,
          'end-of-employment': 204,

          '_other-cause-late': 231,
          '_end-of-employment-late': 232,
        },
        secondDropdownClaimSelectors: {
          no: function(claim_code_val) { return claim_code_val === 'other-cause' ? 205 : 204; },
          yes: function(claim_code_val) { return claim_code_val === 'other-cause' ? 231 : 232; }
        },
        checkboxOptions: {
          html: configCNC.selectionTitle,
          checked: _.has(parsedClaims, 205) || _.has(parsedClaims, 204) || _.has(parsedClaims, 231) || _.has(parsedClaims, 232),
          helpHtml: configCNC.selectionHelp
        },
        dropdownOptions: {
          required: true,
          defaultBlank: true,
          cssClass: 'max-width-400',
          optionData: [{ value: 'other-cause', text: 'Other Cause (Not Employment)'},
            { value: 'end-of-employment', text: 'End of Employment'}],
          labelText: 'Reason on the one month notice',
          value: _.has(parsedClaims, 205) || _.has(parsedClaims, 231) ? 'other-cause' :
            (_.has(parsedClaims, 204) || _.has(parsedClaims, 232) ? 'end-of-employment' : null)
        },
        secondDropdownOptions: {
          required: true,
          defaultBlank: true,
          cssClass: 'filing-late',
          optionData: [{ value: 'no', text: 'No'},
                   { value: 'yes', text: 'Yes'}],
          labelText: 'Are you filing late?',
          value: _.has(parsedClaims, 205) || _.has(parsedClaims, 204)  ? 'no' :
              (_.has(parsedClaims, 231) || _.has(parsedClaims, 232) ? 'yes' : null)
        }
      },
      {
        hidden: isMHPTA ? true : false,
        claimCode: {
          'landlord-use': 207,
          'unqualified-for-subsidized-housing': 203,

          '_landlord-use-late': 233,
          '_unqualified-for-subsidized-housing-late': 234
        },
        secondDropdownClaimSelectors: {
          no: function(claim_code_val) { return claim_code_val === 'landlord-use' ? 207 : 203; },
          yes: function(claim_code_val) { return claim_code_val === 'landlord-use' ? 233 : 234; }
        },
        checkboxOptions: {
          html: configCNL.selectionTitle,
          checked: _.has(parsedClaims, 207) || _.has(parsedClaims, 203) || _.has(parsedClaims, 233) || _.has(parsedClaims, 234),
          helpHtml: configCNL.selectionHelp
        },
        dropdownOptions: {
          required: true,
          defaultBlank: true,
          cssClass: 'max-width-400',
          optionData: [{ value: 'landlord-use', text: 'Landlord use of property'},
            { value: 'unqualified-for-subsidized-housing', text: 'Does not qualify for subsidized housing'}],
          labelText: 'Reason on the two month notice',
          value: _.has(parsedClaims, 207) || _.has(parsedClaims, 233) ? 'landlord-use' :
            (_.has(parsedClaims, 203) || _.has(parsedClaims, 234) ? 'unqualified-for-subsidized-housing' : null)
        },
        secondDropdownOptions: {
          required: true,
          defaultBlank: true,
          cssClass: 'hold-security',
          optionData: [{ value: 'no', text: 'No'},
                   { value: 'yes', text: 'Yes'}],
          labelText: 'Are you filing late',
          value: _.has(parsedClaims, 207) || _.has(parsedClaims, 203)  ? 'no' :
              (_.has(parsedClaims, 233) || _.has(parsedClaims, 234) ? 'yes' : null)
        }
      },
      {
        hidden: isMHPTA ? true : false,
        claimCode: {
          'no': 224,
          'yes': 235
        },
        checkboxOptions: {
          html: configCNL4M.selectionTitle,
          checked: _.has(parsedClaims, 224) || _.has(parsedClaims, 235),
          helpHtml: configCNL4M.selectionHelp
        },
        dropdownOptions: {
          required: true,
          defaultBlank: true,
          cssClass: 'filing-late',
          optionData: [{ value: 'no', text: 'No'},
            { value: 'yes', text: 'Yes'}],
          labelText: 'Are you filing late?',
          value: _.has(parsedClaims, 224) ? 'no' : _.has(parsedClaims, 235) ? 'yes' : null
        }
      },
      {
        hidden: isMHPTA ? false : true,
        claimCode: {
          'no': 206,
          'yes': 236
        },
        checkboxOptions: {
          html: configCNLC.selectionTitle,
          checked: _.has(parsedClaims, 206) || _.has(parsedClaims, 236),
          helpHtml: configCNLC.selectionHelp
        },
        dropdownOptions: {
          required: true,
          defaultBlank: true,
          cssClass: 'filing-late',
          optionData: [{ value: 'no', text: 'No'},
            { value: 'yes', text: 'Yes'}],
          labelText: 'Are you filing late?',
          value: _.has(parsedClaims, 206) ? 'no' : _.has(parsedClaims, 236) ? 'yes' : null
        }
      }];
    }
  },

  TenantSeekingMoney: {
    type: 'claimQuestion',
    question_name: 'S5_TenantSeekingMoney',
    linked_claims: 'TenantSeekingMoneyClaims',
    page_item_options(questionModel) {
      const dispute = disputeChannel.request('get');
      return {
        linked_claims: this.linked_claims,
        stepText: dispute.isPastTenancy() ? "Are you seeking money from your landlord?" : "Are you seeking money from your landlord, to reduce your rent or to dispute a rent increase?",
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: "You may request a monetary order if a landlord owes money for costs of emergency repairs you have paid for yourself, compensation for other losses, or the return of your security deposit and/or pet damage deposit.<br/><br/>You may also request to reduce your rent for repairs, services or facilities agreed upon but not provided by your landlord.<br/><br/>Your total monetary claim cannot be more than $35,000.",
        showTotal: true,
      };
    },
    question_options: {
      optionData: [{ name: 'tenant-seeking-money-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
        { name: 'tenant-seeking-money-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}],
      clearWhenHidden: true
    }
  },

  TenantSeekingMoneyClaims: {
    type: 'claims',
    question_name: 'TenantSeekingMoneyClaims',
    selection_claims: [210, 211, 209, 202, 222, 243, 245],
    page_item_options(parsedClaims) {
      const dispute = disputeChannel.request('get'),
        isPastTenancy = dispute.isPastTenancy();
      return {
        stepText: 'Select the money or rent issue(s) you want to resolve:',
        stepComplete: claimsContain(this.selection_claims, parsedClaims),
        staticError: !isPastTenancy ? `${PANDEMIC_RENT_INCREASE_ISSUE_STATIC_ERROR_HTML}${PANDEMIC_RENT_INCREASE_LEARN_MORE_HTML}` : null
      };
    },
    claims_options(parsedClaims) {
      const configTMNDC = configChannel.request('get:issue', 210);
      const configTMNSD = configChannel.request('get:issue', 211);
      const configTMNR = configChannel.request('get:issue', 209);
      const configDRI = configChannel.request('get:issue', 202);
      const configDRI_ARIC = configChannel.request('get:issue', 245);
      const configRR = configChannel.request('get:issue', 222);
      const configMNETC = configChannel.request('get:issue', 243);

      const dispute = disputeChannel.request('get');
      const isPastTenancy = dispute.isPastTenancy();
      const hasDeposit = dispute.hasDeposit();
      const isMHPTA = dispute.isMHPTA();

      return [{
        claimCode: 210,
        checkboxOptions: {
          html: configTMNDC.selectionTitle,
          checked: _.has(parsedClaims, 210),
          helpHtml: configTMNDC.selectionHelp
        }
      },
      {
        hidden: isPastTenancy && hasDeposit ? false : true,
        claimCode: 211,
        checkboxOptions: {
          html: configTMNSD.selectionTitle,
          checked: _.has(parsedClaims, 211),
          helpHtml: configTMNSD.selectionHelp
        }
      },
      {
        claimCode: 209,
        checkboxOptions: {
          html: configTMNR.selectionTitle,
          checked: _.has(parsedClaims, 209),
          helpHtml: configTMNR.selectionHelp
        }
      },
      {
        hidden: isPastTenancy ? true : false,
        claimCode: isMHPTA ? 202 : {
          'standard': 202,
          'ari-c': 245
        },
        checkboxOptions: {
          html: configDRI.selectionTitle,
          checked: _.has(parsedClaims, 202) || (!isMHPTA && _.has(parsedClaims, 245)),
          helpHtml: isMHPTA ?  configDRI.selectionHelp : configDRI_ARIC.selectionHelp
        },
        dropdownOptions: isMHPTA ? null : {
          required: true,
          defaultBlank: true,
          cssClass: 'max-width-400',
          optionData: [{ value: 'standard', text: 'Standard Rent Increase' },
            { value: 'ari-c', text: 'Additional Rent Increase (Capital Expenditures)' }],
          labelText: 'Type of rent increase',
          value: _.has(parsedClaims, 202) ? 'standard' : _.has(parsedClaims, 245) ? 'ari-c' : null
        }
      },
      {
        hidden: isPastTenancy ? true : false,
        claimCode: 222,
        checkboxOptions: {
          html: configRR.selectionTitle,
          checked: _.has(parsedClaims, 222),
          helpHtml: configRR.selectionHelp
        }
      },
      {
        hidden: isPastTenancy ? false : true,
        claimCode: 243,
        checkboxOptions: {
          // NOTE: MNETC uses the issue text/help for selection text/help as well
          html: configMNETC.issueTitle,
          checked: _.has(parsedClaims, 243),
          helpHtml: configMNETC.issueHelp
        }
      },    
    ];
    }
  },


  TenantSeekingRepairs: {
    type: 'claimQuestion',
    question_name: 'S5_TenantSeekingRepairs',
    linked_claims: 'TenantSeekingRepairsClaims',
    page_item_options(questionModel) {
      return {
        linked_claims: this.linked_claims,
        stepText: "Do you want the landlord to make repairs?",
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: "There are two types of repair orders you can request.  Emergency repairs are urgent and may affect the health or safety of the tenant.  If it is not urgent, then select regular repairs.",
      };
    },
    question_options: {
      optionData: [{ name: 'tenant-seeking-repairs-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
        { name: 'tenant-seeking-repairs-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}],
      clearWhenHidden: true
    }
  },

  TenantSeekingRepairsClaims: {
    type: 'claims',
    question_name: 'TenantSeekingRepairsClaims',
    selection_claims: [214],
    page_item_options(parsedClaims) {
      return {
        stepText: 'Select the type of repairs you need the landlord to complete:',
        stepComplete: claimsContain(this.selection_claims, parsedClaims),
      };
    },
    claims_options(parsedClaims) {
      const configRP = configChannel.request('get:issue', 214);

      return [{
        claimCode: 214,
        checkboxOptions: {
          html: configRP.selectionTitle,
          checked: _.has(parsedClaims, 214),
          helpHtml: configRP.selectionHelp
        }
      }];
    }
  },



  TenantSeekingService: {
    type: 'claimQuestion',
    question_name: 'S5_TenantSeekingService',
    linked_claims: 'TenantSeekingServiceClaims',
    page_item_options(questionModel) {
      return {
        linked_claims: this.linked_claims,
        stepText: "Are you being denied access to services or facilities?",
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: "Select this issue if the landlord has restricted access to the rental unit or site for you or your guests or has denied services or facilities required by the tenancy agreement or law.<br/><br/>A landlord cannot terminate an essential service such as power or water.",
      };
    },
    question_options: {
      optionData: [{ name: 'tenant-seeking-repairs-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
        { name: 'tenant-seeking-repairs-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}],
      clearWhenHidden: true
    }
  },

  TenantSeekingServiceClaims: {
    type: 'claims',
    question_name: 'TenantSeekingServiceClaims',
    selection_claims: [219, 215],
    page_item_options(parsedClaims) {
      return {
        stepText: 'Select the service or facility issue(s) you want to resolve:',
        stepComplete: claimsContain(this.selection_claims, parsedClaims),
      };
    },
    claims_options(parsedClaims) {
      const configAAT = configChannel.request('get:issue', 219),
        configPSF = configChannel.request('get:issue', 215);

      return [{
        claimCode: 219,
        checkboxOptions: {
          html: configAAT.selectionTitle,
          checked: _.has(parsedClaims, 219),
          helpHtml: configAAT.selectionHelp
        },
      },
      {
        claimCode: 215,
        checkboxOptions: {
          html: configPSF.selectionTitle,
          checked: _.has(parsedClaims, 215),
          helpHtml: configPSF.selectionHelp
        }
      }];
    }
  },

  TenantSeekingRestriction: {
    type: 'claimQuestion',
    question_name: 'S5_TenantSeekingRestriction',
    linked_claims: 'TenantSeekingRestrictionClaims',
    page_item_options(questionModel) {
      return {
        linked_claims: this.linked_claims,
        stepText: "Do you want to restrict the landlord's access to the property?",
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: "Select this issue if the landlord is unreasonably accessing your rental unit or stie.  You have a right to quiet enjoyment which includes reasonable privacy.",
      };
    },
    question_options: {
      optionData: [{ name: 'tenant-seeking-restriction-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
        { name: 'tenant-seeking-restriction-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}],
      clearWhenHidden: true
    }
  },

  TenantSeekingRestrictionClaims: {
    type: 'claims',
    question_name: 'TenantSeekingRestrictionClaims',
    selection_claims: [217, 220],
    page_item_options(parsedClaims) {
      return {
        stepText: 'Select the landlord restriction you are seeking:',
        stepComplete: claimsContain(this.selection_claims, parsedClaims)
      };
    },
    claims_options(parsedClaims) {
      const configLRE = configChannel.request('get:issue', 217),
        configLAT = configChannel.request('get:issue', 220);

      return [{
        claimCode: 217,
        checkboxOptions: {
          html: configLRE.selectionTitle,
          checked: _.has(parsedClaims, 217),
          helpHtml: configLRE.selectionHelp
        }
      },
      {
        claimCode: 220,
        checkboxOptions: {
          html: configLAT.selectionTitle,
          checked: _.has(parsedClaims, 220),
          helpHtml: configLAT.selectionHelp
        }
      }];
    }
  },


  TenantSeekingOther: {
    type: 'claimQuestion',
    question_name: 'S5_TenantSeekingOther',
    linked_claims: 'TenantSeekingOtherClaims',
    page_item_options(questionModel) {
      return {
        linked_claims: this.linked_claims,
        stepText: "Do you have other issues with the landlord not listed above?",
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: "Select this issue only if none of the issues listed above apply to your situation.",
      };
    },
    question_options: {
      optionData: [{ name: 'tenant-seeking-repairs-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'tenant-seeking-repairs-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}],
      clearWhenHidden: true
    }
  },

  TenantSeekingOtherClaims: {
    type: 'claims',
    question_name: 'TenantSeekingOtherClaims',
    selection_claims: [216, 221, 212],
    page_item_options(parsedClaims) {
      const dispute = disputeChannel.request('get'),
        isPastTenancy = dispute.isPastTenancy();
      return {
        stepText: 'Please select any of the other issue(s) that apply to your dispute:',
        stepComplete: claimsContain(this.selection_claims, parsedClaims),
        staticError: !isPastTenancy ? `${PANDEMIC_RENT_INCREASE_ISSUE_STATIC_ERROR_HTML}${PANDEMIC_LEARN_MORE_HTML}` : null
      };
    },
    claims_options(parsedClaims) {
      const configRPP = configChannel.request('get:issue', 216),
        configAS = configChannel.request('get:issue', 221),
        configOLC = configChannel.request('get:issue', 212);

      const dispute = disputeChannel.request('get'),
        isPastTenancy = dispute.isPastTenancy();

      return [{
        hidden: false,
        claimCode: 216,
        checkboxOptions: {
          html: configRPP.selectionTitle,
          checked: _.has(parsedClaims, 216),
          helpHtml: configRPP.selectionHelp
        }
      },
      {
        hidden: isPastTenancy ? true : false,
        claimCode: 221,
        checkboxOptions: {
          html: configAS.selectionTitle,
          checked: _.has(parsedClaims, 221),
          helpHtml: configAS.selectionHelp
        }
      },
      {
        hidden: isPastTenancy ? true : false,
        claimCode: 212,
        checkboxOptions: {
          html: configOLC.selectionTitle,
          checked: _.has(parsedClaims, 212),
          helpHtml: configOLC.selectionHelp
        }
      }];
    }
  }
};

export default config;
