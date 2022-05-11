<div class="print-header"></div>

<div class="header-page-title-container">
  <div class="header-page-title header-page-title-with-icon">Documents</div>

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
  <div class="documents-section">
    <div id="documents-dispute-files">

      <div class="page-section-title-container">
        <span class="page-section-title">Dispute Files</span>
      </div>
      
      <div class="general-filter-container dispute-files-filters-container hidden-print clearfix">
        <div class="file-type-container"></div>
        <div class="file-title-container <%= showFileTitleEditor ? '' : 'hidden-item' %>"></div>
        <div class="file-provided-by-container <%= showProvidedByEditor ? '' : 'hidden-item' %>"></div>
        <div class="file-custom-title-container <%= showCustomTitleEditor ? '' : 'hidden-item' %>"></div>
        <div class="add-file-button">
          <button type="button" class="btn btn-lg btn-default btn-primary"><span>Add File</span></button>
        </div>
        <div class="documents-page-legacy-service-portal-warning error-block warning <%= showLegacyWarning ? '' : 'hidden-item' %>">These forms should only be used to update files that were created prior to the release of the DMS.  For new DMS files use the new forms and the Office Submission site.</div>
      </div>

      <div class="dispute-documents-list"></div>
    </div>
  </div>

  <div class="outcome-documents-section"></div>

  <div class="doc-requests-container"></div>  

  <div class="deficient-dispute-documents-list-container">
    <div class="page-section-title-container">
      <span class="page-section-title">Removed / Deficient Files</span>
    </div>
    <div class="deficient-dispute-documents-list"></div>
  </div>

</div>

