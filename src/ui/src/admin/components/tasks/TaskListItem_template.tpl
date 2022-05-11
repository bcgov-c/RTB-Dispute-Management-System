<div class="task-details-column">
  <div class="task-details-wrapper">
    <!-- <div class=""> -->
      <div class="task-left-data task-list-item-float">
        <span class="task-priority">
          <% if (isPriorityHigh) { %>
            <div class="task-priority-high-small tasks-floating-image"></div>
          <% } else if (isPriorityLow) { %>
            <div class="task-priority-low-small tasks-floating-image"></div>    
          <% } else if (isPriorityNormal) { %>
            <div class="task-priority-medium-small tasks-floating-image"></div>
          <% } else { %>
            <div class="task-priority-none-small tasks-floating-image"></div>
          <% } %>
        </span>
        <span class="task-icon">
          <% if (isSystem) { %>
            <div class="system-task-icon tasks-floating-image task-list-margin"></div>
          <% } else if (isCommunication) { %>
            <div class="communication-task-icon tasks-floating-image task-list-margin"></div>
          <% } else { %>
            <div class="standard-task-icon tasks-floating-image task-list-margin"></div>
          <% } %>
        </span>
        <span class="task-type<%= isSubTypeArb ? '-green' : '-orange'%>  <%= task_sub_type ? '' : 'hidden' %>"><%= taskTypeText %></span>
        <span class="task-file-number tasks-floating-image task-list-margin <%= showFileNumber ? '' : 'hidden' %>">
          <% if (file_number) { %>
            <span class="general-link"><%= file_number %>:</span>
          <% } else { %>
            -
          <% } %>
        </span>
    </div>
    <div>
      <span>&nbsp;<%= task_text %></span>
      <span class="hidden-print">
        <% if (showEditTask) { %>
          <a href="javascript:;" class="view-edit-task text-center <%= isComplete ? 'hidden' : '' %>">Edit Task</a><span class="task-view-email-link <%= showViewEmailLink ? '' : 'hidden' %>"><%= showSpacer %><a>View Email / Pickup</a></span>
        <% } %>
        </span>
    </div>
    <!-- </div> -->
    <div class="task-meta-data">
      <span>Created: <%= creationDate %> <%= createdBy %>, Previous Owner: <%= previousOwner %><%= timeInQueue %><%= timeToComplete %>  </span>
    </div>
  </div>
</div>
<div class="task-activity-type-column">
  <span><%= activityType %></span>
</div>
<div class="task-owner-column">
  <% if (showReassign && task_owner_id) { %>
    <span class="task-owner-column-text"><%= Formatter.toUserDisplay(task_owner_id) %></span>
    <span class="task-owner-column-assign-link general-link">Change</span>
  <% } else if (task_owner_id) { %>
    <span class="task-owner-column-text"><%= Formatter.toUserDisplay(task_owner_id) %></span>
  <% } else { %>
    <span class="task-owner-column-assign-link general-link">Assign</span>
  <% } %>
</div>

<div class="task-due-column">
  <span class="task-list-due-date"><%= task_due_date ? Formatter.toDateAndTimeDisplay(task_due_date) : '-' %></span>
  <span class="<%= task_due_date && !isComplete ? '' : 'hidden' %> task-due-time <%= isPassedDate && !date_task_completed ? 'error-red' : '' %>"><img style="<%=isPassedDate && !date_task_completed ? 'width:18px;margin-top:1px;' : 'width:20px;'%>" src="<%= isPassedDate && !date_task_completed ? AdminLateTimeIcon : AdminTimeIcon %>" />&nbsp;<%= pastDueDateTime %></span>
</div>
<div class="task-completed-column <%= showTaskComplete ? 'hidden' : '' %>">
  <span class="<%= showTaskComplete ? 'hidden' : '' %> task-complete-checkbox"></span>
  <span class="<%= isPassedDate && date_task_completed ? 'error-red' : '' %> task-completed-time">
    <span class="<%= isPassedDate && date_task_completed ? '' : 'hidden' %>"><img class="task-error-icon" src="<%= ErrorIcon %>"></img>&nbsp;</span>
    <%= date_task_completed ? Formatter.toDateAndTimeDisplay(date_task_completed) : '' %>
  </span>
  <span class="visible-print"><%= !date_task_completed ? '-' : '' %></span>
</div>
