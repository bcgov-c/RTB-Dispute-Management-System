<div class="user-active-column">
  <span class="user-is-active-checkbox"></span>
</div>
<div class="user-id-column"><%= user_id %></div>
<div class="name-column"><%= name %></div>
<div class="rolegroup-column"><%= roleGroup %></div>
<div class="roletype-column"><%= roletype %></div>
<div class="managedby-column"><%= managedBy %></div>

<div class="user-admin-column text-center">
  <% if (user_admin) { %>
    <span class="success-green">Yes</span>
  <% } else  { %>
    <span class="error-red">No</span>
  <% } %>
</div>
<div class="user-scheduler-column">
  <% if (scheduler) { %>
    <span class="success-green"><%= scheduler %></span>
  <% } else  { %>
    <span class="error-red">No</span>
  <% } %>
</div>
<div class="created-date-column"><%= Formatter.toDateAndTimeDisplay(created_date) %></div>
<div class="edit-link-column"><a href="" class="view-edit-link">Edit</a></div>
