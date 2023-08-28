<div class="dispute-outcome-doc-section-final">
  <div class="clearfix">
    <div class="dispute-outcome-doc-group-delivery-date-container">
      <b class="dispute-outcome-doc-group-delivery-date-icon"></b>
      <div class="dispute-outcome-doc-group-delivery-date"></div> 
    </div>
    <div class="<%= showNoteworthyDisplay ? '' : 'hidden' %>">
      <div class="dispute-outcome-doc-group-different"></div>
      <div class="dispute-outcome-doc-group-noteworthy"></div>
      
      <div class="dispute-outcome-doc-group-noteworthy-display">
        <%= materiallyDifferentDisplay %><%= materiallyDifferentDisplay && noteworthyDisplay ? ', ' : '' %><%= noteworthyDisplay %>
      </div>
    </div>
    <div class="dispute-outcome-doc-group-delivery-status">
      <b class="doc-group-delivery-<%= allIncludedCheckboxesDelivered ? 'checked' : 'unchecked' %>"></b>
      <span>Ready to deliver<%= allIncludedCheckboxesDelivered && earliestReadyForDeliveryDate ? ':':'' %></span>
      <% if (allIncludedCheckboxesDelivered && earliestReadyForDeliveryDate) { %>
        &nbsp;<span class="doc-group-delivery-date-text"><%= Formatter.toDateAndTimeDisplay(earliestReadyForDeliveryDate) %></span>
      <% } %>
    </div>
    <div class="dispute-outcome-doc-group-delivery-priority">
      <b class="<%= priorityIconClass || '' %>"></b>
      <span>Delivery Priority</span>
    </div>
  </div>

  <div class="dispute-outcome-writing-container">
  <b class="delivery-time-icon"></b>
    <div class="dispute-outcome-writing-time"></div>
    <div class="decision-complexity"></div>
  </div>

  <div class="dispute-outcome-doc-files-header <%= hasFinalDocs ? '' : 'outcome-doc-files-empty' %>">
    <div class="outcome-doc-file-title">Final Documents</div>
    <div class="outcome-doc-file-uploads-container"></div>
    <div class="outcome-doc-file-status">Status</div>
    <div class="outcome-doc-file-comment">Comment</div>
    <div class="outcome-doc-file-visible"></div>
    <div class="outcome-doc-file-source">Source</div>
  </div>
  <div class="dispute-outcome-doc-files-final"></div>
</div>

<div class="dispute-outcome-doc-section-public <%= hidePublicDocs ? 'hidden' : '' %>">
  <div class="dispute-outcome-doc-files-header <%= hasPublicDocs ? '' : 'outcome-doc-files-empty' %>">
    <div class="outcome-doc-file-title">Public Final Documents</div>
    <div class="outcome-doc-file-uploads-container"></div>
    <div class="outcome-doc-file-status">Status</div>
    <div class="outcome-doc-file-comment"></div>
    <div class="outcome-doc-file-visible">Visible to public?</div>
    <div class="outcome-doc-file-source">Source</div>
  </div>
  <div class="dispute-outcome-doc-files-public"></div>
  <% if (hasPublicDocError) { %>
    <div class="dispute-outcome-doc-section-public__error warning error-block">This file encountered an error during system processing and was not added to the Posted Decisions site</div>
  <% } %>
</div>

<div class="<%= hideDeliveries ? 'hidden' : '' %>">
  <div class="dispute-outcome-doc-delivery-header">
    <div class="outcome-doc-delivery-name-container">Final Document Delivery</div>
    <div class="outcome-doc-delivery-inclusions-container">Documents</div>
    <div class="outcome-doc-delivery-method-container">Method</div>
    <div class="outcome-doc-delivery-details-container"></div>
    <div class="outcome-doc-delivery-sent-container">Status</div>
    <div class="outcome-doc-delivery-bulk-select"></div>
    <div class="dispute-outcome-doc-group-add-other-delivery">
      <span>Add Participant Delivery Instruction</span>
    </div>
    <div class="dispute-outcome-doc-section-priority-container hidden-item">
      <span class="dispute-outcome-doc-section-priority"></span>
      <span>Delivery Priority</span>
    </div>
    <div class="dispute-outcome-doc-section-checkbox hidden-item"></div>
  </div>
  <div class="dispute-outcome-doc-files-delivery"></div>
</div>

<div class="dispute-outcome-doc-section-external">
  <div class="dispute-outcome-doc-files-header">
    <div class="outcome-doc-file-title">Working Documents</div>
    <div class="dispute-outcome-doc-section-btn">Upload working document</div>
  </div>
  <div class="dispute-outcome-doc-files-external"></div>
</div>