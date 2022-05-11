<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title">Hearing Linking History</h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>
    <div class="modal-body">
      <div class="modalBaseDeleteHearing-date-owner-container">
        <div class="">
          <div class="modalBaseDeleteHearing-date-info"></div>
          <div class="modalBaseDeleteHearing-link-info"></div>
        </div>
        <div class="modalBaseDeleteHearing-owner-info"></div>
      </div>

      <div class="linkingHistory-hearing-info">
        <div class="">
          <label class="general-modal-label">Created Date:</label>&nbsp;<span class="general-modal-value"><%= Formatter.toDateDisplay(created_date) %></span>
        </div>
        <div class="">
          <label class="general-modal-label">Created By:</label>&nbsp;<span class="general-modal-value"><%= Formatter.toUserDisplay(created_by) %></span>
        </div>
      </div>

      <div class="linkingHistory-results-container <%= hasResults ? '' : 'hidden' %>">
        <div class="standard-list-header">
          <div class="">File Number</div>
          <div class="">File Type</div>
          <div class="">File Role</div>
          <div class="">Modified Date</div>
          <div class="">Modified By</div>
          <div class="">Link Status</div>
        </div>
        <div class="standard-list-items">
          <% _.escape.each(disputeHearingModels, function(disputeHearingModel) { %>
            <% var isDeleted = disputeHearingModel.isDeleted(); %>
            <div class="standard-list-item">
              <div class=""><%= disputeHearingModel.getFileNumber() %></div>
              <div class=""><%= disputeHearingModel.isExternal() ? 'External' : 'Internal' %></div>
              <div class=""><%= disputeHearingModel.isPrimary() ? 'Primary' : 'Secondary' %></div>
              <div class=""><%= Formatter.toDateDisplay(disputeHearingModel.get('modified_date')) %></div>
              <div class=""><%= Formatter.toUserDisplay(disputeHearingModel.get('modified_by')) %></div>
              <div class="<%= isDeleted ? 'error-red' : 'success-green' %>"><%= isDeleted ? 'Deleted' : 'Active' %></div>
            </div>
          <% }) %>
        </div>
      </div>
      <div class="standard-list-empty <%= hasResults ? 'hidden' : '' %>">
        <div class="">Hearing has never had disputes assigned.</div>
      </div>

      <div class="modal-button-container">
        <button type="button" class="btn btn-lg btn-default btn-cancel cancel-button">Close</button>
      </div>
    </div>
  </div>
</div>

