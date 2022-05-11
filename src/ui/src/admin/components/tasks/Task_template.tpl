<div class="task-description-priority-row">
  <div class="task-description-region"></div>
  <div class="priority-region"></div>
</div>

<div class="user-name-date-container">
  <div class="task-type-region"></div>
  <div class="task-sub-type-region <%= isUnassigned ? '' : 'hidden' %>"></div>

  <div class="task-owner-container <%= isAssigned ? '' : 'hidden' %>">
    <div class="task-owner-region"></div>
    <div class="task-username-region"></div>
  </div>

  <div class="task-duration-container">
    <div class="task-date-region"></div>
    <div class="date-auto-assign-container">
      <a href="javascript:;" class="eod-link">EOD</a>
      <a href="javascript:;" class="one-day-link">1d</a>
      <a href="javascript:;" class="three-day-link">3d</a>
      <a href="javascript:;" class="one-week-link">1w</a>
    </div>
    <div class="task-time-container">
      <div class="task-time-region"></div>
    </div>
    <div class="add-tasks-activity-types-filter"></div>
  </div>

  <div class="add-cancel-button-container">
    <button type="button" class="btn btn-lg btn-cancel cancel-button">Cancel</button>
    <button type="button" class="btn btn-lg btn-standard btn-primary btn-continue continue-button btn-add">
      <%= addText ? addText : 'Add Task' %>
    </button>
  </div>
</div>

  

