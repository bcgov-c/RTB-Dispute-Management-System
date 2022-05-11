<div class="header-page-title-container">

  <div class="header-page-title header-page-title-with-icon">Composer</div>

  <div class="subpage dispute-overview-header-right-container">
    <div class="dispute-overview-header-right">
      <div class="dispute-overview-header-icon header-print-icon"></div>
      <div class="dispute-overview-header-icon header-close-icon"></div>
    </div>
  </div>
</div>
  
<div class="composer-container">

    <div class="composer-doc-row">
      <div class="composer-doc-template">
        <%= outcome_doc_file_model.get('file_acronym') + ' - ' + outcome_doc_file_model.get('file_title') %>
      </div>

      <div class="composer-doc-row-right">
        <div class="composer-doc-date"></div>
        <div class="composer-doc-status"></div>
        <div class="composer-doc-update-btn btn btn-primary">Update</div>
      </div>
    </div>

    <div class="composer-section-decision-info"></div>
    <div class="composer-section-hearing"></div>
    <div class="composer-section-notice"></div>
    <div class="composer-section-evidence"></div>
    <div class="composer-section-issues"></div>
    <div class="composer-section-background"></div>
    <div class="composer-section-analysis"></div>
    <div class="composer-section-conclusion"></div>
</div>