<div class="dac__service__dispute-overview"></div>

<div class="dac__page-header-container">
  <div class="dac__page-header">
    <span class="dac__page-header__icon dac__icons__menu__service"></span>
    <span class="dac__page-header__title">Record service of dispute notice</span>
  </div>
</div>
<div class="dac__page-header__instructions">
  <div class="step-description">Adding service information for:</div>
  <div class="add-service-info-for-container">
    <div class="notice-service-initials-icon"></div>
    <div class="da-notice-tenant-initials-access-code-container">
      <div class="da-notice-service-modify-initials"><b><%= participant_label%></b>:&nbsp;Initials&nbsp;<b><%=participant.getInitialsDisplay() %></b></div>
      <div class="da-notice-service-modify-access-code">(Access Code&nbsp;<%= participant.get('access_code') %>)</div>
    </div>
  </div>
</div>

<div class="spacer-block-30"></div>
<div class="step-description">What method of service was used to serve the dispute notice to&nbsp;
  <b><%= participant_label + ' ' + participant.getInitialsDisplay() %></b>?
</div>
<div class="da-notice-service-method"></div>

<div class="da-notice-service-comment"></div>

<div class="spacer-block-10"></div>
<div class="step-description">When was the dispute notice served to&nbsp;
  <b><%= participant_label + ' ' + participant.getInitialsDisplay() %></b>?
</div>
<div class="da-notice-service-delivered-date"></div>

<div class="spacer-block-10"></div>
<div class="step-description">
  Upload your proof that&nbsp;<b><%= participant_label + ' ' + participant.getInitialsDisplay() %></b>&nbsp;was served below
  <span><a role="button" class="badge help-icon">?</a></span>
</div>
<div class="da-notice-service-add-files-container">
  <label class="da-upload-add-button da-upload-add-evidence-button">Add /Edit files</label>
  <div class="da-notice-service-files"></div>

  <div class="">
    <p class="error-block"></p>
  </div>
</div>

<div class="spacer-block-30"></div>
<div class="dac__page-buttons hidden-print">
  <button type="button" class="btn btn-lg btn-cancel"><span>Cancel</span></button>
  <button type="button" class="btn btn-lg btn-standard btn-update-notice-service"><span>Submit Service Record</span></button>
</div>
<div class="spacer-block-10"></div>
