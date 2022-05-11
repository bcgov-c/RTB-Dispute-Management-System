<div class="modal-dialog">
  <div class="modal-content clearfix">
    <div class="modal-header">
      <h4 class="modal-title"><%= title %></h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>
    <div class="modal-body clearfix">
      <%= bodyHtml %>

      <div class="amendment-confirm-container">
          <div class="amendment-regions clearfix">
            <div class="amendment-by"></div>
            <div class="amendment-rtb-init"></div>
            <div class="amendment-respondent-init"></div>
            <div class="amendment-note"></div>
          </div>
      </div>
      <div class="row pull-right">
        <button type="button" class="btn btn-lg btn-default btn-cancel cancel-button">
          Cancel
        </button>
        <button type="button" class="btn btn-lg btn-primary btn-continue continue-button">
          Amend
        </button>
      </div>
    </div>
  </div>
</div>
