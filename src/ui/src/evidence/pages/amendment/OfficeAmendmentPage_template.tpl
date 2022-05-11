<div class="da-access-overview-container"></div>

<div class="office-sub-page-view">
  <div class="da-page-header-title">
    <span class="da-page-header-icon da-access-menu-icon"></span>
    <span class="da-page-header-title-text"><%= isUpload ? 'Uploading files please wait' : requestTitle %></span>
  </div>
  <div class="da-upload-instructions <%= isUpload ? '' : 'hidden' %>">
    File&nbsp;<b class="da-upload-overall-file-progress"></b>&nbsp;is being uploaded to file number&nbsp;<b><%= fileNumber %></b>.  When all files have uploaded, you will be provided with a submission receipt for your records.
  </div>

  <div class="office-clarification-input-fields-container">
    <div class="office-page-new-dispute-section <%= isUpload ? 'hidden' : '' %>">
      <div class="office-clarification-access-code-container <%= isUpload ? 'hidden' : '' %>">
        <div class="">Amendment for: <%= accessCodeForDisplay %></div>
      </div>

      <div class="da-notice-service-question-text">
        Provide the contact information for the person that is submitting this amendment so that the Residential Tenancy Branch can contact you if there are any issues or questions with this request.
      </div>

      <div class="office-page-flex-container office-clarification-participant-container">
        <div class="office-new-dispute-first-name"></div>
        <div class="office-new-dispute-last-name"></div>
        <div class="office-new-dispute-phone"></div>
        <div class="office-new-dispute-email"></div>        
      </div>

      <div class="office-page-flex-container office-clarification-address-container">
        <div class="office-clarification-address"></div>
      </div>

      <div class="da-notice-service-question-text">
        Please indicate how you would like to receive any documents associated to this request from the Residential Tenancy Branch?
      </div>
      <div class="office-new-dispute-package-method"></div>
    </div>

    <div class="da-upload-page-wrapper <%= isUpload ? 'upload' : '' %>">
      <div class="office-page-new-dispute-section">
        <div class="da-notice-service-question-text <%= isUpload ? 'upload' : '' %>">
          Have you completed and signed the correct amendment request form&nbsp;<b>RTB-42T</b>&nbsp;or&nbsp;<b>RTB-42O</b>?
        </div>
        <div class="office-amendment-request-form-question <%= isUpload ? 'upload' : '' %>"></div>

        <div class="office-amendment-request-form-container <%= showFormEvidence ? '' : 'hidden-item' %>">
          <div class="">Select the file(s) for your amendment application form below to add them to your submission</div>
          <div class="office-page-new-dispute-form-evidence"></div>
          <p class="error-block office-form-evidence-error"></p>
        </div>
      </div>

      <div class="office-page-new-dispute-section" style="margin-top:100px;">
        <div class="da-notice-service-question-text <%= isUpload ? 'upload' : '' %>">
          Are you also submitting evidence to support changes to issues in the amendment form?
        </div>
        <div class="office-amendment-bulk-evidence-question <%= isUpload ? 'upload' : '' %>"></div>

        <div class="office-amendment-bulk-evidence-container <%= showBulkEvidence ? '' : 'hidden-item' %>">
          <div class="">Select the evidence file(s) to add them to your submission</div>
          <div class="office-page-new-dispute-bulk-evidence"></div>
        </div>
      </div>
    </div>

  </div>

  <div class="office-sub-page-buttons office-page-clarification-buttons">
    <div class="all-file-upload-ready-count <%= isUpload ? 'hidden' : ''%>">
      <b class="glyphicon glyphicon-download"></b>&nbsp;<span class="file-upload-counter">0</span>&nbsp;ready to submit
    </div>
    <button class="btn btn-lg btn-cancel"><%= isUpload ? 'Cancel Remaining' : 'Cancel' %></button>
    <button class="btn btn-lg btn-standard btn-continue <%= !isUpload ? '' : 'hidden' %>">Submit and View Receipt</button>
  </div>
</div>
