<div class="row">

  <div class="calendar-header-container">

    <div class="calendar-header-label-column">
      <div class="calendar-header-label-container">
        <span class="calendar-header-label"><%= headerLabel %></span>
        <span class="calendar-header-label--right hidden-print"><%= initialHour-1 %>:00</span>
        <span class="calendar-header-label--right visible-print"><%= printableColumns && printableColumns.length ? initialHour + Number(printableColumns[0]) - 1: 8 %>:00</span>
      </div>
    </div>

    <div class="calendar-header-time-column">
      <div class="calendar-header-time-wrapper">
        <div class="calendar-header-time-flex">
          <ul class="calendar-header-time-ul">
            <% _.escape.each(headerLabelData, function(labelData, labelIndex) { %>
              <% var isColPrintable = printableColumns && printableColumns.indexOf(labelIndex) !== -1 %>
              <li class="calendar-header-time-item <%= isColPrintable ? '' : 'hidden-print' %>"><span class="calendar-header-time-item-container"><%= labelData %></span></li>
            <% }); %>
          </ul>
        </div>
      </div>
    </div>

  </div>

  <div class="calender-grid-container">

    <div class="calendar-grid-label-column scroll">
      <% _.escape.each(eventLabel, function(eventLabelData, labelIndex) { %>
        <% eventLabelData = eventLabelData || {}; %>
        <% var isToday = (todayWeekday === (labelIndex + 1).toString()); %>
        <% if (todayIndicator && isCurrentMonth && isCurrentYear && isToday) { %>
        <div class="calendar-grid-time-header-item--border no-right-border"></div>
        <% } %>
        <div class="calendar-grid-label-item <%= eventLabelData.cssClass || '' %>"><span><%= eventLabelData.text %></span></div>
      <% }); %>
    </div>

    <div class="calendar-grid-event-column">
      <div class="calendar-grid-time-wrapper">
        <% _.escape.each(eventData, function(rowData, rowEventIndex) { %>
        <% var isLowerRow = rowEventIndex > numLowerRows && rowEventIndex > (eventData.length - numLowerRows) %>
        <% var isToday = (todayWeekday === (rowEventIndex + 1).toString()); %>
        <% if (todayIndicator && isCurrentMonth && isCurrentYear && isToday) { %>
        <div class="calendar-grid-time-item--border no-left-border"></div>
        <% } %>

        <div class="calendar-grid-time-flex <%= isLowerRow ? 'lower-row' : '' %>">
          <ul class="calendar-grid-time-ul">
            <% _.escape.each(headerLabelData, function(labelData, labelIndex) { %>
            <% var currentCellId = String(labelIndex)+String(rowEventIndex) %>
            <% var blockData = rowData.getBlockData(labelIndex, rowEventIndex) || {} %>
            <% var isColPrintable = printableColumns && printableColumns.indexOf(labelIndex) !== -1 %>
            <li id="cell-<%= currentCellId %>" class="calendar-grid-time-item <%= (labelIndex === 0) ? 'no-left-border' : (labelIndex === borderCol) ? 'double-left-border' : ''
              %> <%= blockData && !blockData.startMinutes && !blockData.endMinutes ? blockData.class : '' %> <%= isColPrintable ? '' : 'hidden-print' %>">
                <span>&nbsp;</span>
                <% if (rowData.events && rowData.events.length > 0) {%>
                  <% _.escape.each(rowData.events, function(event) { %>
                    <% if (event.positionId === currentCellId) { %>
                      <div class="calendar-grid-event-container <%= (todayIndicator && isCurrentMonth && isCurrentYear && isToday) ? 'calendar-grid-event-container--today' : '' %>"
                        data-position-id="<%= event.positionId %>"
                        data-hearing-id="<%= event.hearingId %>">
                      </div>
                    <% } %>
                  <% }); %>
                <% } %>
                
                <% if (blockData && blockData.startMinutes) { %>
                  <div class="calendar-grid-time-item--block-start-offset <%= blockData.class %>"></div>
                <% } %>
                <% if (blockData && blockData.endMinutes) { %>
                  <div class="calendar-grid-time-item--block-end-offset <%= blockData.class %>"></div>
                <% } %>
            </li>
            <% }); %>
          </ul>
        </div>
        <% }); %>
      </div>
    </div>

  </div>

</div>

