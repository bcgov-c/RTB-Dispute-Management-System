
<% if (showReviewRequest) { %>
  <div class="warning-alert"><span class="dispute-list-review-bloc-label">Important Notification!</span><span class="dispute-list-review-notification">See Details</span></div>
<% } %>

<div class="dispute-list-file">
  <% if (file_number) { %>
    <span class="dispute-list-file-number-label dispute-list-main-text">Dispute:&nbsp;</span>
    <span class="dispute-list-file-number"><%= file_number %></span>
  <% } else { %>
    <span class="dispute-list-main-text <%= hasStatusTextHighlight ? 'error-red' : '' %>">Incomplete</span>
  <% } %>
</div>

<td class="dispute-list-info-block">
  <div>
      <span class="dispute-list-sub-text">Status:</span>&nbsp;<span><%= Formatter.toStatusDisplay(status.dispute_status) %></span>
  </div>
  <div>
    <span class="dispute-list-sub-text">Rental:</span>&nbsp;</span>
    <span class="dispute-list-rental"><%= tenancy_address ? tenancy_address : 'No address added' %></span>
  </div>
</td>

<% if (showAccessCode) { %>
  <td class="dispute-list-evidence-block">
    <div>
      <span class="dispute-list-main-text">Access Code:&nbsp;</span>
      <span><%= primary_applicant_access_code %></span>
    </div>
    <div>
      <% if (DISPUTE_ACCESS_URL) { %>
        <a class='dispute-list-add-evidence-btn static-external-link' href='javascript:;' url='<%= DISPUTE_ACCESS_URL %>'>Submit evidence</a>
      <% } %>
    </div>
  </td>
<% } %>


<% if (showHearingDetails) { %>
  <td class="dispute-list-hearing-block">
    <div>
      <span class="dispute-list-main-text">Hearing:&nbsp;<%= Formatter.toDateAndTimeDisplay(hearing.hearing_start_datetime) %></span>
    </div>
    <div>
      <span class="dispute-list-hearing-details-btn">View hearing details</span>
    </div>
  </td>
<% } %>

<td class="dispute-list-right-buttons">
  <% if (showButtonWithdraw) { %>
    <button class="dispute-list-withdraw-app btn remove-withdraw dispute-list-btn-actions">Withdraw</button>
  <% } %>

  <% if (showButtonDelete) { %>
    <button class="dispute-list-delete-app btn remove-withdraw dispute-list-btn-actions">Delete</button>
  <% }%>

  <% if (showButtonUpdateApplication) { %>
    <button class="dispute-list-complete-app btn dispute-list-btn-actions">Update Application</button>
  <% } %>

  <% if (showButtonCompletePayment) { %>
    <button class="dispute-list-pay-app btn dispute-list-btn-actions"><%= textButtonCompletePayment ? textButtonCompletePayment : 'Complete Payment' %></button>
  <% } %>

  <% if (showButtonCompleteApplication) { %>
    <button class="dispute-list-complete-app btn dispute-list-btn-actions">Complete Application</button>
  <% } %>

  <% if (showButtonReview) { %>
    <button class="dispute-list-complete-app btn dispute-list-btn-actions">Review Application</button>
  <% } %>
</td>
