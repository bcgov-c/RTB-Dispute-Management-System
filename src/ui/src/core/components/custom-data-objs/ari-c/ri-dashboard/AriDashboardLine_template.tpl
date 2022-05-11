
<div class="ari-dashboard-table-section ari-dashboard-table-units">
  <div class="ari-dashboard-table-unit">
    <span><%= unitModel.getUnitNumDisplayShort() %>:</span><span><%= unitModel.getStreetDisplayWithDescriptor() %></span>
  </div>
  <div class="ari-dashboard-table-rent <%= !unitModel.getRentAmount() ? 'error-red' : '' %>">
    <%= Formatter.toAmountDisplay(unitModel.getRentAmount()) || '-' %>
  </div>

  <div class="ari-dashboard-table-tenants <%= !unitModel.get('selected_tenants') ? 'error-red' : '' %>">
    <%= unitModel.get('selected_tenants') || 0 %>
  </div>

  <div class="ari-dashboard-table-ri-unit">
    <div class="ari-checkmark-img <%= unitModel.hasSavedRentIncreaseData() ? '' : 'hidden' %>"></div>
  </div>
</div>

<div class="ari-dashboard-table-section ari-dashboard-table-unit-costs">
  <% costCollection.each(function(costModel) { %>
    <div class="ari-dashboard-table-unit-cost">
      <div class="ari-checkmark-img <%= costModel.hasUnit(unitModel.get('unit_id')) ? '' : 'hidden' %>"></div>
    </div>
  <% }) %>
</div>

<div class="ari-dashboard-table-section ari-dashboard-table-arb-awards-container"></div>

<div class="ari-dashboard-table-section ari-dashboard-table-ri-container">
  <div class="ari-dashboard-table-ri-calc"><%= unitAwardedCalculatedAmount ? Formatter.toAmountDisplay(unitAwardedCalculatedAmount) : '-' %></div>
  <div class="ari-dashboard-table-ri-checkbox"></div>
</div>