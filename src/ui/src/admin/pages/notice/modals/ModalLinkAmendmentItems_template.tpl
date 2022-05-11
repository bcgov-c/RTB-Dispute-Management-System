
<div class="notice-amendment-include-checkbox"></div>
<div class="notice-amendment-available-content">

  <div class="dispute-amendment-change-html">
    <div class=""><%= amendment_change_html %></div>
  </div>
  <div class="amendment-full-container two-column-edit-container">
    <div class="dispute-party-column left-column">
      <div class="">
        <label class="review-label">Amendment Source:</label>&nbsp;<span><b><%= submitter ? (submitter.isApplicant() ? 'Applicant' : 'Landlord')+' - '+submitter.getContactName() : '-' %></b></span>
      </div>
      <div class="">
        <label class="review-label">Posted by:</label>&nbsp;<span><b><%= createdByDisplay+', '+Formatter.toDateDisplay(created_date) %></b></span>
      </div>
    </div>
      
    <div class="dispute-party-column right-column">
      <div class="">
        <label class="review-label">Change Comment:</label>&nbsp;<span><b><%= amendment_description ? amendment_description : '-'  %></b></span>
      </div>
    </div>
  </div>
</div>
