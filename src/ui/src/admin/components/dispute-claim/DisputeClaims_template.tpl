
<div class="page-section-title-container">
  <div class="claim-title-container clearfix">
    <span class="page-section-title"><%= headerHtml %></span>
    <div class="claim-title-controls">
      <div class="claim-add-singleton-issue-container">
        <% _.escape.each(singletonIssues, function(issueModel) { %>
          <span class="claim-add-singleton-issue-text hidden-item"
            tabindex="-1"
            data-toggle="popover"
            data-container="body"
            data-trigger="hover"
            title="<%= issueModel.getClaimCodeReadable() %>"
            data-placement="left"
            data-content="<%= issueModel.getClaimTitle() %>"
            data-code="<%= issueModel.getClaimCode() %>">+<%= issueModel.getClaimCodeReadable() %></span>
        <% }) %>
      </div>
      <% if (enableCollapse) { %>
        <span class="dispute-section-title-add collapse-icon <%= isCollapsed ? 'collapsed' : '' %>"></span>
      <% } %>
    </div>
  </div>
  <p class="visible-print print-filter-text"><%= printFilterText %></p>
  <div class="dispute-overview-claims-info clearfix">
    <span class="dispute-overview-claims-total">Requested:&nbsp;<span><%= Formatter.toAmountDisplay(totalRequestedAmount) %></span></span>
    <span class="dispute-overview-claims-total <%= disputeIsMigrated ? 'hidden' : '' %>">Granted (<%= grantedNumDisplayString %>):&nbsp;<span><%= grantedDisplayString %></span></span>
  
    <div class="dispute-overview-claim-add-icon-container">
      <% if (showAddButton) { %>
        <span class="dispute-section-title-add claim-add-icon"><%= addButtonDisplay %></span>
      <% } %>
      <% if (showAriDashboardButton) { %>
        <span class="dispute-section-title-add claim-ari-dashboard-btn">RI Dashboard</span>
      <% } %>
      <% if (showPermitsDashboardButton) { %>
        <span class="dispute-section-title-add claim-permits-dashboard-btn">Permit List</span>
      <% } %>
    </div>

    <div class="dispute-overview-claims-tools-buttons hidden-print <%= isEmpty ? 'hidden' : '' %>">
      <div class="dispute-overview-claims-thumbnails"></div>
      <% if (showHearingTools) { %>
        <div class="dispute-overview-claims-hearing-tools"></div>
      <% } %>
      <div class="dispute-overview-claims-show-evidence"></div>
    </div>
  </div>
</div>

<div class="dispute-overview-claims"></div>
