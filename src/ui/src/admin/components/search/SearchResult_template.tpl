<div class="">
  <div class="search-result-item-header">
    <div class=""><span class="file-number-link general-link"><%= file_number %></span><%= crossScore ? (' - Match Score: ' + crossScore) : ''%></div>
  </div>
  <div class="search-result-item-body">
    <div class=""><%=tenancy_address%> <%= tenancy_zip_postal %></div>
    <div class="">Type: <%= disputeSubType %>, <%= disputeType %></div>
  </div>
</div>

<div class="">
  <div class="search-result-item-header">
    <div class=""><%= complexityUrgencyDisplay %></div>
  </div>
  <div class="search-result-item-body">
    <div class="">Issues: <%= issueCodesDisplay || '-' %></div>
    <div class="">App-Resp: <%= total_applicants%>-<%=total_respondents %></div>
  </div>
</div>

<div class="">
  <div class="search-result-item-header">
    <div class="">Pay: <%= intake_payment_is_paid ? (intake_payment_amount_paid ? Formatter.toAmountDisplay(intake_payment_amount_paid) : '-') : 'Not Paid' %></div>
  </div>
  <div class="search-result-item-body">
    <div class="">Method: <%= paymentMethodDisplay || '-' %></div>
    <div class="">Date: <%= Formatter.toDateDisplay(intake_payment_date_paid) %></div>
  </div>
</div>

<div class="">
  <div class="search-result-item-header">
    <div class="">Hear: <%= hearing_start_date ? Formatter.toDateAndTimeDisplay(hearing_start_date) : 'No' %></div>
  </div>
  <div class="search-result-item-body">
    <div class="">Notice Package: <%= notice_generated_date ? Formatter.toDateDisplay(notice_generated_date) : 'No' %></div>
    <div class="">Link Type:&nbsp;
      <span class=""><%= linkTypeDisplay || '-' %></span>
    </div>
  </div>
</div>


<div class="">
  <div class="search-result-item-header">
    <div class="">Status:&nbsp;<span class="<%= stage_status_color_code %>"><%= Formatter.toStatusDisplay(status) %></span></div>
  </div>

  <div class="search-result-item-body">
    <div class="">Stage:&nbsp;<span class="<%= stage_status_color_code %>"><%= Formatter.toStageDisplay(stage) %></span></div>
    <div class="">Process: <%= Formatter.toProcessDisplay(process) %></div>
  </div>
</div>


<div class="">
  <div class="search-result-item-header">
    <div class="">Submitted: <%= submitted_date ? Formatter.toDateDisplay(submitted_date) : 'No' %></div>
  </div>
  <div class="search-result-item-body">
    <div class="">Created: <%= Formatter.toDateDisplay(created_date) %></div>
    <div class="">Type: <%= creationMethodDisplay || '-' %></div>
  </div>
</div>
