
<div class="unit-cost-title-container">
  <div>
    <span class="unit-cost-title"><%= unitDisplay %>:</span>&nbsp;<span><b><%= Formatter.toAmountDisplay(totalAmount) %></b>&nbsp;- <%= Formatter.toDateDisplay(associatedDate) %></span>
  </div>
  <% if (description) { %>
    <div class="unit-cost-description">
      <%= description %>
    </div>
  <% } %>
</div>
</div>
<div class="unit-cost-sub-title-container">
  <div class="">Units Selected:&nbsp;<span class="unit-cost-selected-count"><%= selectedCount %></span></div>
  <div class="unit-cost-select-all general-link">Select all</div>
</div>

<div class="unit-cost-lines"></div>

<div class="error-block"></div>
