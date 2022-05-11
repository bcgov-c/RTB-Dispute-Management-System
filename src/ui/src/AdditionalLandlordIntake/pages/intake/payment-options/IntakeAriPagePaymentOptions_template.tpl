<div id="p8-PaymentContainer">
  <div class="step payment-type-description">
    <div id="p8-onlinePaymentWarning" class="<%= incompleteOnlinePayment ? '' : 'hidden-item' %>">
      <% if (incompleteOnlinePayment) { %>
        <p class="error-block warning fee-waiver-error-container">
          <span class="fee-waiver-error">
            <b>Payment Not Completed</b>&nbsp;The previous online payment, started at <%= Formatter.toTimeDisplay(incompleteOnlinePayment.get('created_date')) + ' '+ Formatter.toWeekdayDateDisplay(incompleteOnlinePayment.get('created_date')) %>, was <%= incompleteOnlinePayment.isDeclined() ? 'declined' : 'not completed'%>. Press next to try again or select another option.
          </span>
        </p>
      <% } %>
    </div>

    <div id="p8-paymentMethod"></div>

  </div>

  <div class="page-navigation-button-container">
    <button class="navigation option-button step-next" type="submit">NEXT</button>
  </div>

</div>
