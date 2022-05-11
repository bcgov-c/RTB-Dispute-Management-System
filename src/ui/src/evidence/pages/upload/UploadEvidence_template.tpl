<div class="da-upload-add-evidence-line-container">
  <div class="da-upload-evidence-file-upload-container">
    <div class="da-upload-evidence-file-uploader <%= isUpload || isDisplayOnly ? 'hidden': '' %>"></div>

    <div class="add-evidence-title">
      <span class="da-upload-evidence-title">
        <%= evidenceTitle %>
      </span>

      <span class="add-evidence-help <%= isUpload || !helpHtml ? 'hidden': '' %>">
        <span><a role="button" class="badge help-icon">?</a></span>
      </span>
      <span class="add-evidence-files-count <%= isUpload ? 'hidden': '' %> <%= uploadedFilesLength ? '' : 'hidden' %>">
        <%= '('+uploadedFilesLength + ' ' + (uploadedFilesLength === 1 ? 'file' : 'files')+' uploaded)' %>
      </span>
    </div>
  </div>
  
  <div class="file-upload-ready-count <%= isUpload || !pendingFilesLength ? 'hidden': '' %>">
    <span class=""><%= pendingFilesLength %></span>&nbsp;new ready to submit <b class="glyphicon glyphicon-download"></b>
  </div>

</div>

<div class="other-evidence-description"><%= description ? '<span>Description:</span>&nbsp;'+description : '' %></div>
<div class="other-evidence-empty-error error-block warning hidden-item"> </div>

<div class="files-to-upload"></div>
