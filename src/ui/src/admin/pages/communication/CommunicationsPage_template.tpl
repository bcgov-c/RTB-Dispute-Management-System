<div class="print-header"></div>

<div class="header-page-title-container">

  <div class="header-page-title header-page-title-with-icon">Communications</div>

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
  <div id="comm-notes" class=""></div>
  <div id="comm-drafts" class=""></div>
  <div id="comm-pickups" class=""></div>
  <div id="comm-emails" class=""></div>
  <div id="comm-receipts" class=""></div>
</div>