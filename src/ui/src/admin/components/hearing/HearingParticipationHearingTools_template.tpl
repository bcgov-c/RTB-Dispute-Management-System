<div class="hearing-tools-header <%= mode %>">
  <span>Hearing Participation and Information</span>

  <% if (hasHearingParticipations) { %>
    <span class="clickable float-right hearing-tools-edit">Edit</span>
    <span class="float-right hearing-tools-edit-mode-buttons hidden-item">
      <span class="clickable float-right hearing-tools-add">Add other participant</span>
      <span class="float-right hearing-tools-separator"></span>
      <span class="clickable float-right hearing-tools-mark-none">Mark None Attended</span>
      <span class="float-right hearing-tools-separator"></span>
      <span class="clickable float-right hearing-tools-mark-all">Mark All Attended</span>
    </span>
  <% } %>
</div>
<div class="hearing-participation-container <%= mode %> <%= hasHearingParticipations ? '' : 'no-hearing-participations' %>"></div>
<div class="hearing-tools-save-controls <%= mode %>">
  <span class="hearing-tools-save-controls-cancel">Cancel</span>            
  <span class="hearing-tools-separator"></span>
  <span class="hearing-tools-save-controls-save">Save Changes</span>
</div>