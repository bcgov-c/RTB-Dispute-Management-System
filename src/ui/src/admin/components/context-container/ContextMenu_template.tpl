
<div class="context-menu-actions">
  <% if (menu_title) { %>
    <p class="context-menu-item context-menu-name"><%= menu_title %></p>
  <% } %>
  <% _.escape.each(menu_options, function(option) { %>
    <p
      class="context-menu-item context-menu-action-item <%= option.event ? 'context-menu-action-item--clickable' : '' %>"
      data-event="<%= option.event %>"><%= option.name %>
    </p>
  <% }) %>
  <% if (help_fn) { %>
    <p class="context-menu-item context-menu-help"></p>
  <% } %>
</div>

<% if (model && (createdDate || modifiedDate)) { %>
<div class="context-menu-dates">
  <% if (createdDate) { %>
    <span class="">Created <%= Formatter.toDateDisplay(createdDate) %>&nbsp;-&nbsp;<%= Formatter.toUserDisplay(createdBy) %></span>
  <% } %>
  <% if (modifiedDate) { %>
    <% if (createdDate) { %>
      <span>|</span>
    <% } %>
    <span class="">Modified <%= Formatter.toDateDisplay(modifiedDate) %>&nbsp;-&nbsp;<%= Formatter.toUserDisplay(modifiedBy) %></span>
  <% } %>
</div>
<% } %>
