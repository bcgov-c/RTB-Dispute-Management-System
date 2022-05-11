<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title">Download Editable Notice Document</h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>

    <div class="modal-body">
      <div class="modal-body-inner">
        <% if (disputeProcess) { %>
          <div class="dispute-notice-generate-info">
            <div class="dispute-notice-title"></div>
            <div class="dispute-process">
              <label class="general-modal-label">Dispute Process: </label><span class="general-modal-value"> <%= Formatter.toProcessDisplay(disputeProcess)%></span>
            </div>
            <div class="use-special-instructions"></div>
          </div>
          <div class="special-instructions"></div>

          <div id="notice-preview"></div>
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
        <% } else { %>
          <div class="error-block warning">A process must be assigned to this dispute for notice to be downloaded.</div>
        <% } %>
      </div>
    </div>
  </div>
</div>
  