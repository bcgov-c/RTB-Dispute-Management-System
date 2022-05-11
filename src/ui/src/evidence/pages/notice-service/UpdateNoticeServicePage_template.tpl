<div class="dac__service__dispute-overview"></div>

<div class="dac__page-header-container">
  <div class="dac__page-header">
    <span class="dac__page-header__icon dac__icons__menu__service"></span>
    <span class="dac__page-header__title">Record service of dispute notice</span>
  </div>
</div>
<div class="dac__page-header__instructions">
  <div class="access-issue-progress-bar-container da-update-notice-service-progress-bar-container clearfix">
    <div class="access-issue-progress-bar da-update-notice-service-progress-bar">
      <div class="access-issue-progress-bar-fill" role="progressbar" style="width:<%= numServedServices / totalNumServices * 100 %>%">
      </div>
    </div>
    <div class="da-update-notice-service-progress-text"><b><%= numServedServices + ' / ' + totalNumServices %>&nbsp;Complete</b></div>
  </div>

  <div class="da-update-contact-service-info-header">Add your service information for each respondent below</div>
  <div class="da-update-contact-service-info-desc">
    This dispute will not continue until the notice of dispute has been recorded for all respondents. If you are having trouble serving the dispute notice
    using the allowed methods, you can contact us and request special service instructions. For privacy reasons only the initials and access code are 
    displayed for each respondent. The full names and access codes are listed in the notice of dispute.
  </div>

  <div class="da-notice-service-list"></div>

  <div class="error-block warning <%= enableSkipService ? '' : 'hidden' %> hidden-print">
    Now that you have served one respondent you have the option to continue with your dispute file without serving the remaining respondent(s). You are advised to serve all respondents that you want included in any orders associated to your dispute.&nbsp;<span class="general-link da-notice-service-skip">Review this option here</span>.
  </div>
</div>

<div class="spacer-block-30"></div>
<div class="dac__page-buttons hidden-print">
  <button type="button" class="btn btn-lg btn-standard">Main Menu</button>
  <span class="receipt-logout-btn">Logout</span>
</div>
<div class="spacer-block-10"></div>