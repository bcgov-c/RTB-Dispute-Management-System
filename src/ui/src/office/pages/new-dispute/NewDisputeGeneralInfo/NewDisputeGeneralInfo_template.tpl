
<div>
  <div class="office-page-new-dispute-section-title">General Dispute Information</div>

  <div class="office-page-flex-container office-page-new-dispute-general-section">
    <div class="office-page-flex-container">
      <div class="office-new-dispute-applicant-type"></div>
      <div class="office-new-dispute-current-tenancy"></div>
      <div class="office-new-dispute-direct-request <%= showDirectRequest ? '' : 'hidden' %>"></div>
    </div>
  </div>

  <div class="office-page-flex-container office-new-dispute-rtb-dropdown-container clearfix <%= showEmergency ? '' : 'hidden' %>">
    <div class="office-new-dispute-is-emergency"></div>
    <div class="">
      <% if (isTenant) { %>
        <span>Is the tenant locked out or is the unit uninhabitable due to emergency repairs?</span>
      <% } else { %>
        <span>Is the landlord in immediate danger?</span>
      <% } %>
      <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/solving-problems/dispute-resolution/expedited-hearings?keyword=expedited">Learn more</a>.
    </div>
  </div>

  
  <div class="office-page-flex-container office-new-dispute-rtb-dropdown-container clearfix <%= showRentIncrease ? '' : 'hidden' %>">
    <div class="office-new-dispute-rent-increase"></div>
    <div class="">Is the landlord filing a paper rent increase application for additional operational expenses</div>
  </div>

  <div class="office-page-flex-container office-new-dispute-rtb-dropdown-container clearfix <%= expectedFormDisplay ? '' : 'hidden' %>">
    <div class="office-new-dispute-rtb-form-used"></div>
    <div class="">Was the correct form used?&nbsp;Expected Form:&nbsp;<b><%= expectedFormDisplay ? expectedFormDisplay : 'None' %></b></div>
  </div>

  <div class="office-sub-page-buttons">
    <button class="btn btn-lg btn-office-continue <%= showContinueButton ? '' : 'hidden' %>">Continue</button>
    <button class="btn btn-lg btn-office-reset hidden">Reset</button>
  </div>

</div>