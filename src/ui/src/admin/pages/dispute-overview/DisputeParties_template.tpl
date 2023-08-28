
<div class="page-section-title-container">
  <span class="page-section-title"><%= headerHtml %></span>
  
  <% if (enableCollapse) { %>
    <span class="dispute-section-title-add collapse-icon <%= isCollapsed ? 'collapsed' : '' %>"></span>
  <% } %>
  <% if (showAddButton) { %>
    <span class="dispute-section-title-add participant-add-icon"><%= addButtonDisplay %></span>
  <% } %>
</div>
<div class="dispute-overview-parties"></div>
