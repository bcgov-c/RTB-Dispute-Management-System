
<div class="<%= hideIssueContent ? 'hidden' : '' %>">

  <% if (isExpenseIssue) {%>
    <div class="">
      <div class="dispute-expense-claim-remedies"></div>
    </div>
  <% } else { %>
    <div class="">
      <div class="dispute-claim-hearing-tools-container hidden-print"></div>

      <% if (!isSupportingEvidence && !isMigrated) { %>
        <div class="dispute-claim-outcome-display hidden-print">
          <div class="dispute-claim-outcome-wrapper">
            <div class="dispute-claim-outcome-display-img">
              <img src="<%= ClaimOutcomeUserIcon %>"/>
            </div>
            <div class="dispute-claim-outcome-display-wrapper">
              <div>Arbitrator outcome:&nbsp;<span><%= outcomeDisplay || '-' %></span></div>
              <span class="dispute-claim-modified-by"><%= hadStaffActivity ? (outcomeModifiedDisplay || '') : '-' %></span>
            </div>
          </div>
        </div>
        <% if (isRemedyReviewed) { %>
          <div class="dispute-claim-prev-outcome-display hidden-print">
            <div class="dispute-claim-outcome-wrapper">
              <div class="dispute-claim-outcome-display-img">
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
      <div class="dispute-claim-details <%= !useAmount && !useNoticeDueDate && !useNoticeMethod ? 'hidden-item' : '' %>">
        <div class="review-claim-amount <%= useAmount ? '' : 'hidden-item' %>"></div>
        <div class="review-claim-delivery-date <%= useNoticeDueDate ? '' : 'hidden-item' %>"></div>
        <div class="review-claim-delivery-method <%= useNoticeMethod ? '' : 'hidden-item' %>"></div>
      </div>
      
      <div class="<%= useTextDescription ? '' : 'hidden-item' %> review-claim-description-container">
        <div class="review-claim-description"></div>
      </div>
    </div>
  <% } %>
</div>
<div class="">
  <div class="review-claim-evidence"></div>
</div>