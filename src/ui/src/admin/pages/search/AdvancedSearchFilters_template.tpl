<% if (displayRestrictFilters) { %>
<div style="display: flex">
  <div class="restrict-filters-row">
    <div class="restrict-dates-check-box"></div>
    <div class="restrict-dates-field-box"></div>
    <div class="restrict-dates-type-box"></div>
    <div class="restrict-dates-starting-date"></div>
    <div class="restrict-dates-ending-date"></div>
  </div>
  <div style="display: flex">
    <div class="restrict-created-method-checkbox"></div>
    <div class="restrict-created-methods"></div>
  </div>
</div>
<% } %>
<% if (displayActiveDisputes || displayResultsCount || displaySort) { %>
<div class="sort-results-row">
  <div class="sort-results-row-sorts">
    <% if (displaySort) { %>
    <div class="sort-results-check-box"></div>
    <div class="sort-by"></div>
    <div class="sort-type"></div>
    <% } %>
  </div>
  <div>
    <% if (displayActiveDisputes) { %>
      <div class="include-active-disputes"></div>
      <% } %>
  </div>
  <div class="sort-results-row-active-count <%= resultsCountCss ? resultsCountCss : '' %>">
    <% if (displayResultsCount) { %>
    <div class="initial-results-title"><%= displayedResultsTitle %></div>
    <div class="initial-results"></div>
    <% } %>
  </div>
</div>
<% } %>
<% if (displayStatuses) { %>
<div class="restrict-status-row">
  <div class="restrict-status-check-box"></div>
  <div class="search-option-status"></div>
</div>
<% } %>
<% if (displayCmsStatuses) { %>
<div class="restrict-status-row">
  <div class="restrict-cms-status-check-box"></div>
  <div class="search-option-cms-status"></div>
</div>
<% } %>
