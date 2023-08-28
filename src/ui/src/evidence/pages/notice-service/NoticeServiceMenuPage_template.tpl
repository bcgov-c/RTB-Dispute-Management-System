<div class="dac__service__dispute-overview"></div>

<div class="dac__page-header-container">
  <div class="dac__page-header">
    <span class="dac__page-header__icon dac__icons__menu__service"></span>
    <span class="dac__page-header__title"><%= pageTitle %></span>
  </div>
</div>
<div class="dac__page-header__instructions">
  
  <% if (!disableProgressBar) { %>
    <div class="access-issue-progress-bar-container da-update-notice-service-progress-bar-container clearfix">
      <div class="access-issue-progress-bar da-update-notice-service-progress-bar">
        <div class="access-issue-progress-bar-fill" role="progressbar" style="width:<%= numServedServices / totalNumServices * 100 %>%">
        </div>
      </div>
      <div class="da-update-notice-service-progress-text"><b><%= numServedServices + ' / ' + totalNumServices %>&nbsp;Complete</b></div>
    </div>
  <% } %>

  <%= pageInstructionsHtml %>

  <div class="da-notice-service-list"></div>

  <% if (enableSkipService) { %>
    <div class="error-block warning hidden-print">
      We recommend serving all respondents that you want included in any orders. But now that you have served one respondent, you have the option to continue with your dispute without serving the other respondents.
      &nbsp;<span class="general-link da-notice-service-skip">Review this option here</span>.
    </div>
  <% } %>
</div>

<div class="spacer-block-30"></div>
<div class="dac__page-buttons hidden-print">
  <button type="button" class="btn btn-lg btn-standard">Main Menu</button>
  <span class="receipt-logout-btn">Logout</span>
</div>
<div class="spacer-block-10"></div>