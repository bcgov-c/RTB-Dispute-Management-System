<div class="cms-archive-generic-dispute-header cms-archive-dispute-info-header" id="cms-archive-dispute">Dispute</div>

<div class="cms-archive-dispute-information-container">
  <div class="cms-archive-dispute-information-left-column">
    <div class="cms-archive-reference-number">
      <label class="review-label">Reference Number:</label>&nbsp;<span><b><%= archiveModel.get('reference_number') %></b></span>
    </div>
    <div class="">
      <label class="review-label">File Number:</label>&nbsp;<span><b><%= archiveModel.get('file_number') %></b></span>
    </div>
    <div class="">
      <label class="review-label">Status:</label>&nbsp;<span><b><%= status %></b></span>
    </div>
    <div class="">
      <label class="review-label">File Origin:</label>&nbsp;<span><%= file_origin %></span>
    </div>
    <div class="cms-archive-generic-column-final-row-space-separator">
      <label class="review-label">DMS File Exists:</label>&nbsp;
      <span><%= archiveModel.get('dms_file_number') ? 'Yes -' : 'No -' %></span>&nbsp;
      <span class="general-link cms-archive-dispute-edit-link">Edit</span>
    </div>    

    <div class="">
      <label class="review-label">Created:</label>&nbsp;<span><%= Formatter.toDateAndTimeDisplay(created_date, 'utc') %></span>
    </div>
    <div class="">
      <label class="review-label">Last Modified:</label>&nbsp;<span><%= Formatter.toDateAndTimeDisplay(last_modified_date, 'utc') %></span>
    </div>  
    <div class="cms-archive-generic-column-final-row-space-separator">
      <label class="review-label">Submitted:</label>&nbsp;<span><%= Formatter.toDateAndTimeDisplay(submitted_date, 'utc') %></span>
    </div>

    <div class="">
      <label class="review-label">Direct Request:</label>&nbsp;<span><%= direct_request === 0 ? 'Yes' : 'No' %></span>
    </div>
    <div class="">
      <label class="review-label">Cross App File #:</label>&nbsp;
      <span id="<%= cross_app_file_number %>" class="general-link cms-archive-file-link"><%= cross_app_file_number %></span>
    </div>
    <div class="cms-archive-generic-column-final-row-space-separator">
      <label class="review-label">Joiner:</label>&nbsp;
        <% _.escape.each(joiner_applications, function(joiner_app, index) { %>
          <% if (index === 0) { %>
            <span>Parent</span>
          <% } %>
          <span id="<%= joiner_app.Joiner_File_Number %>" class="general-link cms-archive-file-link">
          <% if (joiner_app.Joiner_Type === 0) { %>
            <%= joiner_app.Joiner_File_Number %>
          <% } %>
          </span>
        <% }); %>
        <% _.escape.each(joiner_applications, function(joiner_app, index) { %>
          <% if (index === 0) { %>
            <span>Children</span>
          <% } %>       
          <span id="<%= joiner_app.Joiner_File_Number %>" class="general-link cms-archive-file-link">
          <% if (joiner_app.Joiner_Type === 1) { %>
            <%= joiner_app.Joiner_File_Number %>
            <% if (index !== joiner_applications.length - 1) { print('<span class="list-comma">,&nbsp;</span>'); } %>
          <% } %>
          </span> 
        <% }); %>
    </div>

    <div class="">
      <label class="review-label">Filing Fee:</label>&nbsp;<span><%= Formatter.toAmountDisplay(filing_fee) %></span>
    </div>
    <div class="">
      <label class="review-label">Fee Waiver Requested:</label>&nbsp;<span><%= fee_waiver_requested === 0 ? 'No' : 'Yes' %></span>
    </div>
    <div class="">
      <label class="review-label">Fee Refund:</label>&nbsp;<span><%= Formatter.toAmountDisplay(fee_refund) %></span>
    </div>    
  </div>

  <div class="cms-archive-dispute-information-right-column">
    <div class="">
      <label class="review-label">Dispute Type:</label>&nbsp;<span><%= dispute_type === 0 ? 'RTA' : 'MHPTA' %></span>
    </div>
    <div class="">
      <label class="review-label">Applicant Type:</label>&nbsp;<span><%= applicant_type === 0 ? 'Landlord' : 'Tenant' %></span>
    </div>
    <div class="cms-archive-generic-column-final-row-space-separator">
      <label class="review-label">Service Code:</label>&nbsp;<span><%= service_code ? service_code : '' %></span>
    </div>

    <div class="">
      <span><b>
        <%= dispute_address %><%= dispute_city ? ',&nbsp;' + dispute_city : '' %><%= dispute_unit_site ? ',&nbsp;' + dispute_unit_site : '' %>
      </b></span>
    </div>
    <div class="cms-archive-generic-column-final-row-space-separator">
      <span><b><%= dispute_province ? dispute_province : 'N/A' %>, Canada&nbsp;<%= dispute_postal_code %></b></span>
    </div>

    <div class="">
      <label class="review-label">Monetary Order:</label>&nbsp;<span><%= Formatter.toAmountDisplay(monetary_order) %></span>
    </div>
    <div class="">
      <label class="review-label">Fee Recovery Requested:</label>&nbsp;<span><%= fee_recovery_requested === 1 ? 'Yes' : 'No' %></span>
    </div>
    <div class="">
      <label class="review-label">Date NTE Served:</label>&nbsp;<span><%= Formatter.toDateDisplay(date_nte_served, 'utc') %></span>
    </div>
    <div class="">
      <label class="review-label">How it was served:</label>&nbsp;<span><%= how_it_was_served %></span>
    </div>    
    <div class="cms-archive-generic-column-final-row-space-separator">
      <label class="review-label">Additional Rent Increase:</label>&nbsp;<span><%= additional_rent_increase === 0 ? 'Yes' : 'No' %></span>
    </div>

    <div class="">
      <label class="review-label">Dispute Codes:</label>&nbsp;<span><%= dispute_codes %></span>
    </div>
    <div class="cms-archive-generic-column-final-row-space-separator">
      <label class="review-label">Details:</label>&nbsp;<span><%= details_of_the_dispute %></span>
    </div>

    <div class="">
      <label class="review-label">Evidence:</label>&nbsp;
        <% _.escape.each(archiveModel.get('evidence_files'), function(e_file, index) { %>
          <a url="<%= e_file.file_url %>" href="javascript:;" file_id="<%= e_file.etl_file_id %>" class="cms-archive-file-download">
            <%= e_file.file_name %>
            </a>
          &nbsp;<span class="cms-archive-file-date"><%= '('+e_file.submitter+' '+Formatter.toDateDisplay(e_file.create_date, 'utc')+')' %></span>
          <% if (index !== archiveModel.get('evidence_files').length - 1) { print('<span class="list-comma">, </span>'); } %>
        <% }); %>
    </div>    
  </div>
</div>

<div class="cms-archive-participant-header-title" id="cms-archive-applicants">Applicants</div>
<div class="cms-archive-applicant-information-container"></div>

<div class="cms-archive-participant-header-title" id="cms-archive-agents">Agents</div>
<div class="cms-archive-agent-information-container"></div>

<div class="cms-archive-participant-header-title" id="cms-archive-respondents">Respondents</div>
<div class="cms-archive-respondent-information-container"></div>

<div class="cms-archive-generic-dispute-header cms-archive-dispute-info-header" id="cms-archive-hearing">Hearing</div>
<div class="cms-archive-hearing-container">
  <div class="cms-archive-dispute-information-left-column">
    <div class="">
      <label class="review-label">Hearing Date:</label>&nbsp;<span><%= Formatter.toDateDisplay(hearing_date, 'utc') %></span>
    </div>
    <div class="">
      <label class="review-label">Hearing Time:</label>&nbsp;<span><%= hearing_time %></span>
    </div>
    <div class="">
      <label class="review-label">Hearing Type:</label>&nbsp;<span><%= hearingTypeDisplay %></span>
    </div>
    <div class="cms-archive-generic-column-final-row-space-separator">
      <label class="review-label">Hearing Location:</label>&nbsp;<span><%= hearing_location %></span>
    </div>

    <div class="cms-archive-generic-column-final-row-space-separator">
      <label class="review-label">Method of Service:</label>&nbsp;<span><%= methodOfServiceDisplay %></span>
    </div>

    <div class="">
      <label class="review-label">Hearing Pickup:</label>&nbsp;<span>
        <% if (hearing_pickup === 0) { %>
          No
        <% } else if (hearing_pickup === 1) { %>
          Yes
        <% } %>
        </span>
    </div>
    <div class="">
      <label class="review-label">Office Location:</label>&nbsp;<span><%= office_location %></span>
    </div>          
  </div>

  <div class="cms-archive-dispute-information-right-column">
    <div class="">
      <label class="review-label">Online Cross App File #:</label>&nbsp;
      <span id="<%= online_cross_app_file_number %>" class="general-link cms-archive-file-link cms-archive-file-link">
        <%= online_cross_app_file_number %></span>
    </div>
    <div class="cms-archive-generic-column-final-row-space-separator">
      <label class="review-label">Counter Dispute Issues:</label>&nbsp;<span class=""><%= cross_dispute_issues %></span>
    </div>

    <div class="">
      <label class="review-label">DRO Code:</label>&nbsp;<span class=""><%= dro_code %></span>
    </div>
    <div class="">
      <label class="review-label">DRO Name:</label>&nbsp;<span class=""><%= dro_name %></span>
    </div>
    <div class="cms-archive-generic-column-final-row-space-separator">
      <label class="review-label">DRO Location:</label>&nbsp;<span class=""><%= dro_location %></span>
    </div>

    <div class="">
      <label class="review-label">Conference Bridge Number:</label>&nbsp;<span class=""><%= conference_bridge_number %></span>
    </div>
    <div class="">
      <label class="review-label">Participant Code:</label>&nbsp;<span class=""><%= participant_code %></span>
    </div>
    <div class="">
      <label class="review-label">Moderator Code:</label>&nbsp;<span class=""><%= moderator_code %></span>
    </div>
    <div class="">
      <label class="review-label">Special Requirements:</label>&nbsp;<span class=""><%= special_requirements %></span>
    </div>
    <div class="">
      <label class="review-label">Wheelchair Access:</label>&nbsp;
      <span class="">
        <% if (wheelchair_access === 0) { %>
          No
        <% } else if (wheelchair_access === 1) { %>
          Yes
        <% } %>                 
        </span>
    </div>
  </div>
</div>

<div class="cms-archive-generic-dispute-header cms-archive-dispute-info-header" id="cms-archive-outcome">Outcome</div>
<div class="cms-archive-outcome-container">
  <div class="cms-archive-dispute-information-left-column">
    <div class="">
      <label class="review-label">Hearing Duration (Min):</label>&nbsp;<span class=""><%= hearing_duration %></span>
    </div>
    <div class="">
      <label class="review-label">Decision Staff Code:</label>&nbsp;<span class=""><%= decision_staff_code %></span>
    </div>
    <div class="">
      <label class="review-label">Sections Applied:</label>&nbsp;<span class=""><%= sections_applied %></span>
    </div>
    <div class="cms-archive-generic-column-final-row-space-separator">
      <label class="review-label">Decision Details:</label>&nbsp;<span class=""><%= decision_details_vals[decision_details] %></span>
    </div>

    <div class="">
      <label class="review-label">Arbitrator Comments:</label>&nbsp;<span class=""><%= arbitrator_comments %></span>
    </div>
    <div class="">
      <label class="review-label">Method of Resolution:</label>&nbsp;<span class="">
        <% if (method_of_resolution === 0) { %>
          Mediation
        <% } else if (method_of_resolution === 1) { %>
          Adjudication
        <% } else if (method_of_resolution === 2) { %>
          Both
        <% } else if (method_of_resolution === 3) { %>
          Not Applicable
        <% } %>
        </span>
    </div>
    <div class="">
      <label class="review-label">Outcome Commercial Landlord:</label>&nbsp;<span class=""><%= outcome_commercial_landlord === 0 ? 'Yes' : 'No' %></span>
    </div>
    <div class="cms-archive-generic-column-final-row-space-separator">
      <label class="review-label">Decision Issue Date:</label>&nbsp;<span class=""><%= Formatter.toDateDisplay(decision_issue_date, 'utc') %></span>
    </div>

  </div>

  <div class="cms-archive-dispute-information-right-column">
    <div class="">
      <label class="review-label">Monetary Amount Requested:</label>&nbsp;
      <span class=""><%= Formatter.toAmountDisplay(monetary_amount_requested) %></span>
    </div>
    <div class="cms-archive-generic-column-final-row-space-separator">
      <label class="review-label">Monetary Amount Rewarded:</label>&nbsp;
      <span class=""><%= Formatter.toAmountDisplay(monetary_amount_awarded) %></span>
    </div>

    <div class="">
      <label class="review-label">Order of Posession:</label>&nbsp;
      <span class="">
        <% if (order_of_possession === 0) { %>
          OP Denied
        <% } else if (order_of_possession === 1) { %>
          OP Granted
        <% } %>
      </span>
    </div>
    <div class="">
      <label class="review-label">Order of Posession Date:</label>&nbsp;
      <span class=""><%= Formatter.toDateAndTimeDisplay(order_of_possession_date, 'utc') %></span>
    </div>
    <div class="cms-archive-generic-column-final-row-space-separator">
      <label class="review-label">Order Effective (days from service):</label>&nbsp;<span class=""><%= order_effective %></span>
    </div>

    <div class="">
      <label class="review-label">Fee Repayment Ordered:</label>&nbsp;<span class=""><%= fee_repayment_ordered === 0 ? 'Yes' : '' %></span>
    </div>
    <div class="cms-archive-generic-column-final-row-space-separator">
      <label class="review-label">Rent Redirection Ordered:</label>&nbsp;<span class=""><%= rent_redirection_ordered === 0 ? 'Yes' : '' %></span>
    </div>

    <div class="">
      <label class="review-label">Outcome Documents:</label>&nbsp;
        <% _.escape.each(archiveModel.get('outcome_files'), function(e_file, index) { %>
          <a url="<%= e_file.file_url %>" href="javascript:;" file_id="<%= e_file.etl_file_id %>" class="cms-archive-file-download">
            <%= e_file.file_name %>
            </a>
          &nbsp;<span class="cms-archive-file-date"><%= '('+e_file.submitter+' '+Formatter.toDateAndTimeDisplay(e_file.create_date, 'utc')+')' %></span>
          <% if (index !== archiveModel.get('evidence_files').length - 1) { print('<span class="list-comma">, </span>'); } %>
        <% }); %>      
    </div>

  </div>  
</div>

<div class="cms-archive-outcome-review-header">
  <label class="review-label">Review</label>
</div>

<div class="cms-archive-outcome-container">
  <div class="cms-archive-dispute-information-left-column">
    <div class="">
      <label class="review-label"><b>First</b>&nbsp;Review Requested By:</label>&nbsp;
      <span class="">
        <% if (first_review_requested_by === 0) { %>
          Applicant
        <% } else if (first_review_requested_by === 1) { %>
          Respondent
        <% } %>
      </span>
    </div>
    <div class="">
      <label class="review-label">Grounds for Review:</label>&nbsp;
      <span class="">
        <% if (first_grounds_for_review === 0) { %>
          Party Unable to Attend
        <% } else if (first_grounds_for_review === 1) { %>
          Party Has New and Relevant Evidence
        <% } else if (first_grounds_for_review === 2) { %>
          Decision Obtained by Fraud
        <% } %>       
      </span>
    </div>
    <div class="">
      <label class="review-label">Results of Review:</label>&nbsp;<span class=""><%= first_results_of_review %></span>
    </div>
  </div>

  <div class="cms-archive-dispute-information-right-column">
    <div class="">
      <label class="review-label"><b>Second</b>&nbsp;Review Requested By:</label>&nbsp;
      <span class="">
        <% if (second_review_requested_By === 0) { %>
          Applicant
        <% } else if (second_review_requested_By === 1) { %>
          Respondent
        <% } %>       
      </span>     
    </div>
    <div class="">
      <label class="review-label">Grounds for Review:</label>&nbsp;
      <span class="">
        <% if (second_grounds_for_review === 0) { %>
          Party Unable to Attend
        <% } else if (second_grounds_for_review === 1) { %>
          Party Has New and Relevant Evidence
        <% } else if (second_grounds_for_review === 2) { %>
          Decision Obtained by Frau
        <% } %>       
      </span>     
    </div>
    <div class="">
      <label class="review-label">Results of Review:</label>&nbsp;<span class=""><%= second_results_of_review %></span>
    </div>    
  </div>  
</div>

<div class="cms-archive-outcome-review-header">
  <label class="review-label">Correction/Clarification</label>
</div>

<% _.escape.each(corrections_clarifications, function(comment, index) { %>
  <% if (comment.comment_type === 10) { %>
    <div class="cms-archive-outcome-correction-comment">
      <label class="review-label">Correction Comment:</label>&nbsp;
  <% } else if (comment.comment_type === 20) { %>
    <div class="cms-archive-outcome-clarification-comment">
      <label class="review-label">Clarification Comment:</label>&nbsp;
  <% } %>

  <span class=""><%= comment.comment %></span>
  <span class="cms-archve-outcome-comment-sub-details cms-archive-file-date">
    <%= '('+comment.comment_submitter+': ' + Formatter.toDateAndTimeDisplay(comment.comment_submitted_date, 'utc')+')' %>
  </span>
  </div>
<% }); %>


<div class="cms-archive-generic-dispute-header cms-archive-audit-header" id="cms-archive-audit">Audit</div>

<div class="cms-archive-audit-container">

  <div class="cms-archive-dispute-information-left-column">
    <div class="">
      <label class="review-label">RTB Location:</label>&nbsp;<span class=""><%= rtb_location %></span>
    </div>
    <div class="">
      <label class="review-label">Submitter:</label>&nbsp;<span class=""><%= submitter %></span>
    </div>
    <div class="">
      <label class="review-label">Create Date:</label>&nbsp;<span class=""><%= Formatter.toDateAndTimeDisplay(created_date, 'utc') %></span>
    </div>
    <div class="">
      <label class="review-label">Last Modified By:</label>&nbsp;<span class=""><%= last_modified_by %></span>
    </div>
    <div class="">
      <label class="review-label">Modified Date:</label>&nbsp;<span class=""><%= Formatter.toDateAndTimeDisplay(last_modified_date, 'utc') %></span>
    </div>
    <div class="">
      <label class="review-label">Archive:</label>&nbsp;<span class=""><%= archive ? 'Yes' : 'No' %></span>
    </div>
    <div class="">
      <label class="review-label">New Date:</label>&nbsp;<span class=""><%= Formatter.toDateAndTimeDisplay(new_date, 'utc') %></span>
    </div>
    <div class="">
      <label class="review-label">Submitted Date:</label>&nbsp;<span class=""><%= Formatter.toDateAndTimeDisplay(submitted_date, 'utc') %></span>
    </div>
    <div class="">
      <label class="review-label">Date Terminated:</label>&nbsp;<span class=""><%= Formatter.toDateAndTimeDisplay(date_terminated, 'utc') %></span>
    </div>
    <div class="">
      <label class="review-label">DR Pending Date:</label>&nbsp;<span class=""><%= Formatter.toDateAndTimeDisplay(dr_pending_date, 'utc') %></span>
    </div>
    <div class="">
      <label class="review-label">Needs Update Date:</label>&nbsp;<span class=""><%= Formatter.toDateAndTimeDisplay(needs_update_date, 'utc') %></span>
    </div>
  </div>

  <div class="cms-archive-dispute-information-right-column">
    <div class="">
      <label class="review-label">Ready to Pay Date:</label>&nbsp;<span class=""><%= Formatter.toDateAndTimeDisplay(ready_to_pay_date, 'utc') %></span>
    </div>
    <div class="">
      <label class="review-label">Approved Date:</label>&nbsp;<span class=""><%= Formatter.toDateAndTimeDisplay(approved_date, 'utc') %></span>
    </div>
    <div class="">
      <label class="review-label">Scheduled Date:</label>&nbsp;<span class=""><%= Formatter.toDateAndTimeDisplay(scheduled_date, 'utc') %></span>
    </div>
    <div class="">
      <label class="review-label">Rescheduled Date:</label>&nbsp;<span class=""><%= Formatter.toDateAndTimeDisplay(rescheduled_date, 'utc') %></span>
    </div>
    <div class="">
      <label class="review-label">Adjourned Date:</label>&nbsp;<span class=""><%= Formatter.toDateAndTimeDisplay(adjourned_date, 'utc') %></span>
    </div>
    <div class="">
      <label class="review-label">Closed Date:</label>&nbsp;<span class=""><%= Formatter.toDateAndTimeDisplay(closed_date, 'utc') %></span>
    </div>
    <div class="">
      <label class="review-label">Cancelled Date:</label>&nbsp;<span class=""><%= Formatter.toDateAndTimeDisplay(cancelled_date, 'utc') %></span>
    </div>
    <div class="">
      <label class="review-label">Reopened 1 Date:</label>&nbsp;<span class=""><%= Formatter.toDateAndTimeDisplay(reopened_1_date, 'utc') %></span>
    </div>
    <div class="">
      <label class="review-label">Reopened 2 Date:</label>&nbsp;<span class=""><%= Formatter.toDateAndTimeDisplay(reopened_2_date, 'utc') %></span>
    </div>
    <div class="">
      <label class="review-label">Abandoned Date:</label>&nbsp;<span class=""><%= Formatter.toDateAndTimeDisplay(abandoned_date, 'utc') %></span>
    </div>
  </div>

</div>

<div class="cms-archive-notes-header">
  <label class="review-label">Notes</label>
</div>

<div class="cms-archive-audits-notes-container">
  <%= notes ? notes : '' %>
</div>

<div class="cms-archive-notes-history-header">
  <label class="review-label">Notes/History</label>
</div>

<div class="cms-archive-audits-notes-history-container">
  <%= notes_history ? notes_history : '' %>
</div>