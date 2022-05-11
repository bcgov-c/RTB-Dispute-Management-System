<div class="print-header"></div>

<div class="header-page-title-container">

  <div class="header-page-title header-page-title-with-icon">Tasks</div>

  <div class="subpage dispute-overview-header-right-container">
    <div class="dispute-overview-header-right">
      <div class="dispute-overview-header-icon header-completeness-icon hidden-print"></div>
      <div class="dispute-overview-refresh-item">
        <% if (enableQuickAccess) { %>
          <div class="dispute-overview-header-icon header-quickaccess-icon hidden-print"></div>
        <% } %>
        <div class="dispute-overview-header-icon header-refresh-icon"></div>
      </div>
      <div class="dispute-overview-header-icon header-print-icon"></div>
      <div class="dispute-overview-header-icon header-close-icon"></div>
    </div>
  </div>
</div>

<div class="page-loading-message-container <%= isLoaded ? 'hidden': '' %>">
  Loading...
</div>
<div class="<%= isLoaded ? '': 'hidden' %>">
  <div class="dispute-flags"></div>
  <span class="print-filter-text visible-print"><b>Filter:</b> <%= printFilterText %></span>
  <span class="print-filter-text visible-print"><b>Sorting By: </b> <%= printSortText %></span>
  <div id="add-task-container" class="hidden-print">
    <div class="add-label">Add Task</div>
    <div class="task-edit-container"></div>
    <div class="row task-added-message hidden-item">
        <div class="col-xs-12">
          <span class="task-success-label pull-right">Task added to dispute</span>
          <div class="component-email-success-icon pull-right"></div>

        </div>
    </div>
  </div>
  <div class="general-filters-row general-filters-row--dark">
    <div class="tasks-type-filters"></div>
    <div class="tasks-sort-by-filters filters-row-radio-filters"></div>
  </div>
  
  <div class="">
    <div id="task-list"></div>
    <div class="">
      <div class="task-show-more show-more-disputes <%= hasMoreTasks ? '' : 'hidden' %>">Show more</div>
      <div class="all-disputes hidden-print <%= hasMoreTasks ? 'hidden' : '' %>">All results displayed</div>
    </div>
  </div>

</div>
