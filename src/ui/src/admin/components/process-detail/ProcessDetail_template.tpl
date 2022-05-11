
<div class="process-detail-title review-applicant-title section-header"><%= processDisplay %> Outcome</div>

<div class="process-detail-content">
  <div class="process-detail-warning error-block warning">
    <b>These features have been moved.</b><br>Hearing durations and times are recorded above hearing participation, writing times are now recorded in outcome documents, 
    review outcomes are recorded in outcome document requests, and issue outcomes are recorded in the dispute view.  
    <%= !isEmpty ? 'The information fields below should only be used to complete disputes that were being worked on prior to the features being moved to their new location in DMS.' : '' %>
    If you are not sure which fields to use to record this information contact your manager.
  </div>
  <div class="<%= isEmpty ? 'hidden' : '' %>  <%= mode %>">
    <div class="two-column-edit-container">
      <div class="dispute-party-column left-column">
        <div class="process-group-detail-first-applicant <%= firstApplicantHidden ? 'hidden' : ''%>"></div>
        <div class="process-group-detail-second-applicant <%= secondApplicantHidden ? 'hidden' : ''%>"></div>
        <div class="process-group-detail-reason <%= reasonHidden ? 'hidden' : ''%>"></div>

        <div class="spacer-block-15 <%= firstApplicantHidden && secondApplicantHidden && reasonHidden ? 'hidden' : ''%>"></div>
        <div class="process-group-detail-outcome"></div>
        <div class="process-group-detail-description"></div>
        <div class="process-group-detail-note"></div>
      </div>
      <div class="dispute-party-column right-column">
        <div class="process-group-detail-hearing-duration <%= hearingDurationHidden ? 'hidden' : ''%>"></div>
        <div class="process-group-detail-method"></div>
        <div class="process-group-detail-complexity"></div>

        <div class="spacer-block-15"></div>
        <div class="process-group-detail-preparation-duration <%= preparationDurationHidden ? 'hidden' : ''%>"></div>
        <div class="process-group-detail-writing-duration"></div>
      </div>
    </div>
  </div>
</div>
