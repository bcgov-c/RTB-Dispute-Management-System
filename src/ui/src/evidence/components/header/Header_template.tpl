<div
  class="banner"
  <%= isDevOrTest ? 'style="background-color: #9f5824;"' : '' %>
>
  <div class="header-inner">
    <a class="<%= disableProblemButton ? 'hidden-item' : '' %> header-support-modal-icon static-external-link pull-right"
      href="javascript:;"
      url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/contact-the-residential-tenancy-branch"
    >
      Problem?
    </a>
    <div class="bannerlogo">
      <img src="<%= require('../../../../'+WEBPACK_HEADER_LOGO_PATH) %>" alt="Test logo" />
    </div>
  </div>
</div>
<div class="header-separator"></div>
  <div class="sub-banner">
      <div class="header-inner">
        <div class="subbannertext">
          <span>Residential Tenancies - Dispute Access</span>
        </div>
      </div>
  </div>
</div>