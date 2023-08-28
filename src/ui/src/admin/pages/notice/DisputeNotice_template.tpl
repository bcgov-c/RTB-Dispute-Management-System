<div class="two-column-edit-container">
  <div class="dispute-party-column left-column">

    <div class="generated-by">
      <label><%= isAmendment ? 'Amendment' : 'Notice' %> By:</label>&nbsp;<span><%= providedByName %>,&nbsp;<%= providedByDateDisplay %></span>
    </div>

    <div class="dispute-process <%= isAmendment ? 'hidden' : '' %>">
      <label>Dispute Process:</label>&nbsp;<span><%= hearing_type ? Formatter.toProcessDisplay(hearing_type) : '-' %></span>
      <span class=""><%= hearingDate ? ',&nbsp;'+Formatter.toDateAndTimeDisplay(hearingDate) : '' %></span>
    </div>  

    <div class="notice-doc">
      <label><%= isAmendment ? 'Amendment' : 'Notice' %> Document:</label>&nbsp;
      <%= _.escape.isEmpty(noticeFileModels) ? '-' : '' %>
      <% _.escape.each(noticeFileModels, function(noticeFileModel, index) { %>
        <% if (index !== 0) { print(',&nbsp;') } %>
        <span><a href="javascript:;" data-file-id="<%= noticeFileModel.get('file_id') %>" class="filename-download"><%= noticeFileModel.get('file_name') %></a></span>
      <% }) %>
      <span class="">&nbsp;<%= '('+noticeCreationTypeDisplay+')' %></span>
    </div>

    <div class="">
      <label>Special Instructions: </label>&nbsp;<span><%= notice_special_instructions ? notice_special_instructions : '-' %></span>
    </div>

  </div>

  <div class="dispute-party-column right-column">
    <div class="package-delivered-container">
      <div class="package-delivered-to"><label class="package-provided-label">Package Provided to: </label>&nbsp;<span><%= deliveredToDisplay %></span></div>
      <div class="package-provided-by"><label class="review-label">Provided by: </label>&nbsp;<span><%= noticeMethodDisplay ? noticeMethodDisplay + ',': '-' %>
        <%= deliveredDate && noticeMethodDisplay ? Formatter.toDateAndTimeDisplay(deliveredDate) : (noticeMethodDisplay ? '-' : '') %></span>
      </div>
    </div>

    <div class="package-provided-container">
      <div class="package-provided-dropdown"></div>
      <div class="notice-delivered-to"></div>
      <div class="notice-rtb-initiated"></div>
    </div>

    <div class="notice-method-and-date-container">
      <div class="notice-delivery-method"></div>
      <div class="notice-delivery-date"></div>
      <div class="notice-delivery-time"></div>
    </div>

    <div class="notice-other-delivery-description <%= showNoticeOtherDelivery ? '' : 'hidden' %>"></div>

    <% if (service_deadline_date || second_service_deadline_date) { %>
      <% var deadlineInFuture = Moment(service_deadline_date).isAfter(Moment()) %>
      <% var secondDeadlineInFuture = Moment(second_service_deadline_date).isAfter(Moment()) %>
      <div class="notice-ars-deadlines <%= has_service_deadline ? 'notice-ars-deadlines--enabled' : 'notice-ars-deadlines--disabled' %>">
        <div class="notice-ars-deadline"><b>ARS Deadlines <%= has_service_deadline ? '' : 'Removed' %></b></div>
        <div class="">
          <label>Declaration Deadline:</label><span class="<%=
            has_service_deadline && hasUnservedServices && !deadlineInFuture ? 'error-red'
            : has_service_deadline && (!hasUnservedServices || deadlineInFuture) ? 'success-green'
            : '' %>">
            <%= Formatter.toDateAndTimeDisplay(service_deadline_date) %></span>
          &nbsp;-&nbsp;
          <label>Reinstatement Deadline:</label><span class="<%=
            has_service_deadline && hasUnservedServices && !secondDeadlineInFuture ? 'error-red'
            : has_service_deadline  && (!hasUnservedServices || secondDeadlineInFuture) ? 'success-green'
            : '' %>">
            <%= Formatter.toDateAndTimeDisplay(second_service_deadline_date) %></span>
        </div>
      </div>
      <% } %>
  </div>
</div>

<div class="notice-linked-amendments-container <%= hasLinkedAmendments ? '' : 'hidden' %>">
  <div class="notice-linked-amendments"></div>
</div>

<div class="">
  <div class="notice-respondent-service-display-container">
    <div class="notice-service-title-container">Respondent Service</div>
    <div class="notice-respondent-service-display"></div>
  </div>
  <div class="notice-respondent-service-container-hearing-tools hidden-item"></div>
</div>