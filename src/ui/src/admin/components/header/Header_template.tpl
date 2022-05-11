<div
  class="banner"
  <%= isDevOrTest ? 'style="background-color: #9f5824;"' : '' %>
>
  <div class="bannerlogo">
    <img src="<%= require('../../../../'+WEBPACK_HEADER_LOGO_PATH) %>" alt="Test logo" />
  </div>
</div>
<div class="header-separator"></div>
  <div class="sub-banner">
  <div class="subbannertext">
    <span>DMS Case - Residential Tenancies</span>
    <% if (isLoggedIn) { %>
      <span class="header-logout-link">Logout</span>
      <div class="header-user-container">
        <div>Welcome:&nbsp;</div>
        <div class="header-user-name"><%= userName %></div>
      </div>
    <% } %>
  </div>
</div>
