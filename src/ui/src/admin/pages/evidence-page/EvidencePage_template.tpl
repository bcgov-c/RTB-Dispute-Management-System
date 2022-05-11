<div class="print-header"></div>

<div class="evidence-page-title-container header-page-title-container hidden-print">
  <div class="header-page-title header-page-title-with-icon">Evidence</div>
  <div class="<%= isLoaded && enableEvidenceFileViewer && hasViewableEvidenceFiles ? '' : 'hidden' %> evidence-page-file-preview subpage-header-action-container">
    <div class="subpage-header-action-icon">Evidence Viewer</div>
  </div>
  <div class="<%= isLoaded && showPackageView && showHearingTools ? '' : 'hidden' %> subpage-header-action-container">
    <div class="dispute-overview-claims-hearing-tools"></div>
  </div>

  <div class="subpage dispute-overview-header-right-container">
    <div class="dispute-overview-header-right">
      <div class="dispute-overview-refresh-item">
        <span class="dispute-overview-refresh-text">
          <span class="hidden visible-print"><%= file_number %></span>
          <span><%= Formatter.toLastModifiedTimeDisplay(lastRefreshTime) %></span>
        </span>
        <div class="dispute-overview-header-icon header-completeness-icon hidden-print"></div>
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
  <span class="print-filter-text visible-print"><b>Filters:</b> <%= printPageFilterText %> View</span>
  <span class="print-filter-text visible-print"><%= printPageHideText %></span>
  <span class="print-filter-text visible-print"><%= printPageShowText %></span>
  <div class="evidence-page-filters-container">
    <div class="general-filters-row general-filters-row--dark">
      <div class="evidence-page-top-filters"></div>
      <div class="evidence-page-mark-all-evidence <%= hearingToolsEnabled && showPackageView ? '' : 'hidden' %>">
        <div class="mark-all-not-served clickable">
          <img class="evidence-page-quick-action" src="<%= QuickActionIcon %>"/>
          Mark All Not Served and Evidence Not Considered
        </div>
        <div class="mark-all-acknowledged-served clickable">Mark All Acknowledged Served</div>
      </div>
    </div>
    <div class="general-filters-row hidden-print">
      <div class="evidence-page-bottom-filters">
        <div class="">
          <div class="radio-display-title evidence-page-filter-hide-radio-label">Hide:</div>
          <div class="evidence-page-filter-referenced hidden"></div>
          <div class="evidence-page-filter-considered hidden"></div>
          <div class="evidence-page-filter-notes hidden"></div>
          <div class="evidence-page-filter-removed hidden"></div>
          <div class="evidence-page-filter-dup hidden"></div>
        </div>

        <div class="">
          <div class="radio-display-title">Show:</div>
          <div class="evidence-page-filter-thumbnails"></div>
          <div class="evidence-page-filter-names <%= showPackageView ? '' : 'hidden' %>"></div>
        </div>
      </div>
    </div>
  </div>

  <div class="evidence-page-overview-info">
    <div class="">
      <div class="">
        <label class="review-label">Parties:</label>&nbsp;<div class="evidence-page-party-names"></div>
      </div>

      <div class="">
        <label class="review-label">Primary applicant:</label>&nbsp;<span><%= primaryApplicantDisplay ? primaryApplicantDisplay : 'None selected' %></span>
      </div>
    </div>

    <div class="">
      <div class="">
        <label class="review-label">Respondent Evidence Deadline:</label>&nbsp;<span><%= respondentDeadline %></span>
      </div>

      <div class="">
          <label class="review-label">Applicant Evidence Deadline:</label>&nbsp;<span><%= applicantDeadline %></span>
      </div>
    </div>

    <div class="evidence-page-note-icon-container hidden-print clickable">
      <span>Add General Evidence Note</span><div class="evidence-page-note-icon notes-add-icon"></div>
    </div>
  </div>

  <div class="evidence-page-notes-container hidden-print <%= hideNotes ? 'hidden' : '' %>">
    <div class="evidence-page-add-note"></div>
    <div class="evidence-page-notes"></div>
  </div>


  <div class="evidence-page-files-container <%= filterClasses %>">
    <div class="evidence-page-packages <%= showPackageView ? '' : 'hidden' %>"></div>

    <div class="evidence-page-claims <%= showIssueView  ? '' : 'hidden' %>"></div>

    <div class="evidence-page-parties <%= showPartiesView  ? '' : 'hidden' %>"></div>

  </div>

  <div class="spacer-block-45"></div>
</div>
