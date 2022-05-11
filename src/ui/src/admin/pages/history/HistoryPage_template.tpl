<div class="print-header"></div>

<div class="header-page-title-container">

  <div class="header-page-title header-page-title-with-icon">History</div>
  
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
  <div class="history-process-groups"></div>
</div>

<div class="<%= isLoaded ? '': 'hidden' %> audit-log-container">

  <div class="page-section-title-container">
    <div class="page-section-title">Change Logs</div>
  </div>

  <div class="audit-log-filter-section clearfix hidden-print">
    <div class="audit-filters"></div>
    <div class="include-error-box"></div>
  </div>

  <div class="visible-print audit-log-print-wrapper">
    <span class="print-filter-text"><b>Filter:</b>&nbsp;<%= printAuditFilterText %><%= printAuditIncludeErrorsSelected ? ' - Include Errors' : '' %></span>
  </div>

  <div class="audit-list-items-section"></div>

  <% if (shouldDisplayViewMore) { %>
    <div class="show-more-disputes hidden-print">Show more</div>
  <% } else if (hasAuditLogs) { %>
    <div class="all-disputes hidden-print">All results displayed</div>
  <% } %>
</div>