<div class="office-top-main-instructions"></div>
<div class="office-top-main-content-container"></div>

<div class="office-sub-page-view">
  <div class="da-page-header-title">
    <span class="da-page-header-icon da-access-menu-icon"></span>
    <span class="da-page-header-title-text">Submit New Paper Application</span>
  </div>

  <div class="office-page-step-container">
    <div class="office-page-step-icon"></div>
    <div>
        <b>Step 1:</b>&nbsp;<span>Enter the following information as it was entered on the first page of the paper application form.</span>
    </div>
  </div>

  <div class="office-page-new-dispute-section">
    GENERAL DISPUTE PAGE HERE
  </div>

  <div class="<%= showStep2 ? '' : 'hidden' %>">
  <!-- Dispute Unit or Site Information -->
  <div class="office-page-new-dispute-section">
    <div class="office-page-new-dispute-section-title">
      <%= isRentIncrease ? 'Rental Site Information' : 'Dispute Unit or Site Information' %>
    </div>

    <div class="office-page-new-dispute-site-section <%= isLandlord ? '' : 'office-page-new-dispute-is-tenant' %>">
      <div class="office-page-flex-container">
        <div class="office-new-dispute-rental-type"></div>
        <div class="office-new-dispute-owns-home"></div>
        <div class="office-new-dispute-cross-app <%= showCrossAppInput ? '' : 'hidden' %>"></div>
      </div>

      <div class="office-new-dispute-tenantdr-warning error-block warning <%= tenantDrWarning ? '' : 'hidden' %> "><%= tenantDrWarning %></div>

      <div class="office-page-flex-container office-page-new-dispute-address-container <%= tenantDrWarning ? 'hidden' : '' %>">
        <div class="office-new-page-address"></div>
      </div>

      <div class="office-new-dispute-geozone-warning error-block warning warning-sm <%= geozoneWarning ? '' : 'hidden' %>"><%= geozoneWarning %></div>
    </div>

    <div class="office-page-flex-container office-new-dispute-rtb-dropdown-container clearfix  <%= tenantDrWarning ? 'hidden' : '' %>">
      <div class="office-new-dispute-shared-address"></div>
      <div class="">If the rental unit is part of a larger residential property with a shared address, does it have a unique unit identifier (i.e. basement, upper, lower, coach house, etc.)?</div>
    </div>

    <div class="office-new-dispute-rental-unit <%= showRentalUnit ? '' : 'hidden' %>"></div>
  </div>

  <!-- Primary Applicant -->
  <div class="office-page-new-dispute-section <%= tenantDrWarning ? 'hidden' : '' %>">
    <div class="office-page-new-dispute-section-title">Primary Applicant</div>

    <div class="office-page-new-dispute-primary-applicant-section">
      <div class="office-page-new-dispute-participant-type"></div>
      
      <div class="office-page-flex-container office-page-new-dispute-applicant-container">
        <div class="office-page-flex-container office-page-new-dispute-applicant-name-container">
          <div class="office-new-dispute-business-name <%= isBusiness ? '' : 'hidden' %>"></div>
          <div class="office-new-dispute-first-name"></div>
          <div class="office-new-dispute-last-name"></div>
        </div>

        <div class="office-page-flex-container office-page-new-dispute-contact-container">
          <div class="office-new-dispute-phone"></div>
          <div class="office-new-dispute-email"></div>
        </div>

        <div class="office-new-dispute-package-method"></div>
      
      </div>
      
      <div class="office-new-dispute-applicant-forms-container">
        <div class="office-page-flex-container office-new-dispute-rtb-dropdown-container clearfix <%= formConfig.includes('issuesSelectedRegion') ? '' : 'hidden' %>">
          <div class="office-new-dispute-applicant-issues-selected"></div>
          <div class=""><%= issuesSelectedLabel %></div>
        </div>

        <div class="office-page-flex-container office-new-dispute-rtb-dropdown-container clearfix <%= formConfig.includes('additionalFormsRegion') ? '' : 'hidden' %>">
          <div class="office-new-dispute-applicant-additional-forms"></div>
          <div class="">Are additional forms being included with the main application form? (i.e. <%= additionalFormsText %>)</div>
        </div>
        <div class="office-new-dispute-additional-forms-error error-block warning warning-sm <%= hasAdditionalForms ? '' : 'hidden' %>">
          Reminder: Make sure that all additional forms are uploaded with the original application form
        </div>

        <div class="office-page-flex-container office-new-dispute-rtb-dropdown-container clearfix <%= formConfig.includes('rentIncreaseInformationRegion')? '' : 'hidden' %>">
          <div class="office-page-flex-container office-new-dispute-rent-increase-information"></div>
          <div class="office-new-dispute-rent-increase-information-label">Is there a rental unit and tenant provided in the application for all units seeking a rent increase?</div>
        </div>

        <div class="office-page-flex-container office-new-dispute-rtb-dropdown-container clearfix <%= formConfig.includes('respondentIncludedRegion') ? '' : 'hidden' %>">
          <div class="office-new-dispute-applicant-included-respondent"></div>
          <div class="">Is at least one respondent included in the application form?</div>
        </div>

        <div class="office-page-flex-container office-new-dispute-rtb-dropdown-container clearfix <%= formConfig.includes('hasRespondentAddressRegion') ? '' : 'hidden' %>">
          <div class="office-new-dispute-applicant-has-respondent-address"></div>
          <div class="">Does the applicant know the address of the respondent to serve them dispute documents?</div>
        </div>
        <div class="office-new-dispute-additional-forms-error error-block warning <%= doesNotHaveRespondentAddress ? '' : 'hidden' %>">
          Let the applicant know they must be able to serve documents and evidence to each respondent in a method allowed by the Residential Tenancy Act.
          If they cannot serve documents in person, do not have the service address of each respondent or do not have a written agreement to serve documents by email, they can apply for substituted service by filling in the #RTB-13 to serve documents in a different way with proof the respondent(s) would receive them.
          There is no additional fee for an application for substituted service. If they are unable to serve documents, the dispute may not proceed and the filing fee will not be refunded.
          <br/>
          Scan the completed #RTB-13 and attach it as a separate document WITH the new application.
        </div>

        <div class="office-page-flex-container office-new-dispute-rtb-dropdown-container clearfix <%= formConfig.includes('requiredEvidenceRegion') ? '' : 'hidden' %>">
          <div class="office-new-dispute-applicant-required-evidence"></div>
          <div class="">
            <%= isTenant ? 'Is minimum required evidence included? (tenancy agreement, proof of deposit, forwarding address letter RTB-47, Proof forwarding address provided RTB-41, Direct Request Worksheet)' :
              'Is minimum evidence included? (RTB-46 worksheet, RTB-30 notice, RTB-34 service proof and tenancy agreement)' %>
          </div>
        </div>

        <div class="office-rent-increase-container <%= formConfig.includes('rentIncreaseUnitsRegion') ? '' : 'hidden' %>">
          <div class="office-rent-increase-label">Please provide the number of rent increase units</div>
          <div class="office-rent-increase-input">
            <div class="office-new-dispute-rent-increase-units"></div>
            <!-- <button class="btn btn-lg btn-office-increase-submit"><%= rentIncreaseButtonText %></button> -->
          </div>

          <div class="rent-increase-fee-calculation hidden">
            <table>
              <tr>
                <td class="review-label">Base application fee:</td><td><%= Formatter.toAmountDisplay(BASE_APPLICATION_FEE_AMOUNT) %></td>
              </tr>
              <tr>
                <td class="review-label">Additional per unit fee:</td><td class="rent-increase-per-unit-fee"></td>
              </tr>
              <tr>
                <td class="review-label">Total application fee:</td><td class="rent-increase-total-fee "><b></b></td>
              </tr>
            </table>
          </div>  
        </div>

      </div>
    </div>
    
  </div>
  <div class="office-page-error-block error-red"></div>

  <div class="office-sub-page-buttons">
    <button class="btn btn-lg btn-cancel">Cancel</button>
    <button class="btn btn-lg btn-standard btn-continue  <%= tenantDrWarning ? 'hidden' : '' %>">Submit and Continue</button>
  </div>
</div>

</div>
