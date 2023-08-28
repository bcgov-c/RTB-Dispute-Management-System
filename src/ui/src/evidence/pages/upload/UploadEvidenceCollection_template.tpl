

<div class="da-upload-added-label da-upload-label-not-added <%= isUpload ? 'hidden': '' %> <%= _.escape.isEmpty(missing_evidences) ? 'hidden-item' : '' %>">Items with no files added</div>
<div class="not-added-issue-evidence"></div>

<div class="da-upload-added-label <%= !hasUploadedEvidence || isUpload ? 'hidden': '' %>">Items with files already added</div>
<div class="added-issue-evidence"></div>
<% if (uploadedOtherEvidenceCount) { %>
  <div class="added-otherissue-evidence">
    <div class="da-upload-add-evidence-line-container">
      <div class="da-upload-evidence-file-upload-container">
        <div class="add-evidence-title">
          <span class="da-upload-evidence-title <%= isUploadingOtherEvidence ? '': 'hidden' %>">Other</span>
          <span class="add-evidence-files-count <%= isUpload ? 'hidden': '' %> <%= uploadedOtherEvidenceCount ? '' : 'hidden' %>">
            <%= '('+uploadedOtherEvidenceCount + ' ' + (uploadedOtherEvidenceCount === 1 ? 'file' : 'files')+' uploaded)' %>
          </span>
        </div>
      </div>
    </div>
  <% } %>
</div>

<div class="<%= isDisplayOnly ? 'hidden': '' %>">
  <div class="da-upload-add-button da-upload-add-other-button"><%= addOtherLinkText %></div>
  <div class="custom-issue-evidence"></div>
</div>
