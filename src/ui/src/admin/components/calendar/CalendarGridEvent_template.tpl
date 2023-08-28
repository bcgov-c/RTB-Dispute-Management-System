<div class="calendar-grid-event <%= cssClass %>" style="left: <%= startXPosition %>px; width: <%= eventBarWidth %>px;">
  <div class="calendar-grid-link-menu"></div>
  <% if (isReserved) { %>
    <img class="calendar-grid-hold-img" src="<%= HearingHoldIcon %>" />
    <% if (onHoldFileNumber) { %>
      <span class="calendar-on-hold-filenumber <%= onHoldFileNumber ? 'clickable' : '' %>" title="<%= onHoldFileNumber %>"><%= onHoldFileNumber %></span>
    <% } %>
  <% } else { %>
  <span class="calendar-grid-event-text <%= hasDisputeGuid ? 'clickable' : '' %>" title="<%= text %>"><%= text %></span>
  <% } %>
  <div class="calendar-grid-event-menu"></div>
</div>

<div class="today-calendar-event-detail" style="left: <%= startXPosition %>px; width: <%= eventBarWidth %>px;"></div>
