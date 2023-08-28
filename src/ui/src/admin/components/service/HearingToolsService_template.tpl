<div class="hearing-tools-header <%= mode %>">
  <div class="hearing-tools-left-container">
    <span><%= containerTitle %></span>
    <div class="show-archived-checkbox"></div>
  </div>
  <span class="clickable hearing-tools-edit">Edit</span>
  <span class="hearing-tools-edit-mode-buttons <%= isArbEditable && isEditMode ? '' : 'hidden' %>">
    <span class="clickable hearing-tools-mark-served"><%= saveAllAcknowledgedServedButtonText %></span>
    <span class="hearing-tools-separator"></span>
    <span class="clickable hearing-tools-mark-not-served"><%= saveAllNotServedButtonText %></span>
  </span>
</div>
<div class="notice-services-container <%= mode %>"></div>
<div class="hearing-tools-save-controls <%= mode %>">
  <span class="hearing-tools-save-controls-cancel">Cancel</span>            
  <span class="hearing-tools-separator"></span>
  <span class="hearing-tools-save-controls-save">Save Changes</span>
</div>