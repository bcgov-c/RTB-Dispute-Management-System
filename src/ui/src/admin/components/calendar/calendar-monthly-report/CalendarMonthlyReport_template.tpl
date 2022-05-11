<div class="row">

  <div class="schedule-calendar-header-container">
    <div class="schedule-calendar-header-time-wrapper">
      <div class="schedule-calendar-header-time-flex">
        <ul class="schedule-calendar-header-time-ul">
          <% _.escape.each(headerLabel, function(labelData) { %>
          <li class="schedule-month-calendar-header-time-item"><span class="schedule-calendar-header-time-item-container"><%= labelData %></span></li>
          <% }); %>
        </ul>
      </div>
    </div>
  </div>

  <div class="schedule-calendar-grid-container">
    <div class="schedule-calendar-grid-time-wrapper">
      <% var counter = 1; %>
      <% for(row=1; row <= numberOfMonthRow; row++) { %>
      <div class="schedule-calendar-grid-time-flex">
        <ul class="schedule-calendar-grid-time-ul">
          <% for(col=1; col <= 7; col++) { %>
          <% var currentDateCell = (row * col); %>
          <% var position = (counter - weekNumberOfStartDay + 1); %>
          <% var isOnCurrentDateCell = (position == currentDate && isOnCurrentYear); %>
          <li class="schedule-calendar-grid-time-item <%= currentDate != 0 && isOnCurrentDateCell ? 'schedule-calendar-grid-time-item--border' : '' %>" id="<%= String(row)+String(col)%>">

            <% if (weekNumberOfStartDay <= counter && (counter - weekNumberOfStartDay) < numOfDayInCurrentMonth) {%>
              <span class="schedule-calendar-grid-day-text" data-day="<%= position %>"><%= position %></span>

              <% if (dayBreakDownData && dayBreakDownData.length > 0) {%>
                <% var event = dayBreakDownData[position-1]; %>
                <% if (event && !_.escape.isEmpty(event.day_details)) {%>
                  <% _.escape.each(event.day_details, function(dayDetail) { %>
                    <% var hearingPriority = dayDetail.hearing_priority; %>
                    <% var hearings = dayDetail.hearings; %>
                    <% var assigned = dayDetail.assigned; %>
                    <% var unassigned = dayDetail.unassigned; %>
                    <% var hearingPercentage = hearings != 0 ? ((assigned * 100) / hearings) : 0; %>
                    <% var hearingPercentageText = hearingPercentage > 0 ? hearingPercentage.toFixed(1) + '%' : (hearingPercentage == 0 && hearings != 0) ? '0%' : ''; %>
                    <% var unassignedText = (hearingPercentage < 100 && unassigned > 0) ? ' - ' + unassigned : ''; %>
                    <% var displayText = String(hearingPercentageText)+String(unassignedText); %>
                    <% displayText = displayText === '' && _.escape.any(event.day_details, function(dayDetail) { return dayDetail.hearings; }) ? '<i>no hearings</i>' : displayText; %>
                    <% var eventCssClassPrefix = 'schedule-calendar-grid-event-bg' + hearingPriority; %>
                    <% var textCssClassPrefix = 'schedule-calendar-grid-event-text' + hearingPriority; %>
                    <% var eventCssClass = (hearingPercentage > 0 && hearingPercentage < 100) ? eventCssClassPrefix + '--light' : hearingPercentage == 100 ? eventCssClassPrefix + '--dark' : eventCssClassPrefix + '--none'; %>
                    <% var textCssClass = (hearingPercentage < 100) ? textCssClassPrefix + '--light' : textCssClassPrefix + '--dark'; %>
                    <% var eventBarWidth = (hearingPercentage > 0 && hearingPercentage < 100) ? hearingPercentage : 100; %>

                    <div class="schedule-calendar-grid-event-container">
                      <div class="schedule-calendar-grid-event <%= eventCssClass %>" style="width: <%= eventBarWidth %>%;"></div>
                      <span class="schedule-calendar-grid-event-text <%= textCssClass %>"><%= displayText %></span>
                    </div>
                  <% }); %>
                <% } %>
              <% } %>
            <% } %>
            <% counter++; %>
          </li>
          <% } %>
        </ul>
      </div>
      <% } %>
    </div>
  </div>

</div>

