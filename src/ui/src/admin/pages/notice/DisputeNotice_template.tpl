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