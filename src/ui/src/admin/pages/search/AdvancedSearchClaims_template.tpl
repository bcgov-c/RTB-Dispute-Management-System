
<div class="dispute-info-row-header">
  <b>Important:</b>&nbsp;This is an issue filter. It is used to find disputes that contain a specific issue code that you want to search for. For example: If you choose MHPTA/Landlord/Current Tenancy, and then select an issue which appears in both MHPTA and RTA disputes, all the matching disputes with that issue will be displayed.
</div>
<div class="search-option-row dispute-info-row">
  <div class="dispute-info-title search-title search-title-claim">Select From Issues For</div>
  <div class="search-claims-dispute-type"></div>
  <div class="search-claims-dispute-sub-type"></div>
  <div class="search-claims-tenancy-status"></div>
  <div class="advanced-search-button">
    <button class="btn-primary btn-standard search-claims-filter-btn"><%= filtersBtnText %></button>
  </div>
</div>

<div class="search-option-row cross-app-populate-results">
  <% if (!claimFilterState) { %>
    <div class="standard-list-empty">No filters applied</div>
  <% } else { %>
    <div class="search-claims-dropdown"></div>
    <div class="spacer-block-15"></div>
    <div class="search-claims-btn-container clearfix">
      <div class="search-claims-add">Add Issue</div>
      <div class="search-claims-btn-search advanced-search-page-search-icon"></div>
    </div>
  <% } %>
</div>