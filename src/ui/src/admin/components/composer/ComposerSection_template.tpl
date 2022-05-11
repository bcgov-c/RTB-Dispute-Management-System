<div class="composer-section-title-container">
  <div class="composer-section-title"><%= title %></div>

  <div class="composer-section-links">
    <% _.escape.each(links, function(link, index) { %>
      <div data-index="<%= index %>" class="composer-section-link clickable <%= link.cssClass ? link.cssClass : '' %>">
        <%= link.text %>
      </div>
    <% }) %>
    <div class="composer-section-link-refresh clickable <%= hasRefresh ? '' : 'hidden' %>"></div>
  </div>
</div>

<div class="composer-section-content-container">

  <% if (isLoading) { %>
    Loading...
  <% } else { %>
    <div class="composer-section-content"><%= generatedContent %></div>
  <% } %>
</div>