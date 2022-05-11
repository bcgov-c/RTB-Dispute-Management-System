<div class="calendar-grid-event-menu-icon <%= _.escape.isEmpty(menuOptions) ? 'hidden' : '' %>">
  <div class="calendar-event-menu-img"></div>
</div>

<div class="calendar-grid-event-floating-menu hidden">
  <% _.escape.each(menuOptions, function(menuOption) { %>
  <div class="calendar-grid-event-menu-item <%= menuOption.cssClass || '' %>"
    data-event="<%= menuOption.event %>"
    data-menu-option-id="<%= menuOption.menuOptionId %>"
    > <%= menuOption.menuLabel %> </div>
  <% }) %>
</div>
