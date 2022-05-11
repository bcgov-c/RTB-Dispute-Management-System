<div class="calendar-grid-link-menu-icon <%= _.escape.isEmpty(linkMenuOptions) ? 'hidden' : '' %>">
  <div class="calendar-link-img"></div>
</div>

<div class="calendar-grid-link-floating-menu hidden">
  <% _.escape.each(linkMenuOptions, function(menuOption, index) { %>
    <% var isDmsFile = menuOption.disputeHearing && !menuOption.disputeHearing.isExternal() %>
    <div class="calendar-grid-link-menu-item <%= isDmsFile ? 'clickable' : '' %>" data-index="<%= index %>"> <%= menuOption.menuLabel %> </div>
  <% }) %>
</div>
