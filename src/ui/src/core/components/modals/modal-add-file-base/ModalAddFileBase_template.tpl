<div class="modal-dialog">
  <div class="modal-content clearfix">
    <div class="modal-header">
      <h4 class="modal-title"><%= title ? title : 'Upload/Edit' %></h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>
    <div class="modal-body clearfix">
      
      <div class="file-document-title"></div>
      <div class="file-upload"></div>
      <div class="file-upload-list"></div>

      <div class="file-description"></div>

      <div class="button-row">
        <div class="float-right">
          <button id="addFilesClose" type="button" class="<%= hideCloseButton ? 'hidden' : '' %> btn btn-lg btn-default btn-cancel cancel-button">
            <%= closeButtonText %>
          </button>
          <button id="addFilesSave" url="" type="button" class="btn btn-lg btn-primary btn-continue continue-button">
            <span class="regular-text"><%= saveButtonText %></span>
            <span class="xs-text hidden-item"><%= mobileSaveButtonText || saveButtonText %></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

