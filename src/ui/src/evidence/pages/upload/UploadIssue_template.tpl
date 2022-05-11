<div class="da-upload-title-container">
  <div class="da-upload-type-title">
    <%= issueTypeTitle %>
  </div>
  <div class="da-upload-title"><%= issueTitle %></div>
</div>
<div class="da-upload-issue-body">
  <% if (showRequiredEvidenceWarning) { %>
    <div class="step-description">
      <span>Are you missing recommended evidence?</span>
      <span><a role="button" class="badge help-icon upload-issue__help-icon">?</a></span>
    </div>
  <% } %>
  <div class="dispute-evidence-collection"></div>
</div>