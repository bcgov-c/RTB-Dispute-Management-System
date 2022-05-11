<div class="header-page-title-container">
  <div class="header-page-title header-page-title-with-icon">My Tasks</div>
</div>

<div class="page-loading-message-container <%= isLoaded ? 'hidden': '' %>">
  Loading...
</div>
<div class="<%= isLoaded ? '': 'hidden' %>">
  <div class="clearfix">
    <div class="general-filters-row general-filters-row--dark">
      <div class="my-tasks-page-owner"></div>
      <div class="tasks-type-filters"></div>
    </div>
    <div class="general-filters-row">
      <div class="tasks-sort-by-filters filters-row-radio-filters"></div>
      <div class="filters-row-calender-filter">
        <span class="calendar-filter-label">Created After:</span>
        <span class="calendar-filter-region"></span>
        <div class="tasks-activity-types-filter"></div>
      </div>
    </div>
  </div>

  <div class="">
    <div id="task-list"></div>
    <div class="">
      <div class="task-show-more show-more-disputes <%= hasMoreTasks ? '' : 'hidden' %>">Show more</div>
      <div class="all-disputes <%= hasMoreTasks ? 'hidden' : '' %>">All results displayed</div>
    </div>
  </div>
  
</div>