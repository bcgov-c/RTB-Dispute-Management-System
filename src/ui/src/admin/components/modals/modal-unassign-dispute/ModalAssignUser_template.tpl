<div class="modal-dialog">
  <div class="modal-content clearfix">
    <div class="modal-header">
      <h4 class="modal-title">Confirm status change</h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>

    <div class="modal-body">
      <div class="assign-user-description">Select the staff member that you want to assign this dispute to below.</div>
      <div>
        <label class="general-modal-label">Stage:</label>&nbsp;<span class="general-modal-value"><%= stageDisplay %></span>
      </div>
      <div class="assign-user-status-container">
        <label class="general-modal-label">Status:</label>&nbsp;<span class="general-modal-value"><%= statusDisplay %></span>
      </div>

      <div class="assign-user-stage-status-owner-container"></div>

      <div class="float-right">
        <% if (hasQuickStatusOptions) { %>
          <button type="button" class="btn btn-lg btn-default btn-primary btn-quickstatus">Open Quick Status</button>
        <% } %>
        <button type="button" class="btn btn-lg btn-default btn-cancel">Cancel</button>
        <button type="button" class="btn btn-lg btn-default btn-primary btn-save"><%= assignedToCurrentUser ? 'Save and Open' : 'Save' %></button>
      </div>
    </div>
  </div>
</div>
