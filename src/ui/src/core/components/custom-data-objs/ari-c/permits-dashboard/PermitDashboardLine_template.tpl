
<div class="ari-dashboard-table-unit">
  <span><%= unitModel.getUnitNumDisplayShort() %>:</span><span><%= unitModel.getStreetDisplayWithDescriptor() %></span>
</div>

<div class="ari-dashboard-table-tenants <%= !unitModel.get('selected_tenants') ? 'error-red' : '' %>">
  <%= unitModel.get('selected_tenants') || 0 %>
</div>

<div class="permits-dashboard-has-permits">
  <div class="ari-checkmark-img <%= unitModel.noPermitsRequired() ? 'hidden' : '' %>"></div>
</div>

<div class="permits-dashboard-permit-id"><%= permitIdDisplay %></div>

<div class="permits-dashboard-permit-date"><%= permitDateDisplay %></div>

<div class="permits-dashboard-permit-by"><%= permitIssuedByDisplay %></div>

<div class="permits-dashboard-description"><%= permitDescriptionDisplay %></div>
