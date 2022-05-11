<div class="dispute-remedy-hearing-tools-container"></div>

<% if (!isMigrated) { %>
  <div class="dispute-claim-outcome-display">
    <div class="dispute-claim-outcome-wrapper">
      <div class="dispute-claim-outcome-display-img hidden-print">
        <img src="<%= ClaimOutcomeUserIcon %>"/>
      </div>
      <div class="dispute-claim-outcome-display-wrapper">
        <div>Arbitrator outcome:&nbsp;<span><%= outcomeDisplay || '-' %></span></div>
        <span class="dispute-claim-modified-by"><%= hadStaffActivity ? (outcomeModifiedDisplay || '') : '-' %></span>
      </div>
    </div>
  </div>
  <% if (isRemedyReviewed) { %>
    <div class="dispute-claim-prev-outcome-display">
      <div class="dispute-claim-outcome-wrapper">
        <div class="dispute-claim-outcome-display-img hidden-print">
          <img src="<%= PrevClaimOutcomeUserIcon %>" />
        </div>
        <div class="dispute-claim-outcome-display-wrapper">
          <div>Previous outcome:&nbsp;<span><%= prevOutcomeDisplay || '-' %></span></div>
          <span class="dispute-claim-modified-by"><%= prevOutcomeModifiedDisplay || '-' %></span>
        </div>
      </div>
    </div>
  <% } %>
<% } %>
<div class="spacer-block-15"></div>
<div class="<%= !remedyUseAmount && !remedyUseAssociatedDate ? 'hidden-item' : '' %>">
  <div class="review-claim-amount <%= remedyUseAmount ? '' : 'hidden-item' %>"></div>
  <div class="review-claim-delivery-date <%= remedyUseAssociatedDate ? '' : 'hidden-item' %>">
    <div class="review-remedy-date"></div>
    <div class="review-claim-delivery-date-warning error-red <%= dateWarningMsg ? '' : 'hidden-item' %>"><%= dateWarningMsg %></div>
  </div>
</div>

<div class="<%= remedyUseTextDescription ? '' : 'hidden-item' %> review-claim-description-container">
  <div class="review-claim-description"></div>
</div>

