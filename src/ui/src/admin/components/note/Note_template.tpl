<% if (mode !== "edit") { %>
  <div class="note-info-header">
    <span><%= Formatter.toUserDisplay(created_by) %> - <%= noteCreatorRoleDisplay %> - <%= Formatter.toDateAndTimeDisplay(created_date) %></span>
    <% if (enableEditDeleteControls) { %>
      <div class="note-edit-delete-controls">
        <span class="general-link">Edit</span><div class="note-delete-icon"></div>
      </div>
    <% } %>
  </div>
  <p class="note-content"><%= note %></p>
<% } else { %>
  <div class="clearfix note-edit-container">
    <div class="">
      <div class="note-input-container"></div>
      <% if (!hideSaveControls) { %>
        <div class="note-save-container">
          <div class="note-buttons note-save-button"></div>
          <div class="note-buttons note-cancel-button"></div>
        </div>
      <% } %>
    </div>
    
    <% if (_.escape.isFunction(contextClickFn) && contextClickText) { %> 
      <div class="note-click-context clickable"><%= contextClickText %></div>
    <% } %>
  </div>
<% } %>
