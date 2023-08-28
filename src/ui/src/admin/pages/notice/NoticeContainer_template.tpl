
<div class="notice-container-title page-section-title-container">
  <span class="page-section-title"><%= containerTitle %></span>
  <% if (enableCollapse) { %>
    <span class="dispute-section-title-add collapse-icon <%= isCollapsed ? 'collapsed' : '' %>"></span>
  <% } %>
</div>
<div class="notice-container-notice"></div>
<div class="notice-container-amendment"></div>