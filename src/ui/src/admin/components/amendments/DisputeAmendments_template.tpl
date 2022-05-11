<% if (enableTypeFilter) { %>
<div class="amendments-title-container--type">
  <div class="amendments-to-type-dropdown"></div>
  <div class="amendments-to-type-counts"><%= detailedTypeText %></div>
<% } else { %>
<div class="amendments-title-container page-section-title-container">
  <span class="page-section-title"><%= titleDisplay %></span>
<% } %>
  <div class="amendments-details-toggle hidden-print <%= amendmentsLength ? '' : 'hidden' %>"></div>
</div>
<div class="dispute-amendments-collection amendment-toggle-minimal"></div>
