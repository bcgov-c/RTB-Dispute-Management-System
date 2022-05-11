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

      <div class="office-new-dispute-applicant-forms-container">
        <div class="office-page-flex-container clearfix">
          <div class="office-amendment-form-used-label"></div>
          <div class="office-page-flex-container office-new-dispute-rtb-dropdown-container clearfix">
            <div class="office-new-dispute-rtb-form-used"></div>
            <div class="">Was the correct form used?&nbsp;Expected Form:&nbsp;<b><%= expectedFormDisplay ? expectedFormDisplay : 'None' %></b></div>
          </div>
        </div>

        <div class="office-page-flex-container office-new-dispute-rtb-dropdown-container clearfix">
          <div class="office-clarification-form-complete"></div>
          <div class="">Is at least 1 amendment selected on the form and is the declaration signed?</div>
        </div>

        <div class="office-page-flex-container office-new-dispute-rtb-dropdown-container clearfix">
          <div class="office-clarification-date-received"></div>
          <div class="">Leave this date as today unless you are submitting this request late (it was received in the past).</div>
        </div>

        <div class="office-page-flex-container office-new-dispute-rtb-dropdown-container clearfix">
          <div class="office-clarification-time-received"></div>
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
      <div class="office-page-new-dispute-section">
        <div class="office-page-new-dispute-section-title office-clarification-forms-section <%= isUpload ? 'hidden' : '' %>">Supporting Evidence</div>

        <div class="office-page-new-dispute-bulk-evidence"></div>
      </div>

    </div>

  </div>

  <div class="office-sub-page-buttons office-page-clarification-buttons">
    <div class="all-file-upload-ready-count <%= isUpload || !showFormContent ? 'hidden' : ''%>">
      <b class="glyphicon glyphicon-download"></b>&nbsp;<span class="file-upload-counter">0</span>&nbsp;ready to submit
    </div>
    <button class="btn btn-lg btn-cancel"><%= isUpload ? 'Cancel Remaining' : 'Cancel' %></button>
    <button class="btn btn-lg btn-standard btn-continue <%= showFormContent && !isUpload ? '' : 'hidden' %>">Submit and View Receipt</button>
  </div>
  
</div>