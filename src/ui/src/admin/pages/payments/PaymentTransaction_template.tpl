<div class="payment-transaction-item-wrapper">
  <div class="dispute-party-column left-column">
    <div>
      <label class="review-label">Transaction ID:</label>&nbsp;<span><b><%= payment_transaction_id %></b></span>
    </div>
    <div>
      <label class="review-label">Transaction By:</label>&nbsp;<span><b><%= transactionByDisplay %></b></span>
    </div>
    
    <div class="payment-transaction-method"></div>
    <div class="payment-transaction-status"></div>
    <div class="payment-transaction-amount"></div>
    
    <div class="<%= isFeeWaiver ? '' : 'hidden' %>">
      <div class="spacer-block-5"></div>
      <div class="payment-transaction-hardship"></div>
    </div>
  </div>
  <div class="dispute-party-column right-column">
    <div class="payment-transaction-online-container <%= isOnline ? '' : 'hidden-item' %>">
      <div class="payment-transaction-card-type"></div>
      <div class="payment-transaction-online-approval"></div>
      <div class="payment-transaction-online-id"></div>
    </div>

    <div class="payment-transaction-office-container <%= isOffice ? '' : 'hidden-item' %>">
      <div class="payment-transaction-idir"></div>
    </div>
    
    <div class="payment-transaction-fee-waiver-container <%= isFeeWaiver ? '' : 'hidden-item' %>">
      <div class="payment-transaction-family-size"></div>
      <div class="payment-transaction-family-income"></div>
      <div class="payment-transaction-city-size"></div>
    </div>

    <div class="payment-transaction-note">
      <label class="review-label">Note:</label>&nbsp;<span><%= payment_note ? payment_note : '-' %></span>
    </div>
    <div>
      <label class="review-label">Modified:</label>&nbsp;<span><b><%= Formatter.toDateDisplay(modified_date)+', '+modifiedByDisplay %></b></span>
    </div>
    
    <div class="<%= isFeeWaiver ? '' : 'hidden' %>">
      <div class="spacer-block-5"></div>
      <div class="payment-transaction-hardship-details"></div>
    </div>
  </div>
</div>