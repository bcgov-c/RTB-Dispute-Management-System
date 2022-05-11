<div class="office-page-receipt-data emailable-content">
  <h4 class="er-title visible-email" style="font-weight: bold; padding: 0px; margin: 25px 0px 10px 0px;">Receipt: <%= receiptTitle %></h4>

  <p className="er-text" style="text-align: 'left';padding: '0px 0px 0px 0px'; margin: '0px 0px 10px 0px';">
    The following was submitted to the Residential Tenancy Branch. For information privacy purposes, any personal information that was not provided as part of this submission may be abbreviated or partially hidden (**).
  </p>

  <% _.escape.each(receiptData, function(receiptLabelVal) { %>
    <p class="er-text" style="text-align: left; padding: 0px 0px 0px 0px; margin: 0px 0px 5px 0px;"> <span class="er-label" style="padding:0px 5px 0px 0px; color:#8d8d8d;"><%= receiptLabelVal.label %>: </span>&nbsp; <%= receiptLabelVal.value %></p>
  <% }) %>
</div>
