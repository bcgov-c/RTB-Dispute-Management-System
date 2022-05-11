<div class="dispute-amendment-change-html">
  <div class=""><%= amendment_change_html %></div>
  <% if (enableUnlinkedIcon && !notice_id) { %>
    <div class="dispute-amendment-unlinked-icon error-red"><img src=<%= UnlinkedIcon %> />Unlinked</div>
  <% } %>
</div>
<div class="amendment-minimal-container">
  (Posted by: <%= createdByDisplay+', ' + Formatter.toDateDisplay(created_date) %><%= is_internally_initiated ? '&nbsp;-&nbsp;<span class="amendment-rtb-initiated">RTB Initiated</span>' : ''%>)
</div>
<div class="amendment-full-container two-column-edit-container">
  <div class="dispute-party-column left-column">
    <div class="">
      <label class="review-label">Amendment Source:</label>&nbsp;<span><b><%= submitter ? (submitter.isApplicant() ? 'Applicant' : 'Respondent')+' - '+submitter.getContactName() : '-' %></b></span>
    </div>
    <div class="">
      <label class="review-label">Posted by:</label>&nbsp;<span><b><%= createdByDisplay+', '+Formatter.toDateDisplay(created_date) %><%= is_internally_initiated ? '&nbsp;-&nbsp;<span class="amendment-rtb-initiated">RTB Initiated</span>' : ''%></b></span>
    </div>
  </div>
    
  <div class="dispute-party-column right-column">
    <div class="">
      <label class="review-label">Change Comment:</label>&nbsp;<span><b><%= amendment_description ? amendment_description : '-'  %></b></span>
    </div>
  </div>
</div>