<div class="print-header"></div>

<div class="header-page-title-container">

  <div class="dashboard-schedule header-page-title header-page-title-with-icon">Schedule</div>

  <div class="subpage dispute-overview-header-right-container">
    <div class="dispute-overview-header-right">
      <div class="dispute-overview-refresh-item">
        <span class="dispute-overview-refresh-text"></span>
        <div class="dispute-overview-header-icon header-refresh-icon"></div>
      </div>
      <div class="dispute-overview-header-icon header-print-icon"></div>
    </div>
  </div>
</div>

<div class="schedule-page-top-bar-container <%= isHistory ? 'schedule-page-history-mode' : '' %>">
  <div class="schedule-type-filter-text">Calendar Views:</div>
  <span class="visible-print schedule-type-filter-print"><%= scheduleType %><%= scheduleUser %></span>
  <div class="schedule-type-filter hidden-print"></div>
  <div class="schedule-calendar-arbitrator hidden-print <%= isPersonal ? '' : 'hidden-item' %>"></div>
  <div class="schedule-inactive-filter <%= isPersonal || isDaily ? '' : 'hidden-item' %>"></div>

  <div class="schedule-add-hearing-btn <%= isDaily || isPersonal ? '' : 'hidden-item' %>">Add Hearing</div>
  <div class="schedule-import-btn <%= isYearly ? '' : 'hidden-item' %>">Import Schedule</div>
  <div class="schedule-bulk-move-hearing hidden-print <%= isDaily || isPersonal ? '' : 'hidden-item' %>">Bulk Move Hearings</div>
</div>

<div class="schedule-page-sub-view"></div>
