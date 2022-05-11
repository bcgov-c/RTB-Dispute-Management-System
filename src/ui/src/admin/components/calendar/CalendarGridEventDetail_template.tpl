<div class="today-calendar-event-text">
  <span class="today-calendar-event-moderatorcode"><%= moderatorCode %><%= webPortalLogin ? '-' + webPortalLogin : '' %></span>
</div>
<% if (hasDisputeHearings) { %>
  <div class="today-calendar-event-link general-link hidden-print">
    <span class="today-calendar-event-openfile-icon"></span>
    Open File(s)
  </div>
<% } %>