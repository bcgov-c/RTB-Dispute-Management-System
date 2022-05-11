<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title"><%= isRegenerationMode ? 'Replace' : 'Add' %> Standard Notice</h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>

    <div class="modal-body">
      <div class="notice-filters-container clearfix">
        <div class="notice-dispute-type-filters"></div>
      </div>

      <div class="modal-body-inner">
        <% if (!isUploadView) { %>
          <div class="dispute-notice-generate-info">
            <div class="dispute-notice-title"></div>
            <div class="dispute-process">
              <label class="general-modal-label">Dispute Process: </label><span class="general-modal-value"> <%= Formatter.toProcessDisplay(disputeProcess)%></span>
            </div>
            <div class="use-special-instructions"></div>
          </div>
          <div class="special-instructions"></div>
          <div class="notice-buttons clearfix">
            <div class="float-right">
              <button type="button" class="btn btn-lg btn-default btn-cancel">
                <span>Cancel</span>
              </button>
              <button type="button" class="btn btn-lg btn-default btn-primary btn-add <%= disableGenerateButton ? 'disabled' : '' %>">
                <span><%= isRegenerationMode ? 'Replace' : 'Generate' %></span>
              </button>            
            </div>          
          </div>

          <% if (isRegenerationMode) { %>
            <div class="mark-deficient-reason"></div>
          <% } %>

          <% if (!_.escape.isEmpty(existingNoticeFiles)) { %>
            <div class="existing-notice-files-warning-container">            
              <div class="existing-notice-files-warning warning-yellow">The following notice files will be stored in the rejected/deficient documents with your reason below. To exit without replacing the files close this window or press Cancel.</div>
              <ul>
                <% _.escape.each(existingNoticeFiles, function(fileModel) { %>
                  <li>
                    <span><%= fileModel.get('file_name') %></span>&nbsp;
                    <span class="info-gray">(<%= Formatter.toFileSizeDisplay(fileModel.get('file_size')) %>)</span>
                  </li>
                <% }) %>
              </ul> 
            </div>
          <% } %>
          
          <% if (disputeProcess) { %>
            <div id="notice-preview" class="previewableContainer"></div>
          <% } else { %>
            <div class="error-block warning">A process must be assigned to this dispute for notice to be generated.</div>
          <% } %>

        <% } else if (isUploadView) { %>
          <div class="dispute-notice-title"></div>

          <% if (isRegenerationMode) { %>
            <div class="mark-deficient-reason"></div>
          <% } %>
          
          <% if (!_.escape.isEmpty(existingNoticeFiles)) { %>
            <div class="existing-notice-files-warning-container">            
              <div class="existing-notice-files-warning warning-yellow">The following notice files will be stored in the rejected/deficient documents with your reason below. To exit without replacing the files close this window or press Cancel.</div>
              <ul>
                <% _.escape.each(existingNoticeFiles, function(fileModel) { %>
                  <li>
                    <span><%= fileModel.get('file_name') %></span>&nbsp;
                    <span class="info-gray">(<%= Formatter.toFileSizeDisplay(fileModel.get('file_size')) %>)</span>
                  </li>
                <% }) %>
              </ul> 
            </div>
          <% } %>

          <div class="notice-upload-container">
            <div class="notice-upload-component"></div>
            <div class="notice-upload-files"></div>
          </div>

          <div class="notice-package-provided-container edit">
            <div class="package-provided-container">
              <div class="package-provided-dropdown"></div>
              <div class="notice-delivered-to"></div> 
            </div>
        
            <div class="notice-method-and-date-container">
              <div class="notice-delivery-method"></div>
              <div class="notice-delivery-date"></div>
              <div class="notice-delivery-time"></div>
            </div>
          </div>

          <div class="upload-button-container">
            <button type="button" class="btn btn-lg btn-default btn-cancel">
              <span>Cancel</span>
            </button>
            <button type="button" class="btn btn-lg btn-default btn-primary btn-upload">
              <span><%= isRegenerationMode ? 'Replace Notice' : 'Add Notice' %></span>
            </button>            
          </div>
        <% } %>
      </div>

    </div>
  </div>
</div>
