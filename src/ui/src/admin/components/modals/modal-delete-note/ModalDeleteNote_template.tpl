<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title">Delete Note?</h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>
    <div class="modal-body clearfix">
      Are you sure you want to delete this <%= linkToDisplay %> note?
      <blockquote>
        "<%= note %>"
      </blockquote>
      <div class="note-info-header">- <%= Formatter.toUserDisplay(created_by) %> - <%= noteCreatorRoleDisplay %> - <%= Formatter.toDateDisplay(created_date) %></div>
      <div class="button-row">
        <div class="pull-right">
          <button id="deleteNoteCancel" type="button" class="btn btn-lg btn-default btn-cancel">
            <span>Cancel</span>
          </button>
          <button id="deleteNoteOK" type="button" class="btn btn-lg btn-primary btn-continue">Yes</button>
        </div>
      </div>
    </div>
  </div>
</div>
