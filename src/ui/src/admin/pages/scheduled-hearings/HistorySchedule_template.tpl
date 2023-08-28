

<div class="history-schedule-container">
  <div class="history-schedule-view-type"></div>

  <div class="history-schedule-sub-container">
    <div class="history-schedule-sub-dispute <%= showDisputeInput ? '' : 'hidden' %>"></div>

    <div class="history-schedule-sub-hearing-info <%= showHearingInfo ? '' : 'hidden' %>">
      <div class="hearing-date-display-container <%= hearingStart && hearingEnd ? '' : 'hidden' %>">
        <div class="hearing-start-date-icon"></div>
        <span class="hearing-start-date-display">
          <%= Formatter.toShortWeekdayShortDateYearDisplay(hearingStart) %>
        </span>
        <div class="hearing-start-time-display-container">
          <div class="hearing-start-time-icon"></div>
          <span class="hearing-start-time-display">
            <%= Formatter.toTimeDisplay(hearingStart) %>
          </span>
          <span class="hearing-duration-display">
            (<%= Formatter.toDuration(hearingStart, hearingEnd) %>)
          </span>
        </div>
      </div>
      <div class="history-schedule-sub-hearing-info-text">Use the regular schedule views to locate a hearing and view its history</div>
    </div>

    <div class="history-schedule-sub-arbs <%= showArbInput ? '' : 'hidden' %>"></div>
    <div class="history-schedule-sub-schedulers <%= showSchedulerInput ? '' : 'hidden' %>"></div>
    <div class="history-schedule-sub-inactive-staff <%= showInactiveStaffInput ? '' : 'hidden' %>"></div>
    <div class="history-schedule-sub-date <%= showDateInput ? '' : 'hidden' %>"></div>

    <div class="history-schedule-search-button <%= showHearingInfo ? 'hidden' : '' %>"></div>
  </div>
</div>

<div class="">
  <div class="history-schedule-list-region"></div>
</div>
