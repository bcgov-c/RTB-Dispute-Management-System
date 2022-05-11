<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title">Edit Task</h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>

    <div class="modal-body">
      <div class="row row-bottom-margin">
        <div class="col-xs-6 edit-task-row">
          <span class="general-modal-label">Created By:</span> <span class="general-modal-value"> <%= createdBy %></span>
        </div>
        <div class="col-xs-6 edit-task-row">
          <span class="general-modal-label">Task ID: </span><span class="general-modal-value"> <%= task_id %></span>
        </div>
        <div class="col-xs-6 edit-task-row">
          <span class="general-modal-label">Created Date: <span class="general-modal-value"> <%= Formatter.toDateAndTimeDisplay(created_date) %></span>
        </div>
        <div class="col-xs-6 edit-task-row">
          <span class="general-modal-label">Type: </span><span class="general-modal-value"> <%= taskTypeDisplay %></span>
        </div>
        <div class="col-xs-6 edit-task-row">
          <span class="general-modal-label">Modified Date: </span><span class="general-modal-value"> <%= Formatter.toDateAndTimeDisplay(modified_date) %></span>
        </div>
        <div class="col-xs-6 edit-task-row">
          <span class="general-modal-label">Status: </span><span class="general-modal-value"> <%= taskStatusDisplay %></span>
        </div>
        <div class="col-xs-6 edit-task-row">
          <span class="general-modal-label">Modified By: </span><span class="general-modal-value"> <%= modifiedBy %></span>
        </div>
        <div class="col-xs-6 edit-task-row">
          <span class="general-modal-label">Date Completed: </span><span class="general-modal-value"> <%= date_task_completed ? Formatter.toDateAndTimeDisplay(date_task_completed) : '-' %></span>
        </div>
      </div>

      <div class="task-edit-container">
      </div> 

    </div>
  </div>
</div>
