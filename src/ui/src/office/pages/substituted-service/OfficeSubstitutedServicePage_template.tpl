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
    <div class="error-block warning <%= noRespondents ? '' : 'hidden' %>" style="margin-top:15px;">
      This dispute does not have any respondents in the digital file.  This is likely caused by a paper application that has not yet been processed by the Residential Tenancy Branch.  For more information or support with this message, contact the RTB.
    </div>

    <div class="<%= noRespondents ? 'hidden' : '' %>">
      <div class="">Submitted For: <%= accessCodeForDisplay %> <i>To switch to another user, login with their access code.</i></div>
    </div>
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
      
    </div>
    <div class="office-page-new-dispute-section <%= isUpload ? 'hidden' : '' %>">
      <div class="office-page-new-dispute-section-title">Substitute Serviced Documents</div>
      <div class="">Please have the submitter validate that they are serving the following:</div>

      <p class="office-substitute-docs-header"><%= documentHeader %></p>
      <div><%= documentListHtml %></div>     

      <div class="office-page-flex-container">
        <div class="office-correct-documents-used"></div>
        <div class="office-correct-documents-used-label">Are these the documents the submitter is requesting substituted service for?</div>
      </div>

      <div class="office-page-flex-container">
        <div class="office-documents-described-wrapper <%= displayDocumentsDescribed ? '' : 'hidden' %>">
          <div class="office-documents-described"></div>
          <div class="office-documents-described-label">Does the application form include a description of the specific documents they are seeking substituted service for?</div>
        </div>
      </div>
      <p class="office-documents-described-error error-block <%= displayDocumentsDescribedError ? '' : 'hidden' %>">The form must include a description of other documents when standard documents are not being requested</p>

      <div class="office-page-new-dispute-section-title office-substitute-for-section">Substitute Service For</div>

      <div class="office-substitute-participant-being-served"></div>

      <div class="office-page-new-dispute-section-title">Form Completeness Validation</div>

      <div class="office-page-flex-container clearfix">
        <div class="office-page-flex-container office-new-dispute-rtb-dropdown-container clearfix">
          <div class="office-new-dispute-rtb-form-used"></div>
          <div class="">Was the correct form used?&nbsp;Expected Form:&nbsp;<b><%= expectedFormDisplay ? expectedFormDisplay : 'None' %></b></div>
        </div>
      </div>

      <div class="office-page-flex-container office-new-dispute-rtb-dropdown-container clearfix">
        <div class="office-substitute-form-complete"></div>
        <div class="">Is the substituted method of service they are requesting described and is the form declaration signed?</div>
      </div>

      <div class="office-page-flex-container office-new-dispute-rtb-dropdown-container clearfix">
        <div class="office-substitute-evidence-provided"></div>
        <div class="">Does the application include proof that the method they are requesting will work (evidence)?</div>
      </div>

      <div class="office-page-clarification-date-warning-container <%= hasEvidenceProvidedWarning ? '' : 'hidden' %>">
        <div class="office-page-clarification-date-warning error-block warning">Warning: A substituted service request is unlikely to be granted if you do not provide proof (evidence) that the requested method will work. It is highly recommended that all substituted service requests are submitted with proof that the method will work.</div>
        <div class="office-page-flex-container office-new-dispute-rtb-dropdown-container clearfix">
          <div class="office-page-evidence-provided-warning-dropdown"></div>
          <div class="">Explain the warning above to the person filing this request.  Would they like to continue?</div>
        </div>
      </div>

      <div class="office-page-flex-container office-new-dispute-rtb-dropdown-container clearfix">
        <div class="office-clarification-date-received"></div>
        <div class="">Leave this date as today unless you are submitting this request late (it was received in the past).</div>
      </div>

      <div class="office-application-note"></div>
    </div>

    <div class="da-upload-page-wrapper <%= isUpload ? 'upload' : '' %>">
      <div class="office-page-new-dispute-section">
        <div class="office-page-new-dispute-section-title office-clarification-forms-section <%= isUpload ? 'hidden' : '' %>">Application Form(s)</div>
        
        <div class="office-page-new-dispute-form-evidence"></div>
        <p class="error-block office-form-evidence-error"></p>
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