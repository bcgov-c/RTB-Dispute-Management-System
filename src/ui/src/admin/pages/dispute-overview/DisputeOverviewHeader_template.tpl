<div class="dispute-overview-header-left-container hidden-print">
  <div class="dispute-overview-header-item dispute-overview-header-hearing">
    <div class="dispute-overview-header-icon header-hearing-icon"></div>
    <span>Hearings</span>
  </div>
  <b class="dispute-overview-header-border"></b>
  <div class="dispute-overview-header-item dispute-overview-header-notice">
    <div class="dispute-overview-header-icon header-notice-icon"></div>
    <span>Notice</span>
  </div>
  <b class="dispute-overview-header-border"></b>
  <div class="dispute-overview-header-item dispute-overview-header-documents">
    <div class="dispute-overview-header-icon header-documents-icon"></div>
    <span>Documents</span>
  </div>
  <b class="dispute-overview-header-border"></b>
  <div class="dispute-overview-header-item dispute-overview-header-tasks">
    <div class="dispute-overview-header-icon header-tasks-icon"></div>
    <span class="dispute-overview-header-item-badge"><%= numOpenDisputeTasks %></span>
    <span>Tasks</span> 
  </div>
  <b class="dispute-overview-header-border"></b>
  <div class="dispute-overview-header-item dispute-overview-header-comms">
    <div class="dispute-overview-header-icon header-comms-icon"></div>
    <% if (numGeneralNotes) print('<span class="dispute-overview-header-item-badge"></span>') %>
    <span>Communications</span>
  </div>
  <b class="dispute-overview-header-border"></b>
  <div class="dispute-overview-header-item dispute-overview-header-history">
    <div class="dispute-overview-header-icon header-history-icon"></div>
    <span>History</span>
  </div>
  <b class="dispute-overview-header-border"></b>
  <div class="dispute-overview-header-item dispute-overview-header-payment">
    <div class="dispute-overview-header-icon header-payment-icon"></div>
    <span>Payments</span>
  </div>
</div>

<div class="dispute-overview-header-right-container">
  <div class="dispute-overview-header-right">
    <div class="dispute-overview-refresh-item">
      <div class="dispute-overview-header-icon header-completeness-icon hidden-print"></div>
      <% if (enableQuickAccess) { %>
        <div class="dispute-overview-header-icon header-quickaccess-icon hidden-print"></div>
      <% } %>
      <div class="dispute-overview-header-icon header-refresh-icon hidden-print"></div>
    </div>
    <div class="dispute-overview-header-icon header-print-icon hidden-print"></div>
  </div>
  <div class="dispute-overview-header-icon header-close-icon-lg hidden-print"></div>
</div>