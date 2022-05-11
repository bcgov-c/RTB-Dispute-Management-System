<div class="schedule-calendar-legend-text-and-color-container">

    <% if (eventDetails && eventDetails.length > 0) { %>
      <% _.escape.each(eventDetails, function(item) { %>
        <% var hearings = item.hearings; %>
        <% var priority = item.hearing_priority; %>
        <% var assigned = item.assigned; %>
        <% var unassigned = item.unassigned; %>
        <% var hearingPercentage = hearings > 0 ? (assigned * 100) / hearings : 0; %>
        <% var lengendBarWidth = hearingPercentage > 0 ? hearingPercentage : 0; %>
        <div class="schedule-calendar-legend-wrapper">
          <div class="schedule-calendar-legend-info schedule-calendar-legend<%= priority %>-text"><%= assigned %>/<%= hearings %> - <%= Number(hearingPercentage).toFixed(1) %>%</div>
          <div class="schedule-calendar-legend-box">
            <div class="schedule-calendar-legend-text schedule-calendar-legend<%= priority %>-text"><%= priorityText[priority-1] %></div>
            <div class="schedule-calendar-legend<%= priority %>">
              <div class="schedule-calendar-legend-data schedule-calendar-grid-event-bg<%= priority %>--dark" style="width: <%= lengendBarWidth %>%"></div>
            </div>
          </div>
        </div>
      <% }) %>
    <% } %>
</div>
