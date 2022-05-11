<div class="modal-dialog">
  <div class="modal-content clearfix">
    <div class="modal-header">
      <h4 class="modal-title"><%= title ? title : 'Upload/Edit Evidence' %></h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>
    <div class="modal-body clearfix">

      <% if (titleModel.get('disabled') && titleModel.getData()) { %>
        <div class="file-title-display-only-container">
          <span class="file-title-display-only"><%= titleModel.getData() %></span>
          <% if (helpHtml) { %>
            <span class="help-icon">?</span>
          <% } %>
        </div>
      <% } %>

      <div class="<%= useFileTypeDropdown ? '' : 'hidden' %> modal-add-files-file-type"></div>
      <div class="file-title <%= useFileTypeDropdown || titleModel.get('disabled') ? 'hidden-item' : '' %>"></div>

      <div class="file-upload"></div>
      <div class="file-upload-list"></div>

      <div class="file-description <%= hideDescription ? 'hidden' : '' %>"></div>

      <div class="button-row">
        <div class="float-left">
          <button id="addFilesDeleteAll" type="button" class="btn btn-lg btn-delete-all <%= showDelete ? '' : 'hidden' %>">
            <b class="glyphicon glyphicon-trash"></b><span class="">Delete All</span>
          </button>
        </div>

        <div class="float-right">
          <button id="addFilesCancel" type="button" class="btn btn-lg btn-default btn-cancel hidden-item">
            <span class="">Cancel Remaining Uploads</span>
          </button>
          <button id="addFilesClose" type="button" class="<%= hideCloseButton ? 'hidden' : '' %> btn btn-lg btn-default btn-cancel cancel-button">
            <%= closeButtonText %>
          </button>
          <button id="addFilesSave" url="" type="button" class="btn btn-lg btn-primary btn-continue continue-button hidden-item">
            <span class="regular-text"><%= saveButtonText %></span>
            <span class="xs-text hidden-item"><%= mobileSaveButtonText || saveButtonText %></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

