
<div class="print-header"></div>

<div class="header-page-title-container">
  <div class="header-page-title header-page-title-with-icon">Hearings</div>
  <div class="<%= isLoaded ? '': 'hidden' %> subpage-header-action-container goto-notice-btn-container">
    <div class="subpage-header-action-icon header-notice-icon">Dispute Notice</div>
  </div>

  <% if (isLoaded && isSchedulerUser) { %>
    <div class="subpage-header-action-container add-hearing-btn-container">
      <div class="subpage-header-action-icon hearing-page-add-header-icon">Add New Hearing</div>
    </div>
    <div class="subpage-header-action-container goto-schedule-history-btn-container">
      <div class="subpage-header-action-icon header-hearing-icon">History</div>
    </div>
  <% } %>

  <div class="<%= isLoaded && showNoticeGeneration ? '' : 'hidden' %> subpage-header-action-container generate-hearing-btn-container">
    <div class="subpage-header-action-icon header-hearing-notice-icon">Generate Hearing Notice</div>
  </div>

  <div class="<%= isLoaded && showHearingTools ? '' : 'hidden' %> subpage-header-action-container">
    <div class="dispute-overview-claims-hearing-tools"></div>
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
  <div id="hearings-list" class=""></div>
    <% if (hasUnlinkedRecordings) { %>
      <div class="hearing-unlinked-recordings">
        <div class="hearing-unlinked-recordings-header"><b>Unmatched Hearing Recordings</b></div>
        <div class="hearing-unlinked-recording-files"></div>
      </div>
    <% } %>
</div>

