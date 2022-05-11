<div class="block-calendar-content row">

  <div class="calendar-header-container">

    <div class="calendar-header-label-column">
      <div class="calendar-header-label-container">
        <span class="calendar-header-label"><%= headerLabel %></span>
        <span class="calendar-header-label--right"></span>
        
        <div class="calendar-header-userinfo-label">
          <span class="calendar-header-userinfo-emergency">*emergency</span>
          <span class="calendar-header-userinfo-duty">*duty</span>
        </div>
      </div>
    </div>

    <div class="calendar-header-time-column">
      <div class="calendar-header-time-wrapper">
        <div class="calendar-header-time-flex">
          <ul class="calendar-header-time-ul">
            <% _.escape.each(headerLabelData, function(labelData, labelIndex) { %>
              <% var isToday = todayIndicator && todayDate.isSame( periodStartDate.clone().add(labelIndex, 'days'), 'day') %>
              <li class="calendar-header-time-item <%= isToday ? 'clearfix calendar-header-time-item--today' : '' %>">
                <div class="calendar-header-time-item-container">
                  <span class="general-link" data-date="<%= labelData.startDate %>"><%= labelData.dateDisplay %></span>
                </div>

              <% if (showReporting) { %>
                <div class="block-calendar__header-report-column"><%= labelData.colReportDisplayHtml || '' %></div>
              <% } %>
            </li>
            <% }); %>
          </ul>
          <% if (showReporting) { %>
            <div class="calendar-header-time-item block-calendar__report-column">
              <div class=""></div>
            </div>
          <% } %>
        </div>
      </div>
    </div>

  </div>

  <div class="calender-grid-container">

    <div class="calendar-grid-label-column">
      <% _.escape.each(eventLabel, function(eventLabelData, labelIndex) { %>
        <% eventLabelData = eventLabelData || {}; %>
        <div class="calendar-grid-label-item <%= eventLabelData.cssClass || '' %>">
          <span><%= eventLabelData.text %></span>
          <div class="block-calendar__user-buttons">
            <% if (eventLabelData.userRequest) { %>
              <div class="calendar-grid-label-item-btn block-calendar__user-requests clickable" data-request-ids="<%= eventLabelData.userRequest.ids %>" data-position-id="<%= labelIndex %>"
                tabindex="-1" data-toggle="popover" data-container=".block-calendar-content" data-trigger="focus" title="<%= eventLabelData.userRequest.title %>"
              ></div>
            <% } %>
            <% if (!disabled && !eventLabelData.disableEdits) { %>
              <div class="calendar-grid-label-item-btn block-calendar__add-block clickable" data-position-id="<%= labelIndex %>"></div>
            <% } %>
          </div>
        </div>
      <% }); %>
    </div>

    <div class="calendar-grid-event-column">
      <div class="calendar-grid-time-wrapper">
        <% _.escape.each(eventData, function(rowData, rowEventIndex) { %>
        <% var eventLabelData = eventLabel && eventLabel.length > rowEventIndex ? eventLabel[rowEventIndex] : null %>
        <div class="calendar-grid-time-flex <%= (eventLabelData||{}).disableEdits? '--disabled': '' %>">
          <ul class="calendar-grid-time-ul">
            <% _.escape.each(headerLabelData, function(labelData, labelIndex) { %>
            <% var isToday = todayIndicator && todayDate.isSame( periodStartDate.clone().add(labelIndex, 'days'), 'day') %>
            <li class="calendar-grid-time-item
              <%= isToday ? 'calendar-grid-time-item--today' : '' %> 
              <%= (labelIndex === 0 && !isToday) ? 'no-left-border' : (labelIndex === borderCol && !isToday) ? 'double-left-border' : '' %>" id="cell-<%= String(labelIndex)+'_'+String(rowEventIndex) %>"
            >
              <% var currentCellId = String(labelIndex)+"_"+String(rowEventIndex) %>
              <% if (enableDailyBlocks) { %>
                <div class="block-calendar__block-parent">
                  <div class="block-calendar__block"
                    data-arb-position-id="<%= rowEventIndex %>"
                    data-start-date="<%= labelData.startDate %>"
                    data-start-datetime="<%= labelData.blockOneStartDate %>"
                    data-end-datetime="<%= labelData.blockTwoStartDate %>"
                    data-position-id="<%= String(labelIndex)+'_'+String(rowEventIndex) %>_6">&nbsp;</div>
                  <div class="block-calendar__block"
                    data-arb-position-id="<%= rowEventIndex %>"
                    data-start-date="<%= labelData.startDate %>"
                    data-start-datetime="<%= labelData.blockTwoStartDate %>"
                    data-end-datetime="<%= labelData.blockThreeStartDate %>"
                    data-position-id="<%= String(labelIndex)+'_'+String(rowEventIndex) %>_9">&nbsp;</div>
                  <div class="block-calendar__block"
                    data-arb-position-id="<%= rowEventIndex %>"
                    data-start-date="<%= labelData.startDate %>"
                    data-start-datetime="<%= labelData.blockThreeStartDate %>"
                    data-end-datetime="<%= labelData.blockFourStartDate %>"
                    data-position-id="<%= String(labelIndex)+'_'+String(rowEventIndex) %>_12">&nbsp;</div>
                  <div class="block-calendar__block"
                    data-arb-position-id="<%= rowEventIndex %>"
                    data-start-date="<%= labelData.startDate %>"
                    data-start-datetime="<%= labelData.blockFourStartDate %>"
                    data-end-datetime="<%= labelData.blockFiveStartDate %>"
                    data-position-id="<%= String(labelIndex)+'_'+String(rowEventIndex) %>_15">&nbsp;</div>
                  <div class="block-calendar__block"
                    data-arb-position-id="<%= rowEventIndex %>"
                    data-start-date="<%= labelData.startDate %>"
                    data-start-datetime="<%= labelData.blockFiveStartDate %>"
                    data-end-datetime="<%= labelData.blockFiveEndDate %>"
                    data-position-id="<%= String(labelIndex)+'_'+String(rowEventIndex) %>_18">&nbsp;</div>
                </div>
              <% } %>
            </li>
            <% }); %>
          </ul>
          <% if (showReporting) { %>
            <div class="calendar-grid-time-item block-calendar__report-column">
              <div class=""><%= rowData.rowReportDisplayHtml || '' %></div>
            </div>
          <% } %>
        </div>
        <% }); %>
      </div>
    </div>
  </div>

  <% _.escape.each(eventData, function(rowData, rowEventIndex) { %>
    <% _.escape.each(rowData.events, function(event) { %>
      <div class="block-calendar__saved-block <%= event.cssClass %>"
        data-block-id="<%= event.blockId %>"
        data-owner-offset="<%= event.ownerOffset %>"
        ><%= event.description || '' %>
      </div>
    <% }); %>
  <% }); %>

</div>

