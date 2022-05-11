<div class="history-status-edit-container <%= isCurrentProcess ? '' : 'process-group-process-previous' %>"></div>
<div class="status-stats-container">
  <div class="status-stats-row">
    <div class="stat-column generic-label history-page-icon history-icon-last-status">Time since last status: <span class="generic-attribute"> <%= timeSinceLastChange %></span></div>
    <div class="stat-column generic-label history-page-icon history-icon-application">Application in Progress: <span class="generic-attribute"> <%= appInProgressDuration %></span></div>
    <div class="stat-column generic-label history-page-icon history-icon-screening">Application Screening: <span class="generic-attribute"> <%= appScreeningDuration %></span></div>
    <div class="stat-column generic-label history-page-icon history-icon-serving">Serving Documents: <span class="generic-attribute"> <%= servingDocumentsDuration %></span></div>
  </div>

  <div class="status-stats-row">
    <div class="stat-column generic-label history-page-icon history-icon-all-stages">All Stages: <span class="generic-attribute"> <%= totalDuration %></span></div>
    <div class="stat-column generic-label history-page-icon history-icon-pending">Hearing Pending: <span class="generic-attribute"> <%= hearingPendingDuration %></span></div>
    <div class="stat-column generic-label history-page-icon history-icon-hearing">Hearing: <span class="generic-attribute"> <%= hearingDuration %></span></div>
    <div class="stat-column generic-label history-page-icon history-icon-decision">Decision and Post Support: <span class="generic-attribute"> <%= decisionAndPostSupportDuration %></span></div>
  </div>
</div>
  
<div class="status-list-container"></div>