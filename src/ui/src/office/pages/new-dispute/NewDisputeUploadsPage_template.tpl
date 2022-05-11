<div class="office-sub-page-view">
  <div class="da-page-header-title">
    <span class="da-page-header-icon da-access-menu-icon"></span>
    <span class="da-page-header-title-text"><%= isUpload ? 'Uploading files please wait' : (isPrivateMode ? 'Resume Paper Application' : 'Submit New Paper Application') %></span>
  </div>
  <div class="da-upload-instructions <%= isUpload ? '' : 'hidden' %>">
    File&nbsp;<b class="da-upload-overall-file-progress"></b>&nbsp;is being uploaded to file number&nbsp;<b><%= fileNumber %></b>.  When all files have uploaded, you will be provided with a submission receipt for your records.
  </div>

  <div class="office-new-dispute-previous-info  <%= isUpload ? 'hidden' : '' %>">
    <div class="office-page-new-dispute-section">
      <div class="office-page-new-dispute-section-title">Dispute Information</div>
      <div class="office-page-flex-container office-page-new-dispute-static-info-general">
        <div class="">
          <div class="">
            <span class="review-label">File number:</span>&nbsp;<span class=""><b><%= dispute.get('file_number') %></b></span>
          </div>
          <div class="">
            <span class="review-label">Applicant type:</span>&nbsp;<span class=""><%= dispute.isLandlord() ? 'Landlord' : dispute.isTenant() ? 'Tenant' : '-' %></span>
          </div>
          <div class="">
            <span class="review-label">Tenancy status:</span>&nbsp;<span class=""><%= dispute.isPastTenancy() ? 'Past Tenancy' : 'Current Tenant' %></span>
          </div>
          <div class="">
            <span class="review-label">Act:</span>&nbsp;<span class=""><%= dispute.isMHPTA() ? 'MHPTA' : 'RTA' %></span>
          </div>
        </div>
        <div class="">
          <div class="">
            <span class="review-label">Process:</span>&nbsp;<span class=""><%= Formatter.toProcessDisplay(dispute.getProcess()) %></span>
          </div>
          <div class="">
            <span class="review-label">Associated file number:</span>&nbsp;<span class=""><%= dispute.get('cross_app_file_number') || '-'  %></span>
          </div>
          <div class="">
            <span class="review-label">Date received:</span>&nbsp;<span class=""><%= dispute.get('submitted_date') ? Formatter.toDateDisplay(dispute.get('submitted_date')) : '-' %></span>
          </div>
        </div>
      </div>
    </div>
    <div class="office-page-new-dispute-section">
      <div class="office-page-new-dispute-section-title">Dispute Address</div>
      <div class="office-page-flex-container office-page-new-dispute-static-info-address">
        <div class="">
          <%= addressDisplay ? addressDisplay : '-' %>
        </div>
      </div>
    </div>

    <div class="office-page-new-dispute-section">
      <div class="office-page-new-dispute-section-title">Primary Applicant</div>
      <div class="office-page-flex-container office-page-new-dispute-static-info-general">
        <% if (primaryApplicant) { %>
          <div class="">
            <div class="">
              <span class="review-label">Type:</span>&nbsp;<span class=""><%= primaryApplicant.getTypeDisplay() %></span>
            </div>
            <div class="">
              <span class="review-label"><%= isBusiness ? 'Business ' : '' + 'Name' %>:</span>&nbsp;<span class=""><b><%= primaryApplicant.getDisplayName() %></b></span>
            </div>
            <% if (isBusiness && !isPrivateMode) { %>
              <div class="">
                <span class="review-label">Business Contact Name:</span>&nbsp;<span class=""><%= primaryApplicant.getContactName() %></span>
              </div>
            <% } %>
            <div class="">
              <span class="review-label">Access code:</span>&nbsp;<span class=""><%= primaryApplicant.get('access_code') %></span>
            </div>
          </div>
          <div class="">
            <div class="">
              <span class="review-label">Phone number:</span>&nbsp;<span class=""><%= primaryApplicant.get('primary_phone') %></span>
            </div>
            <div class="">
              <span class="review-label">Email address:</span>&nbsp;<span class=""><%= primaryApplicant.get('email') ? primaryApplicant.get('email') : '-' %></span>
            </div>
            <div class="">
              <span class="review-label">Hearing options by:</span>&nbsp;<span class=""><%= Formatter.toHearingOptionsByDisplay(primaryApplicant.get('package_delivery_method')) %></span>
            </div>
          </div>
        <% } else { %>
          <div class="">No primary applicant found.</div>
        <% } %>
      </div>
    </div>
  </div>


  <div class="da-upload-page-wrapper <%= isUpload ? 'upload' : '' %>">
    <div class="office-page-step-container <%= isUpload ? 'hidden' : '' %>">
      <div class="office-page-step-icon"></div>
      <div class="">
        <b>Step 2:</b>&nbsp;<span>Upload the application form(s) and supporting evidence separately below.</span>
      </div>
    </div>

    <div class="">
      <div class="office-page-flex-container office-page-new-dispute-date-received-container <%= isUpload ? 'hidden' : '' %>">
        <div class="office-new-dispute-date-received"></div>
        <div class="">Leave this date as today unless you are submitting an application late that was received in the past.</div>
      </div>
      <div class="office-application-note <%= isUpload ? 'hidden' : '' %>"></div>

      <div class="office-page-new-dispute-section">
        <div class="office-page-new-dispute-section-title <%= isUpload ? 'hidden' : '' %>">Application Form(s)</div>
        
        <div class="office-page-new-dispute-form-evidence"></div>
        <p class="error-block office-form-evidence-error"></p>
      </div>

      <div class="office-page-new-dispute-section">
        <div class="office-page-new-dispute-section-title <%= isUpload ? 'hidden' : '' %>">Supporting Evidence</div>

        <div class="office-page-new-dispute-bulk-evidence"></div>
        <p class="error-block office-bulk-evidence-error"></p>
      </div>
    </div>

    <div class="office-sub-page-buttons">
      <div class="all-file-upload-ready-count <%= isUpload ? 'hidden' : ''%>">
        <b class="glyphicon glyphicon-download"></b>&nbsp;<span class="file-upload-counter">0</span>&nbsp;ready to submit
      </div>  
      <button class="btn btn-lg btn-cancel <%= isUpload ? 'da-upload-cancel-button' : '' %>"><%= isUpload ? 'Cancel Remaining' : (isPrivateMode ? 'Cancel' : 'Create File to complete later') %></button>
      <button class="btn btn-lg btn-standard btn-continue <%= isUpload ? 'hidden' : '' %>">Upload and continue</button>
    </div>
  </div>
  
</div>