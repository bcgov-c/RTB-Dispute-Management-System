<div class="search-option-row">
  <div class="file-number-title">
    <h4>Enter the file number you want to search for matching applications</h4>
  </div>
  <div class="cross-app-file-number"></div>
  <div class="advanced-search-button">
    <button class="btn-primary btn-standard cross-app-file-number-btn-search">Populate Search</button>
  </div>
</div>
<div class="search-option-row cross-app-populate-results">
  <% if (!searchPopulated) { %>
    <div class="standard-list-empty">No search populated</div>
  <% } else { %>
    <div class="populate-results-inputs">
      <div class="cross-app-dispute-sub-type"></div>
      <div class="search-tenancy-address"></div>
      <div class="tenancy-address-geo"><%= tenancyAddressCityPostal %></div>

      <div class="cross-app-tenancy-address-search-info warning-yellow">Use just the street name for more results</div>
    </div>

    <div class="populate-search-params">
      <div class="">
        <span class="review-label">Dispute Applicant:</span>&nbsp;<span><%= dispute.isLandlord() ? 'Landlord' : 'Tenant' %></span>
      </div>
      <div class="">
        <span class="review-label">Hearing:</span>&nbsp;<span><%= activeHearing ? Formatter.toHearingTypeAndTimeDisplay(activeHearing) : '-' %></span>
      </div>
      <% applicants.each(function(applicant, index) { %>
        <div class="">
          <span class="review-label">Applicant <%= Formatter.toLeftPad(index+1) %>:</span>&nbsp;<span><%= applicant.getNameContactDisplay() %></span>
        </div>
      <% }) %>
      <% respondents.each(function(respondent, index) { %>
        <div class="">
          <span class="review-label">Respondent <%= Formatter.toLeftPad(index+1) %>:</span>&nbsp;<span><%= respondent.getNameContactDisplay() %></span>
        </div>
      <% }) %>
    </div>

    <div class="populate-search-tools">
      <div class="toggle-include-inactive-disputes"></div>
      <div class="toggle-exclude-active-hearings"></div>
      <div class="exclude-active-hearings-amount"></div>
      <span class="exclude-active-hearings-amount-text">&nbsp;days from now&nbsp;</span>
      <div class="crossapp-min-threshold"></div>
      <div class="">
        <div class="cross-app-btn-search advanced-search-page-search-icon"></div>
      </div>
    </div>
  <% } %>
</div>

