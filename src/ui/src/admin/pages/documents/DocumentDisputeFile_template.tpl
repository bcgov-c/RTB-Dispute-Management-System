<div class="dispute-file-row">
  <div style="display: flex;">
    <div class="dispute-file-contents"></div>
    <% if (showControls) { %>
      <div class="edit-file-icon"></div>
      <div class="delete-file-icon"></div>
    <% } %>
  </div>

  <div class="dispute-doc-deficient-reason <%= isDeficient ? '' : 'hidden' %>">
    <span class="review-label">Removal Reason:</span>&nbsp;<span class=""><%= isDeficientReasonDisplay %></span>
  </div>
</div>