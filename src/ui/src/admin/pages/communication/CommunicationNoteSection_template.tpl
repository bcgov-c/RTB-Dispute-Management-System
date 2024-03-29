<div class="page-section-title-container clearfix <%= isCollapsed ? 'collapsed' : '' %>">
  <div class="page-section-title">Notes</div>
  <% if (enableCollapse) { %>
    <span class="dispute-section-title-add collapse-icon <%= isCollapsed ? 'collapsed' : '' %>"></span>
  <% } %>
  <% if (!isCollapsed) { %>
    <span class="notes-filter visible-print"><%= selectedNoteFilter %></span>
    <div id="comm-add-note-btn" class="dispute-section-title-add">
      <span class="notes-add-icon"></span>
      <span class="notes-add-icon-text">Add General Note</span>
    </div>
  <% } %>
</div>

<% if (!isCollapsed) { %>
<div class="general-filters-row general-filters-row--wrap comm-section-filters-container comm-section-notes
  <%= length ? '' : 'hidden' %>">
  <div class="comm-note-type-filters"></div>
  <div class="comm-note-creator-filter"></div>
</div>
<% } %>

<div class="comm-note-section-add-container comm-note-edit-container">
  <div class="comm-note-section-add comm-note-edit-region"></div>
</div>

<div id="comm-notes-list"></div>
