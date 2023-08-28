
<% if (showReviewRequest) { %>
  <div class="warning-alert"><span class="dispute-list-review-bloc-label">Important Notification!</span><span class="dispute-list-review-notification">See Details</span></div>
<% } %>

<% if (showArsDeadlineWarning) { %>
  <div class="warning-alert">
    <span>
      You must indicate to the Residential Tenancy Branch that you served the Notice of Dispute Resolution Proceeding Package using the link below or at the Residential Tenancy Branch or Service BC Centre.
      You must declare service for at least one respondent before&nbsp;<b><%= Formatter.toFullDateAndTimeDisplay(notice.get('service_deadline_date')) %></b>&nbsp;or your dispute will be adjourned.
    </span>
  </div>
<% } %>

<% if (showArsReinstatementDeadlineWarning) { %>
  <div class="warning-alert">
    <span>
      This dispute has been adjourned because you did not declare service to at least one respondent before the declaration deadline&nbsp;<b><%= Formatter.toFullDateAndTimeDisplay(notice.get('service_deadline_date')) %></b>.
      If you have served the respondent(s), you may request to reinstate your hearing by providing proof of service RTB-55 at the link below or at the Residential Tenancy Branch or Service BC Centre by&nbsp;<b><%= Formatter.toFullDateAndTimeDisplay(notice.get('second_service_deadline_date')) %></b>.
      If you do not provide proof that the notice of dispute has been served, your dispute will be deemed withdrawn.
    </span>
  </div>
<% } %>

<div class="dispute-list-file">
  <% if (file_number) { %>
    <span class="dispute-list-file-number-label dispute-list-main-text">Dispute:&nbsp;</span>
    <span class="dispute-list-file-number"><%= file_number %></span>
    <% if (showDetailsLink) { %>
      <span class="dispute-list-details-btn general-link">View file</span>
    <% } %>
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
        <% if (showArsDeadlineWarning) { %>
          <span class="dispute-list-submit-service-btn">Submit proof of service</span>
        <% } else if (showArsReinstatementDeadlineWarning) { %>
          <span class="dispute-list-request-reinstatement-btn">Request reinstatement</span>
        <% } else { %>
          <span class="dispute-list-add-evidence-btn">Submit evidence</span> 
        <% } %>
      </span>
      <% } %>
    </div>
  </td>
<% } %>

<% if (showHearingDetails) { %>
  <td class="dispute-list-hearing-block">
    <div>
      <span class="dispute-list-main-text">Hearing:&nbsp;<%= Formatter.toDateAndTimeDisplay(hearing.local_start_datetime) %> PST</span>
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
