<div class="office-top-main-instructions"></div>
<% if (!isUpload) { %>
  <div class="office-top-main-content-container"></div>
  <div class="da-access-overview-container"></div>
<% }%>

<div class="office-sub-page-view">
  <div class="da-page-header-title">
    <span class="da-page-header-icon da-access-menu-icon"></span>
    <span class="da-page-header-title-text"><%= isUpload ? 'Uploading files please wait' : requestTitle %></span>
  </div>
  <div class="da-upload-instructions <%= isUpload ? '' : 'hidden' %>">
    File&nbsp;<b class="da-upload-overall-file-progress"></b>&nbsp;is being uploaded to file number&nbsp;<b><%= fileNumber %></b>.  When all files have uploaded, you will be provided with a submission receipt for your records.
  </div>


  <div class="office-clarification-access-code-container <%= isUpload ? 'hidden' : '' %>">
    <div class="">Submitted For: <%= accessCodeForDisplay %> <i>To switch to another user, login with their access code.</i></div>
  </div>

  <div class="office-clarification-input-fields-container <%= showFormContent ? '' : 'hidden' %>">
    <div class="office-page-new-dispute-section <%= isUpload ? 'hidden' : '' %>">
      <div class="office-page-new-dispute-section-title">Requester Information</div>

      <div class="office-page-flex-container office-clarification-participant-container">
        <div class="office-new-dispute-first-name"></div>
        <div class="office-new-dispute-last-name"></div>
        <div class="office-new-dispute-phone"></div>
        <div class="office-new-dispute-email"></div>
        <div class="office-new-dispute-package-method"></div>
      </div>

      <div class="office-page-flex-container office-clarification-address-container">
        <div class="office-clarification-address"></div>
      </div>

      <div class="office-doc-request"></div>

      <div class="office-new-dispute-applicant-forms-container">
        <div class="office-page-flex-container office-new-dispute-rtb-dropdown-container clearfix <%= isUpload ? 'hidden' : '' %>">
          <div class="office-clarification-date-received"></div>
          <div class="">Date the decision/order was received</div>
        </div>

        <div class="office-review-questions-container <%= isReview ? '' : 'hidden' %>">
          <div class="office-review-question-one-container office-page-flex-container clearfix">
            <div class="office-review-question-one"></div>
            <div class="office-review-question-text">Is this a decision or order(s) that relates to an Order of Possession, a notice to end tenancy for unpaid rent or an unreasonable denial of sublet or assignment by a landlord?</div>
          </div>

          <div class="office-page-flex-container clearfix <%= showQuestionTwo ? '' : 'hidden' %>">
            <div class="office-review-question-two"></div>
            <div class="office-review-question-text">Is this a decision or order(s) that relates to repairs/maintenance, restricted services/facilities or a notice to end tenancy that is&nbsp;<b>not</b>&nbsp;for unpaid rent?</div>
          </div>
        </div>

        <div class="office-page-flex-container office-new-dispute-rtb-dropdown-container clearfix <%= isUpload ? 'hidden' : '' %>">
          <div class="office-clarification-date-submitted"></div>
          <div class="">Leave this date as today unless you are submitting this request late (it was received in the past).</div>
        </div>
        <div class="office-review-late-filing <%= isFiledLate ? '' : 'hidden' %>">
          <div class="error-block warning">
            Warning: An Application for Review Consideration should be submitted by <%= lateFilingRulesDateDisplay %>, which is <%= lateDays %> days 
            after you received the decision or order. You must submit proof you were unable to submit the Application for Review Consideration before the deadline due to exceptional circumstances.
          </div>
          <div class="office-page-flex-container clearfix">
            <div class="office-review-late-request"></div>
            <div class="office-late-request-text">
              Explain the warning above to the person filing this request and validate that the form includes the reason they are filing late.
              Does the form include late filing reasons and does the applicant accept the above late filing risks?
            </div>
          </div>
        </div>

        <div class="office-page-clarification-date-warning-container <%= showDateWarning ? '' : 'hidden' %>">
          <div class="office-page-clarification-date-warning error-block warning"><%= dateWarningMsg %></div>
          <div class="office-page-flex-container office-new-dispute-rtb-dropdown-container clearfix">
            <div class="office-page-clarification-date-warning-dropdown"></div>
            <div class=""><%= dateContinueMsg %></div>
          </div>
        </div>

        <div class="office-doc-request-item"></div>
        
        <div class="office-page-flex-container office-new-dispute-rtb-dropdown-container clearfix">
          <div class="office-clarification-form-complete"></div>
          <div class="">Does the information on the application appear complete and is the declaration signed?</div>
        </div>

        <div class="office-application-note"></div>
      </div>
    </div>

    <div class="da-upload-page-wrapper <%= isUpload ? 'upload' : '' %>">
      <div class="office-page-new-dispute-section">
        <div class="office-page-new-dispute-section-title office-clarification-forms-section <%= isUpload ? 'hidden' : '' %>">Application Form(s)</div>
        
        <div class="office-page-new-dispute-form-evidence"></div>
        <p class="error-block office-form-evidence-error"></p>
      </div>

      <div class="office-page-new-dispute-section <%= enablePayments ? '' : 'hidden' %>">
        <div class="office-page-new-dispute-section-title <%= isUpload ? 'hidden' : '' %>">Payments</div>

        <div class="<%= isUpload ? 'hidden' : '' %>">
          <div class="office-page-payment-details">
            <div class="">
              <span class="review-label">Payment for:</span>&nbsp;<span><%= paymentTypeDisplay ? paymentTypeDisplay : '-' %></span>
            </div>
            <div class="">
              <span class="review-label">Total amount due:</span>&nbsp;<span><%= paymentAmountDisplay ? paymentAmountDisplay : '-' %></span>
            </div>
          </div>
    
          <div class="office-page-flex-container office-page-new-dispute-pay-options-container <%= feeIsInitiallyPaid ? 'hidden': '' %>">
            <div class="">Payment must be made with the application. Please select a method of payment below (fee waiver only available to tenant applications)</div>
            <div class="office-page-new-dispute-payment-type"></div>
          </div>
        </div>

        <div class="office-page-new-dispute-payment-office-container <%= isUpload ? 'hidden' : '' %> <%= isOfficeMode ? '' : 'hidden-item' %>">
          <div class="office-payment-name"></div>
          <div class="office-payment-amount"></div>
          <div class="office-payment-method"></div>
        </div>
        
        <div class="office-page-new-dispute-payment-fee-waiver-container <%= isFeeWaiverMode ? '' : 'hidden-item' %>">
          <div class="office-page-new-dispute-payment-fee-waiver"></div>
        </div>

      </div>
    </div>

  </div>

  <div class="office-sub-page-buttons office-page-clarification-buttons <%= hideMainButtons ? 'hidden' : '' %>">
    <div class="all-file-upload-ready-count <%= isUpload || !showFormContent ? 'hidden' : ''%>">
      <b class="glyphicon glyphicon-download"></b>&nbsp;<span class="file-upload-counter">0</span>&nbsp;ready to submit
    </div>
    <button class="btn btn-lg btn-cancel"><%= isUpload ? 'Cancel Remaining' : 'Cancel' %></button>
    <button class="btn btn-lg btn-standard btn-continue <%= showFormContent && !isUpload ? '' : 'hidden' %>">Submit and View Receipt</button>
  </div>
  
</div>