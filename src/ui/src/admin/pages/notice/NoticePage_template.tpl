<div class="print-header"></div>

<div class="header-page-title-container">

  <div class="header-page-title header-page-title-with-icon">Notice</div>

  <% if (showAddStandardButton) { %>
  <div class="<%= isLoaded ? '' : 'hidden' %> subpage-header-action-container add-notice-container">
    <div class="subpage-header-action-icon notice-standard-add-icon">Add Standard</div>
  </div>
  <% } %>
  <% if (showAddOtherButton) { %>
  <div class="<%= isLoaded ? '' : 'hidden' %> subpage-header-action-container add-other-notice-container">
    <div class="subpage-header-action-icon notice-other-add-icon">Add Other</div>
  </div>
  <% } %>
  <% if (showDownloadButton) { %>
  <div class="<%= isLoaded ? '' : 'hidden' %> subpage-header-action-container download-notice-container">
    <div class="subpage-header-action-icon notice-download-icon">Download Editable</div>
  </div>
  <% } %>

  <div class="<%= isLoaded && showHearingTools ? '' : 'hidden' %> subpage-header-action-container notice-hearing-tools-container">
    <div class="dispute-overview-claims-hearing-tools"></div>
  </div>

  <div class="<%= isLoaded && unlinkedAmendmentsLength ? '' : 'hidden' %> subpage-header-action-container notice-page-unlinked-amendments-summary">
    <span class="error-red"><%= unlinkedAmendmentsLength %> unlinked amendment<%= unlinkedAmendmentsLength === 1 ? '' : 's' %></span>
  </div>

  <div class="subpage dispute-overview-header-right-container">
    <div class="dispute-overview-header-right">
      <div class="dispute-overview-refresh-item">
        <span class="dispute-overview-refresh-text">
          <span class="hidden visible-print"><%= file_number %></span>
          <span><%= Formatter.toLastModifiedTimeDisplay(lastRefreshTime) %></span>
        </span>
        <div class="dispute-overview-header-icon header-completeness-icon hidden-print"></div>
        <% if (enableQuickAccess) { %>
          <div class="dispute-overview-header-icon header-quickaccess-icon hidden-print"></div>
        <% } %>
        <div class="dispute-overview-header-icon header-refresh-icon"></div>
      </div>
      <div class="dispute-overview-header-icon header-print-icon"></div>
      <div class="dispute-overview-header-icon header-close-icon"></div>
    </div>
  </div>
</div>

<div class="page-loading-message-container <%= isLoaded ? 'hidden': '' %>">
  Loading...
</div>
<div class="<%= isLoaded ? '': 'hidden' %>">
  <div class="dispute-flags"></div>
  <% if (printParticipantSubServices) { %>
    <div class="visible-print">
      <div class="notice-container-title page-section-title-container">
        <span class="page-section-title">Participants With Substituted Services</span>
      </div>
      <span class="notice-sub-service-print"><%= printParticipantSubServices %></span>
    </div>
  <% } %>
  <div id="notice-list-container"></div>
  <div id="amendment-list-container"></div>
</div>