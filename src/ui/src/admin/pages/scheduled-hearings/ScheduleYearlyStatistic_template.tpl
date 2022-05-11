<div class="schedule-calendar-info-text-and-color-container">
  <div class="schedule-calendar-info-text">
    <% var yearPercentage = yearHearings > 0 ? (yearAssigned * 100) / yearHearings : 0; %>
    Year Allocation: <span class=""><%= yearAssigned %>/<%= yearHearings %> - <%= Number(yearPercentage).toFixed(1) %>%</span>
  </div>
  <!-- Hide Unused / Still Available counts for R1 because they do not take current month/time into account
  <div class="schedule-calendar-info-text">
    Unused: <span class=""><%= yearUnused %></span>
  </div>
  <div class="schedule-calendar-info-text">
    Still Available: <span class=""><%= yearAvailability %></span>
  </div>
  -->
</div>
