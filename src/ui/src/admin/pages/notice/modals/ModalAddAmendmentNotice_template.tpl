<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title"><%= isRegenerationMode ? 'Replace' : 'Add' %> Amendment</h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>

    <div class="modal-body">
      <div class="notice-filters-container clearfix">
        <div class="notice-amendment-type-filters"></div>
      </div>

      <div class="modal-body-inner">

        <div class="error-block warning">
          Amendments should generally be added through the Office Submission site so that an unassigned task is created with submission details.  This direct upload feature should only be used in special circumstances.  If you are not sure that you should be using this feature, contact your supervisor.
        </div>

        <% if (isRegenerationMode) { %>
          <div class="mark-deficient-reason"></div>
        <% } %>
        
        <% if (!_.escape.isEmpty(existingNoticeFiles)) { %>
          <div class="existing-notice-files-warning-container">            
            <div class="existing-notice-files-warning warning-yellow">The following amendment files will be stored in the rejected/deficient documents with your reason below. To exit without replacing the files close this window or press Cancel.</div>
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

        <div class="notice-amendment-title"></div>
        <div class="notice-upload-container">
          <div class="notice-amendmned-upload-component"></div>
          <div class="notice-amendment-upload-files"></div>
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
          <button type="button" class="btn btn-lg btn-default btn-primary btn-amendment-upload">
            <span><%= isRegenerationMode ? 'Replace Amendment' : 'Add Amendment' %></span>
          </button>            
        </div>
      </div>

    </div>
  </div>
</div>
  