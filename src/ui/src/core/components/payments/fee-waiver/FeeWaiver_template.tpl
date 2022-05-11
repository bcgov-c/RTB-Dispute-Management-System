
<div class="da-upload-instructions <%= isUpload ? '' : 'hidden' %>">
  File&nbsp;<b class="da-upload-overall-file-progress"></b>&nbsp;is being uploaded to file number&nbsp;<b><%= fileNumber %></b>.  When all files have uploaded, you will be provided with a submission receipt for your records.
</div>
<div class="office-page-payment-contents office-page-fee-waiver-step1 <%= isUpload ? 'hidden' : '' %>">
  <div class="office-page-step-container <%= isStep1 ? '' : 'hidden' %>">
    <div class="office-page-step-icon"></div>
    <div class="">
      <b>Step 1:</b>&nbsp;<span><%= step1TitleText %></span>
    </div>
  </div>
  <div class="office-page-payment-instructions">
    <%= step1DescriptionText %>
  </div>

  <div class="office-page-payment-details <%= showPaymentDetails ? '' : 'hidden' %>">
    <div class="">
      <span class="review-label">Payment for:</span>&nbsp;<span><%= paymentTypeDisplay ? paymentTypeDisplay : '-' %></span>
    </div>
    <div class="">
      <span class="review-label">Amount being waived:</span>&nbsp;<span><%= paymentAmountDisplay ? paymentAmountDisplay : '-' %></span>
    </div>
  </div>

  <div class="office-payment-name"></div>

  <div class="step-description">What is the total number of tenants and their family members or dependents living in this rental unit or site?</div>
  <div class="office-fee-waiver-family"></div>
  
  <div class="step-description">What is the total monthly income before deductions of all tenants and family members or dependents listed above?</div>
  <div class="office-fee-waiver-income"></div>

  <div class="step-description">What is the size or population of the city, town or community where the rental address is located?</div>
  <div class="office-fee-waiver-city"></div>

  <div class="office-fee-waiver-confirm"></div>

  <div class="office-page-error-block error-red <%= isDeclined ? '' : 'hidden' %>">
    <%= feeWaiverDeclinedText %>
  </div>

  <div class="office-sub-page-buttons <%= isStep1 ? '' : 'hidden' %>">
    <div class="<%= isDeclined ? 'hidden' : '' %>">
      <button class="btn btn-lg btn-cancel">Cancel</button>
      <button class="btn btn-lg btn-standard btn-continue btn-step1-validate">
        <span class="visible-xs">Verify & Continue</span>
        <span class="hidden-xs">Verify and Continue</span>
      </button>
    </div>

    <div class="office-fee-waiver-declined-controls <%= isDeclined && !hideButtonsWhenDeclined ? '' : 'hidden' %>">
      <button class="btn btn-lg btn-cancel">Cancel Payment</button>
      <button class="btn btn-lg btn-standard btn-continue btn-step1-office">Record Front Desk Payment</button>
    </div>
  </div>
</div>

<div class="office-page-payment-contents office-page-fee-waiver-step2 <%= isStep2 ? '' : 'hidden' %>">
  <div class="<%= isUpload ? 'hidden' : '' %>">
    <div class="office-page-fee-waiver-step-container">
      <div class="office-page-fee-waiver-step-icon"></div>
      <div class="">
          <b>Step 2:</b>&nbsp;<span><%= step2TitleText %></span>
      </div>
    </div>
    <p>
      <%= step2DescriptionText %>
    </p>
  </div>

  <div class="office-page-fee-waiver-evidence-container">
    <div class="office-page-fee-waiver-evidence"></div>
    <p class="error-block"></p>
  </div>

  <div class="office-sub-page-buttons <%= hideUploadControls ? 'hidden' : '' %>">
    <div class="all-file-upload-ready-count <%= isUpload ? 'hidden' : ''%>">
      <b class="glyphicon glyphicon-download"></b>&nbsp;<span class="file-upload-counter">0</span>&nbsp;ready to submit
    </div>
    <div class="">
      <button class="btn btn-lg btn-cancel <%= isUpload ? 'da-upload-cancel-button' : (hideCancelButtonBeforeUploads ? 'hidden' : '') %>"><%= isUpload ? 'Cancel Remaining' : 'Cancel' %></button>
      <button class="btn btn-lg btn-standard btn-continue btn-submit <%= isUpload ? 'hidden' : '' %>"><%= submitButtonText %></button>
    </div>
  </div>
</div>

