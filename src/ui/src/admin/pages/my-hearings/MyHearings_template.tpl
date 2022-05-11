<div class="header-page-title-container">

  <div class="header-page-title header-page-title-with-icon">My Hearings</div>

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

<div class="general-filters-row general-filters-row--dark">
  <div class="my-hearings-calendar-myschedule">
    <span class="<%= isCurrentUserSelected ? 'hidden' : '' %> general-link">Show My Schedule</span>
    <span class="<%= isCurrentUserSelected ? '' : 'hidden' %>">My Schedule</span>
  </div>
  <div class="my-hearings-calendar-arbitrator"></div>
  <div class="my-hearing-inactive-filter"></div>

  <% if (showAddHearingButton) { %>
    <div class="schedule-add-hearing-btn">Add Hearing</div>
  <% } %>
</div>

<div class="my-hearings-today-calendar-container"></div>

<div class="schedule-calendar-year-month-dropdown-container">
  <div class="my-hearings-calendar-previous general-link">
    <span>Prev</span>
    <img src="<%= require('../../static/Icon_Admin_Prev.png') %>" class="my-hearing-calendar-prev-image" alt="Move Previous" />
  </div>
  <div class="my-hearings-calendar-year"></div>
  <div class="my-hearings-calendar-month"></div>
  <div class="my-hearings-calendar-next general-link">
    <img src="<%= require('../../static/Icon_Admin_Next.png') %>" class="my-hearing-calendar-next-image" alt="Move Next" />
    <span>Next</span>
  </div>

  <div class="calendar-legend"></div>

</div>

<div class="my-hearings-calendar-container"></div>
