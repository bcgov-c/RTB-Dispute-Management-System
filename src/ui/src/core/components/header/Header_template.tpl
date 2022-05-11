<div
  class="banner"
  <%= isDevOrTest ? 'style="background-color: #9f5824;"' : '' %>
>
  <div class="<%= hideHeaderInner ? '' : 'header-inner' %>">
    <a class="<%= showHeaderProblemButton ? '' : 'hidden-item' %> header-support-modal-icon static-external-link pull-right"
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
  <div class="subbannertext">
    <span><%= headerText %></span>
    <span class="mobile-menu-container <%= disabledMobileMenu ? 'hidden': ''%>"><div class="mobile-menu"></div></span>
    <% if (isLoggedIn && showLogout) { %>
      <span class="header-logout-link">Logout</span>
      <div class="header-user-container">
        <div>Welcome:&nbsp;</div>
        <div class="header-user-name"><%= userName %></div>
      </div>
    <% } %>
  </div>
</div>
