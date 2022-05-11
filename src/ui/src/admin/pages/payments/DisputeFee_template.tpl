<div class="dispute-fee-overview review-information-body">
  <div class="dispute-party-column left-column">
    <div>
      <label class="review-label">Fee Type:</label>&nbsp;<span><b><%= feeTypeDisplay %></b></span>
    </div>

    <div class="dispute-fee-active"></div>
    
    <div>
      <label class="review-label">Fee Amount:</label>&nbsp;<span><b><%= Formatter.toAmountDisplay(amount_due) %></b></span>
    </div>

    <div class="dispute-fee-due-date"></div>
    
    <div class="dispute-fee-payor"></div>

    <div>
      <label class="review-label">Created:</label>&nbsp;<span><b><%= Formatter.toDateDisplay(created_date)+', '+createdByDisplay %></b></span>
    </div>
  </div>
  <div class="dispute-party-column right-column">
    <div class="dispute-fee-paid-status-and-label-container">
      <label class="review-label">Paid:</label>&nbsp;
      <div class="<%= is_paid ? 'dispute-fee-paid-icon-and-label' : 'dispute-fee-not-paid-icon-and-label' %>">
        <span><%= is_paid ? 'Yes' : 'No' %></span>
      </div>
    </div>
    <div>
      <label class="review-label">Date Paid:</label>&nbsp;<span><b><%= is_paid && date_paid ? Formatter.toDateDisplay(date_paid) : '-' %></b></span>
    </div>
    <div>
      <label class="review-label">Payment Method:</label>&nbsp;<span><b><%= paymentMethodDisplay %></b></span>
    </div>
    <div>
      <label class="review-label">Amount Paid:</label>&nbsp;<span><b><%= amount_paid ? Formatter.toAmountDisplay(amount_paid) : '-' %></b></span>
    </div>

    <div class="dispute-fee-description"></div>
  </div>
</div>
<div class="dispute-fee-payments-container">
  <div class="dispute-fee-payments"></div>
</div>