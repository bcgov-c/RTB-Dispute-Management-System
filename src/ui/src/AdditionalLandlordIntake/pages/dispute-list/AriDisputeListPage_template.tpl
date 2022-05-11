
  <div class="dispute-list-login-name-container clearfix">
    <div class="dispute-list-login-name">
      <span>Welcome:&nbsp;</span>
      <span class="dispute-list-login-username"><%= username %></span>
      <span>&nbsp;-&nbsp;</span>
      <a href ="javascript:;" class="appplication-logout">Logout</a></span>
    </div>

    <div class="">
      <a
          class="dispute-list-alternate-link general-link <%= alternateIntakeLink ? '' : 'hidden' %>"
          href="javascript:;">
        Submit and view standard applications (landlords and tenants)
      </a>
    </div>
  </div>

  <div class="dispute-list-ari-start-container clearfix">
    <div class="dispute-list-ari-start-text">To start a new landlord application, select the type below:</div>
    <div class="ari-start-radio"></div>
    <div class="">
      <button class="btn dispute-list-btn-actions dispute-list-start">Start new application</btn>
    </div>
  </div>

  <% if (showAriDisputes) { %>
  <div class="dispute-list-disputes-container clearfix">
    <div class="dispute-list-container-title">Additional Rent Increase for Capital Expenditures</div>
    <div class="dispute-list-container" id="ari-disputes"></div>
  </div>
  <% } %>

  <% if (showPfrDisputes) { %>
  <div class=" dispute-list-disputes-container clearfix">
    <div class="dispute-list-container-title">Possession for Renovations</div>
    <div class="dispute-list-container" id="renovation-disputes"></div>
  </div>
  <% } %>

