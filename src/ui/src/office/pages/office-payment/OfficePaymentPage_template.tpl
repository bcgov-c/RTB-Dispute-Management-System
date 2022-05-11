<div class="office-top-main-instructions"></div>
<div class="office-top-main-content-container"></div>
<div class="da-access-overview-container"></div>

<div class="office-sub-page-view">
  
  <div class="da-page-header-title hidden-print">
    <span class="da-page-header-icon da-access-menu-icon"></span>
    <span class="da-page-header-title-text"><%= renderAsReceipt ? 'Payment completed' : 'Complete Office Payment' %></span>
  </div>

  <div class="office-page-payment-contents <%= renderAsReceipt ? 'hidden' : '' %>">
    <div class="office-page-payment-instructions">
      All payments recorded as paid through this site will indicate the full amount was paid.  Partial payments cannot be recorded through this site.
    </div>

    <div class="office-page-payment-details">
      <div class="">
        <span class="review-label">Payment for:</span>&nbsp;<span><%= paymentTypeDisplay ? paymentTypeDisplay : '-' %></span>
      </div>
      <div class="">
        <span class="review-label">Total amount due:</span>&nbsp;<span><%= paymentAmountDisplay ? paymentAmountDisplay : '-' %></span>
      </div>
    </div>

    <div class="office-payment-name"></div>
    <div class="office-payment-amount"></div>
    <div class="office-payment-method"></div>

  </div>

  <div class="office-page-payment-receipt <%= renderAsReceipt ? '' : 'hidden' %>">
    <div class="office-page-receipt-container"></div>
  </div>

  <div class="office-sub-page-buttons">
    <% if (renderAsReceipt) { %>
      <button class="btn btn-lg btn-cancel">Main Menu</button>
      <span class="office-receipt-logout general-link">Logout</span>
    <% } else { %>
      <button class="btn btn-lg btn-cancel">Cancel</button>
      <button class="btn btn-lg btn-standard btn-continue">Mark Paid</button>
    <% } %>
  </div>

</div>