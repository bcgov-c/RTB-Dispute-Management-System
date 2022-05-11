<div class="hearing-tools-header <%= mode %>">
  <span>Outcome</span>
  <span class="clickable float-right hearing-tools-edit">Edit</span>
  <span class="float-right hearing-tools-edit-mode-buttons hidden-item">
    <span class="clickable float-right hearing-tools-clear-outcome">Clear Outcome Information</span>
  </span>
</div>
<div class="claim-outcome-container <%= mode %>">
  <!-- View mode -->
  <div class="dispute-claim-outcome-wrapper">
    <div class="dispute-claim-outcome-display-img">
      <img src="<%= ClaimOutcomeUserIcon %>"/>
    </div>
    <div class="claim-outcome-display">
      <div>Arbitrator outcome:&nbsp;<span><%= outcomeDisplay || '-' %></span></div>
      <span class="dispute-claim-modified-by"><%= hadStaffActivity ? (outcomeModifiedDisplay || '') : '-' %></span>
    </div>
  </div>

  <!-- Edit mode -->
  <div class="claim-outcome-edit">
    <div class="hearing-tools-top-row">
      <div class="hearing-tools-issue-options"></div>
   
      <% if (isInclude) { %>
        <div class="hearing-tools-include-outcome"></div>

        <% if (isAwarded|| isSettled) { %>
          <% if (isMonetaryOutcomeIssue) { %>
            <div class="hearing-tools-award-amount"></div>
          <% } else if (isLandlordMoveOutIssue) { %>
            <div class="hearing-tools-award-date-container">
              <div class="hearing-tools-award-date-type"></div>
              <% if (isDateTypeSpecific) { %>
                <div class="hearing-tools-award-date-specific"></div>
              <% } %>
            </div>
          <% } %>
        <% } else if (isDismiss) { %>
          <div class="hearing-tools-dismiss-options"></div>
        <% } %>
      <% } else if (isRemove) { %>
        <div class="hearing-tools-remove-outcome"></div>
        <% if (isAmend) { %>
          <div class="hearing-tools-amend-options"></div>
        <% } else if (isSever) { %>
          <div class="hearing-tools-sever-options"></div>
        <% } %>
      <% } %>
    </div>
    <div class="hearing-tools-bottom-bar">
      <div class="hearing-tools-outcome-details"></div>
    </div>
  </div>
</div>
<div class="hearing-tools-save-controls <%= mode %>">
  <span class="hearing-tools-save-controls-cancel">Cancel</span>            
  <span class="hearing-tools-separator"></span>
  <span class="hearing-tools-save-controls-save">Save Changes</span>
</div>