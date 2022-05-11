<div class="note-column">
  <div class="comm-note-content <%= isDecisionNote ? 'comm-note-content--decision' : '' %>">
    <div class="comm-note-edit-icon <%= mode !== 'edit' ? 'hidden' : '' %>"></div>
    <span><%= note %></span>
  </div>
  <div class="note-info-header"><span><%= Formatter.toUserDisplay(created_by) %> - <%= Formatter.toDateAndTimeDisplay(created_date) %></span></div>
</div>
<div class="associated-column">
  <%= linkToDisplay %>
</div>
<div class="creator-column">
  <%= noteCreatorRoleDisplay %>
</div>

<div class="edit-column comm-note-buttons">
  <% if (userCanModifyNote && mode !== 'edit') { %>
    <div class="hidden-print" style="display: flex; flex-direction:row;">
      <div class="comm-note-edit">Edit</div>
      <div class="comm-note-delete"></div>
    </div>
  <% } %>
</div>

<% if (mode === 'edit') { %>
<div class="comm-note-edit-container">
  <div class="comm-note-edit-region"></div>
</div>
<% } %>
