<div class="modal-dialog <%= isLoaded ? '' : 'hidden' %>">
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title"><%= modalTitle %></h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>
    <div class="modal-body">
      <div class="modal-body-inner">
        <div class="upload-button-container clearfix">
          <div class="float-right">
            <button type="button" class="btn btn-lg btn-default btn-cancel">
              <span>Cancel</span>
            </button>
            <button type="button" class="btn btn-lg btn-default btn-primary btn-upload">
              <span>Download</span>
            </button>
          </div>
        </div>
        <div id="decision-preview" class="previewableContainer"></div>
      </div>
    </div>
  </div>
</div>
