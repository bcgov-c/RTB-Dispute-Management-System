<div class="schedule-calendar-info"></div>
<span class="schedule-calendar-year-text visible-print"><b>Year: </b>&nbsp;<%= year %></span>
<span class="schedule-calendar-month-text visible-print"><b>Month: </b>&nbsp;<%= month %></span>
<div class="schedule-calendar-year-month-dropdown-container">
  <div class="schedule-calendar-previous general-link">
    <span>Prev</span>
    <img src="<%= require('../../static/Icon_Admin_Prev.png') %>" class="schedule-calendar-prev-image" alt="Move Previous" />
  </div>
  <div class="schedule-calendar-year hidden-print"></div>
  <div class="schedule-calendar-month hidden-print"></div>
  <div class="schedule-calendar-next general-link">
    <img src="<%= require('../../static/Icon_Admin_Next.png') %>" class="schedule-calendar-next-image" alt="Move Next" />
    <span>Next</span>
  </div>

  <div class="schedule-calendar-legend-container"></div>

</div>

<div class="monthly-schedule-calendar-container"></div>
