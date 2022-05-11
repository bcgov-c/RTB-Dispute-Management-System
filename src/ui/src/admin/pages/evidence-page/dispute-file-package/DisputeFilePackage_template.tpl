<div class="dispute-file-package-claim-evidence clearfix"></div>
<div class="dispute-file-package-service-container <%= hasUploadedFiles ? '' : 'hidden' %>">
  <div class="dispute-file-package-service-display-container">
    <div class="notice-service-title-container">Evidence Service</div>
    <% if (!hasRespondents) print('<div class="standard-list-empty">No respondents have been added.</div>'); %>
    <div class="dispute-file-package-service-display"></div>
  </div>
  <div class="dispute-file-package-service-container-hearing-tools hidden-item"></div>
</div>
