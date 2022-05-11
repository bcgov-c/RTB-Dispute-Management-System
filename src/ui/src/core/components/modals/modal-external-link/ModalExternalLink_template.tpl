<div class="modal-dialog">
  <div class="modal-content clearfix">
    <div class="modal-header">
      <h4 class="modal-title">Confirm External Link</h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>
    <div class="modal-body clearfix">
      <p class="row external-url-modal-text">
        <span>You selected a link to a different web site&nbsp;<span id="externalURLName"><%= siteName %></span>.  If you continue, it will open in a new tab or window.  To return to your application, just close that tab or window.</span>
      </p>
      <div class="row pull-right">
        <button id="externalCancel" type="button" class="btn btn-lg btn-default btn-cancel cancel-button">
          Cancel
        </button>
        <button id="externalContinue" type="button" class="btn btn-lg btn-primary btn-continue continue-button">
          Open Link
        </button>
      </div>
    </div>
  </div>
</div>
