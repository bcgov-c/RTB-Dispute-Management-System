<div class="schedule-calendar-info-text-and-color-container">
  <div class="schedule-calendar-info-text">
    <% var monthPercentage = monthHearings > 0 ? (monthAssigned * 100) / monthHearings : 0; %>
    Month Allocation: <span class=""><%= monthAssigned %>/<%= monthHearings %> - <%= monthPercentage.toFixed(1) %>%</span>
  </div>
  <!-- Hide Unused / Still Available counts for R1 because they do not take current month/time into account
  <div class="schedule-calendar-info-text">
    Unused: <span class=""><%= monthUnassigned %></span>
  </div>
  <div class="schedule-calendar-info-text">
    Still Available: <span class=""><%= monthAvailability %></span>
  </div>
  -->
</div>
