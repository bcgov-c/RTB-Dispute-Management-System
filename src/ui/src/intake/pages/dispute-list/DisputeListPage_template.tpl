
<div class="row">
  <div class="col-xs-12 col-sm-8 dispute-list-login-name-container">
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
        Submit and view additional landlord applications (for landlords only)
      </a>
    </div>
  </div>
  <div class="col-sm-4 dispute-list-start-container">
    <button class="btn dispute-list-btn-actions dispute-list-start pull-right">Start new application</btn>
  </div>
</div>

<div class="row dispute-list-count-container">
  <div class="col-xs-12 dispute-list-count">
    <% if (numDisputes > 0)  { %>
      <span class="">Showing <%= all_loaded_override ? 'all' : 'first' %> <%= numDisputes > 1 ? numDisputes : '' %> dispute<%= numDisputes > 1? 's' :''%>.</span>
      <% if (!all_loaded_override) { %>
        <span class="">Scroll down to view more.</span>
      <% } %>
    <% } %>
  </div>
</div>

<div class="row dispute-list-disputes-container">
  <div class="col-xs-12" id="disputes"></div>

  <div class="col-xs-12" id="dispute-list-loader">
    <img src="<%= require('../../../core/static/loader_blue_lrg.gif') %>" alt="Loading..."/>
  </div>
</div>
