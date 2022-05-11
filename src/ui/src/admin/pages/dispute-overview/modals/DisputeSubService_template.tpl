
<div class="dispute-party-container two-column-edit-container">
  <div class="dispute-party-column left-column">
    
    <div class="sub-service-application-by"></div>
    <div class="sub-service-service-to"></div>
    <div class="sub-service-request-source"></div>
  </div>
  <div class="dispute-party-column right-column">
    <div class="">
      <label>Created:</label>&nbsp;<span><%= Formatter.toDateDisplay(created_date) %>, <%= Formatter.toUserDisplay(created_by) %></span>
    </div>
    <div class="">
      <label>Modified:</label>&nbsp;<span><%= Formatter.toDateDisplay(modified_date) %>, <%= Formatter.toUserDisplay(modified_by) %></span>
    </div>
  </div>
</div>

<div class="sub-service-requested-doc-wrapper">
  <div class="sub-service-requested-doc"></div>
  <i><span class="sub-service-requested-doc-list <%= isEditMode ? '' : 'hidden' %>"><%= requestDocType %></span></i>
</div>

<div class="sub-service-requested-doc-other-description <%= isRequestOther ? '' : 'hidden' %>"></div>

<div class="sub-service-source-documents <%= showFileDescription ? '' : 'hidden' %>"><label>Source Document(s):</label>&nbsp;<div class="sub-service-request-file-description"></div></div>

<div class="sub-service-confirmed-methods-wont-work"></div>
<div class="sub-service-previous-service-description"></div>
<div class="sub-service-request-description"></div>
<div class="sub-service-request-justification"></div>

<div class="review-applicant-title section-header">Outcome</div>
<div class="dispute-party-container">
  <div class="sub-service-outcomes">
    <div class="sub-service-request-stats"></div>
    <div class="sub-service-doc-type-wrapper <%= isRequestStatusDenied ? 'hidden' : '' %>">
      <div class="sub-service-doc-type"></div>
      <i><span class="sub-service-doc-type-list <%= isEditOutcomeMode ? '' : 'hidden' %>"><%= docTypeOutcome %></span></i>
    </div>
    <div class="sub-service-doc-other <%= !isServiceOther || isRequestStatusDenied ? 'hidden' : '' %>"></div>
    <div class="sub-service-method-title"></div>
    <div class="sub-service-internal-note"></div>
  </div>
</div>
