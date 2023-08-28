<div class="modal-dialog">
  <div class="modal-content clearfix">
    <div class="modal-header">
      <h4 class="modal-title">Change Task Assignment</h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>

    <div class="modal-body">
      <div class="assign-user-description"><%= topText %></div>
      <div>
        <label class="general-modal-label">Type:</label>&nbsp;<span class="general-modal-value"><%= typeDisplay %></span>
      </div>
      <div>
        <label class="general-modal-label">Owner Group:</label>&nbsp;<span class="general-modal-value assign-task-owner-type<%= isSubTypeArb ? '-green' : '-orange'%>"><%= subTypeDisplay %></span>
      </div>
      <div class="assign-user-status-container">
        <label class="general-modal-label">Task:</label>&nbsp;<span class="general-modal-value"><%= task_text %></span>
      </div>

      <div class="task-owner-container">
        <div>
          <span class="task-owner-label">Owner Group</span>
          <div class="task-owner-region"></div>
          <div class="change-task-input-wrapper">
            <div class="task-hint-arrow-icon"></div>
            &nbsp;
            <span class="change-task-input-bottom-label">Click to change</span>
          </div>
        </div>

        <div>
          <div class="task-username-region"></div>
          <div class="change-task-input-wrapper">
            <div class="task-hint-arrow-icon"></div>
            &nbsp;
            <span class="change-task-input-bottom-label">Set blank to unassign</span>
          </div>
        </div>
      </div>

      <div class="float-right">
        <button type="button" class="btn btn-lg btn-default btn-cancel">Cancel</button>
        <button type="button" class="btn btn-lg btn-default btn-primary btn-save"><%= navigateAfterSave ? 'Save and Open' : 'Save' %></button>
      </div>
    </div>
  </div>
</div>