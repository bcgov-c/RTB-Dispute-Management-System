<div class="modal-dialog">
  <div class="modal-content clearfix">
    <div class="modal-header">
      <h4 class="modal-title">No Activity Warning</h4>
    </div>
    <div class="modal-body clearfix">
      <div class="">
        <p>Are you still there?&nbsp; For security reasons your session will expire in <%= timeout_countdown_start %> seconds.</p>
        <p class="timeout-countdown-container">
          <b class="timeout-countdown"></b>
        </p>
      </div>
      <div class="">
        <div class="modal-button-container modal-button-container-center">
          <button id="timeoutLogOut" type="button" class="btn btn-lg btn-default btn-cancel cancel-button">
            Log out
          </button>
          <button id="timeoutLogIn" url="" type="button" class="btn btn-lg btn-primary btn-continue continue-button">
            Stay logged in
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
