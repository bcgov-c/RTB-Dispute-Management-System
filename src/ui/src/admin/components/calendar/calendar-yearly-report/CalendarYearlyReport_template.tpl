
<div class="schedule-calendar-grid-container">
  <div class="schedule-calendar-grid-time-wrapper">
    <% counter = 0 %>
    <% for(x=0; x < numberOfYearRow; x++) { %>
    <div class="schedule-yearly-calendar-grid-time-flex  <%= (x>0) ? 'no-top-border' : '' %>">
      <ul class="schedule-yearly-calendar-grid-time-ul">
        <% for(i=0; i < 4; i++) { %>
        <% var currentMonthCell = counter + 1; %>
        <% var isOnCurrentMonthCell = currentMonthCell == currentMonth; %>
        <% var isOnFutureMonthCell = isOnFutureYear || (isOnCurrentYear && currentMonthCell > currentMonth); %>

        <li class="schedule-yearly-calendar-grid-time-item <%= isOnCurrentYear && isOnCurrentMonthCell ? 'schedule-calendar-grid-time-item--border' : '' %> <%= (i==3) ? 'no-right-border' : '' %>" id="<%= String(i*x)%>">
          <div class="schedule-yearly-calendar-header-time-item schedule-yearly-calendar-header" data-month="<%= currentMonthCell %>"><span class="schedule-calendar-header-time-item-container"><%= headerLabel[counter] %></span></div>

          <% if (monthBreakDownData && monthBreakDownData.length > 0) { %>
            <% var event = monthBreakDownData[counter]; %>

            <% if (event && event.month_details && event.month_details.length > 0) {%>
              <% _.escape.each(event.month_details, function(dayDetail) { %>
                <% var hearingPriority = dayDetail.hearing_priority; %>
                <% var hearings = dayDetail.hearings; %>
                <% var assigned = dayDetail.assigned; %>
                <% var unassigned = dayDetail.unassigned; %>
                <% var hearingPercentage = hearings != 0 ? ((assigned * 100) / hearings) : 0; %>
                <% var hearingPercentageText = hearingPercentage > 0 ? hearingPercentage.toFixed(1) + '%' : (hearingPercentage == 0 && hearings != 0) ? '0%' : ''; %>
                <% var unassignedText = (hearingPercentage < 100 && unassigned > 0) ? ' - ' + unassigned : ''; %>
                <% var eventCssClassPrefix = 'schedule-calendar-grid-event-bg' + hearingPriority; %>
                <% var textCssClassPrefix = 'schedule-calendar-grid-event-text' + hearingPriority; %>
                <% var eventCssClass = (hearingPercentage > 0 && hearingPercentage < 100) ? eventCssClassPrefix + '--light' : hearingPercentage == 100 ? eventCssClassPrefix + '--dark' : eventCssClassPrefix + '--none'; %>
                <% var textCssClass = (hearingPercentage < 100) ? textCssClassPrefix + '--light' : textCssClassPrefix + '--dark'; %>
                <% var eventBarWidth = (hearingPercentage > 0 && hearingPercentage < 100) ? hearingPercentage : 100; %>

                <div class="schedule-yearly-calendar-grid-event-container <%= (isOnCurrentMonthCell && isOnCurrentYear) ? 'currentMonthPadding' : '' %>">
                  <div class="schedule-calendar-grid-event <%= eventCssClass %>" style="width: <%= eventBarWidth %>%;"></div>
                  <span class="schedule-calendar-grid-event-text <%= textCssClass %>"><%= hearingPercentageText %><%= unassignedText %></span>
                </div>
              <% }); %>
            <% } %>

            <div class="schedule-calendar-info-text-and-color-container schedule-calendar-info-container--inline">
              <div class="schedule-calendar-info-text">
                <% var monthHearings = event.month_hearings || 0; %>
                <% var monthAssigned = event.month_assigned || 0; %>
                <% var monthUnassigned = event.month_unassigned || 0; %>
                <% var monthPercentage = monthHearings > 0 ? (monthAssigned * 100) / monthHearings : 0; %>
                <% var monthUnassignedText = (isOnCurrentYear && isOnCurrentMonthCell) ? '--' : (isOnFutureMonthCell ? '0' : monthUnassigned) ; %>
                <% var monthAvailabilityText = (isOnCurrentYear && isOnCurrentMonthCell) ? '--' : (isOnFutureMonthCell ? monthUnassigned : '0') ; %>

                <span class=""><%= monthAssigned %>/<%= monthHearings %> - <%= Number(monthPercentage).toFixed(1) %>%</span>
              </div>
              <div class="schedule-calendar-info-text">
                Unused: <span class=""><%= monthUnassignedText %></span>
              </div>
              <div class="schedule-calendar-info-text">
                Still Available: <span class=""><%= monthAvailabilityText %></span>
              </div>
            </div>

          <% } %>
        </li>
        <% counter = counter + 1 %>
        <% } %>
      </ul>
    </div>
    <% } %>
</div>
