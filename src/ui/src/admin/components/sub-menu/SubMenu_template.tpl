
<div class="sub-menu-actions">
  <% if (display_name) { %>
    <p class="sub-menu-item sub-menu-name"><%= display_name %></p>
  <% } %>

  <% _.escape.each(menu_options, function(option) { %>
    <p class="sub-menu-item sub-menu-action-item" data-event="<%= option.event %>"><%= option.name %></p>
  <% }) %>
</div>

<% if (model && (model.get('created_date') || model.get('modified_date'))) { %>
<div class="sub-menu-dates">
  <% if (model.get('created_date')) { %>
    <span class="">Created <%= Formatter.toDateDisplay(model.get('created_date')) %>&nbsp;-&nbsp;<%= Formatter.toUserDisplay(model.get('created_by')) %></span>
  <% } %>
  <% if (model.get('modified_date')) { %>
    <% if (model.get('created_date')) { %>
      <span>|</span>
    <% } %>
    <span class="">Modified <%= Formatter.toDateDisplay(model.get('modified_date')) %>&nbsp;-&nbsp;<%= Formatter.toUserDisplay(model.get('modified_by')) %></span>
  <% } %>
</div>
<% } %>
