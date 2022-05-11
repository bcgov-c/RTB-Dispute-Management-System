<div class="row">

  <div class="today-calendar-left-container">
    <div class="today-calendar-icon-container">
      <img src="<%= require('../../static/Icon_Admin_Today.png') %>" class="today-calendar-image" alt="Today" />
    </div>
    <span class="today-calendar-text">Today</span>
  </div>

  <div class="today-calendar-right-container">
    <div class="today-calendar-header-container">
      <div class="calendar-header-label-column">
        <div class="calendar-header-label-container">
          <span class="calendar-header-label">&nbsp;</span>
          <span class="calendar-header-label--right hidden-print"><%= initialHour - 1 %>:00</span>
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

    <div class="today-calendar-grid-container">

      <div class="calendar-grid-label-column scroll">
        <div class="today-calendar-grid-label-item"><span><%= headerLabel %></span></div>
      </div>

      <div class="calendar-grid-event-column">
        <div class="calendar-grid-time-wrapper">

        <% if (eventData && eventData.length > 0) { %>
          <% _.escape.each(eventData, function(rowData, rowEventIndex) { %>
            <div class="today-calendar-grid-time-flex">
              <ul class="today-calendar-grid-time-ul">
                <% _.escape.each(headerLabelData, function(labelData, labelIndex) { %>
                <% var currentCellId = String(labelIndex)+String(rowEventIndex) %>
                <% var blockData = rowData.getBlockData(labelIndex, rowEventIndex) || {} %>
                <% var isColPrintable = printableColumns && printableColumns.indexOf(labelIndex) !== -1 %>
                <li id="cell-<%= currentCellId %>" class="today-calendar-grid-time-item <%= (labelIndex === 0) ? 'no-left-border' : (labelIndex === borderCol) ? 'double-left-border' : '' %>
                  <%= blockData && !blockData.startMinutes && !blockData.endMinutes ? blockData.class : '' %> <%= isColPrintable ? '' : 'hidden-print' %>">

                  <% if (rowData.events && rowData.events.length > 0) {%>
                    <% _.escape.each(rowData.events, function(event) { %>

                      <% currentCellId = String(labelIndex)+'0' %>
                      <% if (event.positionId === currentCellId) { %>
                        <div class="today-calendar-grid-event-container"
                            data-hearing-id="<%= event.hearingId %>"
                            data-today="true"
                        ></div>
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
        <% } else { %>
          <% _.escape.each(headerLabelData, function(labelData, labelIndex) { %>
            <% var blockData = getBlockData(labelIndex) || {} %>
            <li id="cell-<%= String(labelIndex) %>" class="today-calendar-grid-time-item <%= (labelIndex === 0) ? 'no-left-border' : (labelIndex === borderCol) ? 'double-left-border' : '' %>
              <%= blockData && !blockData.startMinutes && !blockData.endMinutes ? blockData.class : '' %>">
              <% if (blockData && blockData.startMinutes) { %>
                <div class="calendar-grid-time-item--block-start-offset <%= blockData.class %>"></div>
              <% } %>
              <% if (blockData && blockData.endMinutes) { %>
                <div class="calendar-grid-time-item--block-end-offset <%= blockData.class %>"></div>
              <% } %>
              <span>&nbsp;</span>
            </li>
          <% }); %>
        <% } %>
        </div>
      </div>

    </div>
  </div>

</div>

