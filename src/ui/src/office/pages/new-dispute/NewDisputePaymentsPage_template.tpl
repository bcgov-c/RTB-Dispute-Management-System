<div class="office-top-main-instructions"></div>
<% if (!isUpload) { %>
  <div class="office-top-main-content-container"></div>
  <div class="da-access-overview-container"></div>
<% } %>

<div class="office-sub-page-view">
  <div class="da-page-header-title">
    <span class="da-page-header-icon da-access-menu-icon"></span>
    <span class="da-page-header-title-text"><%= isUpload ? 'Uploading fee waiver proof please wait' :
        (isPrivateMode ? 'Resume Paper Application' : 'Submit New Paper Application') %></span>
  </div>
  
  <div class="office-new-dispute-previous-info <%= isUpload ? 'hidden' : '' %>">
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

    <div class="office-page-new-dispute-section">
      <div class="office-page-new-dispute-section-title">Application Form(s)</div>
      <div class=""><strong><%= formTitleDisplay %></strong></div>
      <div class=""><%= formDescriptionDisplay ? formDescriptionDisplay : '-' %></div>
      <div class="office-page-new-dispute-payments-files">File(s) submitted:&nbsp;<%= formFilesDisplay ? formFilesDisplay : '-' %></div>
    </div>

    <div class="office-page-new-dispute-section office-page-new-dispute-bulk-files-section">
      <div class="office-page-new-dispute-section-title">Supporting Evidence</div>
      <div class="office-page-new-dispute-payments-files">File(s) submitted:&nbsp;<%= bulkFilesDisplay ? bulkFilesDisplay : '-' %></div>
    </div>

  </div>

  <div class="">
    <div class="office-page-step-container <%= isUpload ? 'hidden' : '' %>">
      <div class="office-page-step-icon"></div>
      <div class="">
        <b>Step 3:</b>&nbsp;<span>Complete payment</span>
      </div>
    </div>

    <div class="<%= isUpload ? 'hidden' : '' %>">
      <div class="office-page-payment-details">
        <div class="">
          <span class="review-label">Payment for:</span>&nbsp;<span><%= paymentTypeDisplay ? paymentTypeDisplay : '-' %></span>
        </div>
        <div class="">
          <span class="review-label">Total amount due:</span>&nbsp;<span><%= paymentAmountDisplay ? paymentAmountDisplay : '-' %></span>
        </div>
      </div>

      <div class="">
        Complete payment now?  Note: payment must be made in 3 days or this application will be abandoned.
      </div>

      <div class="office-page-flex-container office-page-new-dispute-pay-options-container">
        <div class="office-page-new-dispute-pay-now"></div>
        <div class="office-page-new-dispute-payment-type <%= showPaymentOptions ? '' : 'hidden-item' %>"></div>
      </div>

    </div>

    <div class="office-page-new-dispute-payment-warning error-block warning hidden-item <%= isUpload ? 'hidden' : '' %>"></div>

    <div class="office-page-new-dispute-payment-office-container <%= isUpload ? 'hidden' : '' %> <%= isOfficeMode ? '' : 'hidden-item' %>">
      <div class="office-payment-name"></div>
      <div class="office-payment-amount"></div>
      <div class="office-payment-method"></div>
    </div>
    
    <div class="office-page-new-dispute-payment-fee-waiver-container da-upload-page-wrapper <%= isUpload ? 'upload' : '' %> <%= isFeeWaiverMode ? '' : 'hidden-item' %>">
      <div class="office-page-new-dispute-payment-fee-waiver"></div>
    </div>

    <div class="office-sub-page-buttons">
      <button class="btn btn-lg btn-standard btn-continue <%= isFeeWaiverMode ? 'hidden' : '' %>">Submit and View Receipt</button>
    </div>
  </div>
  
</div>