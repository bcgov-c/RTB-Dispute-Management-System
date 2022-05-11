<div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title"><%= isRegenerationMode ? 'Replace' : 'Add' %> Other Notice</h4>
        <div class="modal-close-icon-lg close-x"></div>
      </div>
  
      <div class="modal-body">
        <div class="notice-filters-container clearfix">
          <div class="notice-dispute-type-filters"></div>
        </div>
  
        <div class="modal-body-inner">
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

          <div class="notice-associated-to-region"></div>
          
          <div class="notice-package-provided-container edit">
            <div class="package-provided-container">
              <div class="package-provided-dropdown"></div>
              <div class="notice-delivered-to"></div>
              <div class="notice-rtb-initiated"></div>
            </div>
        
            <div class="notice-method-and-date-container">
              <div class="notice-delivery-method"></div>
              <div class="notice-delivery-date"></div>
              <div class="notice-delivery-time"></div>
            </div>
          </div>

          <div class="edit">
            <div class="notice-other-delivery-description hidden"></div>
          </div>

          <div class="upload-button-container">
            <button type="button" class="btn btn-lg btn-default btn-cancel">
              <span>Cancel</span>
            </button>
            <button type="button" class="btn btn-lg btn-default btn-primary btn-upload">
              <span><%= isRegenerationMode ? 'Replace Notice' : 'Add Notice' %></span>
            </button>            
          </div>          
        </div>
  
      </div>
    </div>
  </div>
  