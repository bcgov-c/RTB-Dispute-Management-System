
<div class="rtb-editable-component-viewstate <%= state !== 'view' || $.trim(view_value)==="" ? 'hidden-item' : '' %> ">
  <% if (label) { %>
  <div class="rtb-editable-component-label">
    <label class=""><%= label %>:</label>
  </div>
  <% } %>
  <div class="rtb-editable-component-value">
    <div class="<%= view_class %>"><%= view_value %></div>
  </div>
</div>
<div class="rtb-editable-component-editstate 
    <%= state === 'edit' ? '' : 'hidden-item' %> <%= is_disabled ? 'disabled' : '' %>"></div>
