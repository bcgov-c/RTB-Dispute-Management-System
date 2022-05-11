<div class="modal-dialog">
  <div class="modal-content clearfix">
    <div class="modal-header">
      <h4 class="modal-title"><%= title %></h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>
    <div class="modal-body clearfix">
      <%= topHtml %>
      <div class="modal-mark-deficient-reason-container">
        <div class="modal-mark-deficient-reason"></div>
      </div>
      <div class="spacer-block-15"></div>
      <%= bottomHtml %>
      
      <div class="row pull-right">
        <button type="button" class="btn btn-lg btn-default btn-cancel cancel-button">
          No, Cancel
        </button>
        <button type="button" class="btn btn-lg btn-primary btn-continue continue-button">
          Yes, Remove
        </button>
      </div>
    </div>
  </div>
</div>