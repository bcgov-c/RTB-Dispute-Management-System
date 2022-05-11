<div class="da-update-notice-service-list-container">
  <div class="da-notice-service-tenant-initials-container">
    <div class="da-notice-service-tenant-initials">
      <b><%= !respondent || respondent.isLandlord() ? 'Landlord' : 'Tenant' %></b>:&nbsp;Initials&nbsp;<b><%= respondent ? respondent.getInitialsDisplay() : null %></b>
    </div>
    <div class="da-notice-service-access-code">(Access code <%= respondent ? respondent.get('access_code') : null %>)</div>
  </div>
  <div class="da-notice-service-status-information">
    <div class="da-notice-service-delivered-icon <%= is_served ? 'da-notice-service-checked-icon' : 'da-notice-service-cross-icon' %>"></div>
    <div class="<%= is_served ? 'da-notice-service-info-provided' : 'da-notice-service-no-info-provided' %>">
      <%= is_served ? 'Service Method: ' + service_method + ' on ' + Formatter.toDateDisplay(service_date) : 'No information provided' %>
      &nbsp;<% if (fileCount && is_served) { print('('+fileCount+' file'+(fileCount===1?'':'s')+' provided)') } %>
      </div>
  </div>
  <div class="da-notice-service-modify-add">
    <div class="da-notice-service-delivered-icon <%= is_served ? 'da-modify-icon' : 'da-plus-icon' %>"></div>
    <div class="da-notice-service-modify-and-add-button"><%= is_served ? 'Modify' : 'Add Service Information' %></div>    
  </div>
</div>