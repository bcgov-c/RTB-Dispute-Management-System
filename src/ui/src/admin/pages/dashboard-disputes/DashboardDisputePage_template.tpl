<div class="header-page-title-container">

  <div class="header-page-title header-page-title-with-icon"><%= title %></div>

  <div class="subpage dispute-overview-header-right-container">
    <div class="dispute-overview-header-right">
      <div class="dispute-overview-refresh-item">
        <span class="dispute-overview-refresh-text"></span>
        <div class="dispute-overview-header-icon header-refresh-icon"></div>
      </div>
      <div class="dispute-overview-header-icon header-print-icon <%= showPrint ? '' : 'hidden' %>"></div>
    </div>
  </div>
</div>

<div class="my-disputes-container <%= isLoaded ? '' : 'hidden' %>">
  <div class="general-filters-row general-filters-row--dark">
    <div style="display: flex;">
      <div class="dashboard-user-filter <%= !displayUserDropdown ? 'hidden': '' %> "></div>
      <div class="view-all-radio"></div>
    </div>

    <div class="dashboard-dispute-optional-filters">
      <% if (displaySourceFilter) { %>
        <div class="dashboard-source-filter"></div>
      <% } %>
      <% if (displayUrgencyFilter) { %>
        <div class="dashboard-urgency-filter"></div>
      <% } %>
      <% if (displayDisputeSort) {%>
        <div class="dashboard-dispute-sort"></div>
      <% } %>
      <% if (displayUndeliveredDocFilter) {%>
        <div class="undelivered-doc-filter"></div>
      <% } %>
    </div>
  </div>

  <% if (showTasks) { %>
    <div class="general-filters-row">
      <div class="tasks-sort-by-filters filters-row-radio-filters"></div>
      <div class="filters-row-calender-filters">
        <div class="filters-row-calender-filter">
          <span class="calendar-filter-label">Created After:</span>
          <span class="calendar-filter-region filter-after-date-region"></span>
        </div>
        <div class="filters-row-calender-filter">
          <span class="calendar-filter-label">Created Before:</span>
          <span class="calendar-filter-region filter-before-date-region"></span>
        </div>
      </div>
      <div class="tasks-activity-types-filter"></div>
    </div>
    
    <div class="dashboard-tasks-list">
      <div id="task-list"></div>
      <div class="">
        <div class="task-show-more show-more-disputes <%= hasMoreTasks ? '' : 'hidden' %>">Show more</div>
        <div class="all-disputes <%= hasMoreTasks ? 'hidden' : '' %>">All results displayed</div>
      </div>
    </div>

  <% } else if (showDocs) { %>
    <div class="general-filters-row">
      <div class="docs-sort-by-filters-method"></div>
      <div class="docs-sort-by-filters-priority"></div>
    </div>
    
    <div class="dashboard-docs-list"></div>
  <% } else { %>
    <div class="dashboard-dispute-filters-section"></div>
    <div class="dashboard-dispute-list"></div>

    <div class="dispute-show-more">
      <div class="show-more-disputes <%= hasMoreDisputes ? '' : 'hidden' %>">Show more</div>
      <div class="all-disputes <%= hasMoreDisputes ? 'hidden' : '' %>">All results displayed</div>
    </div>
  <% } %>
  
</div>