<div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Book (assign first dispute)</h4>
        <div class="modal-close-icon-lg close-x"></div>
      </div>
      <div class="modal-body">
        <div class="editHearingLink-general-info">
          <div>
            <label class="review-label">Hearing:</label>&nbsp;<span><%= hearingDateTimeDisplay %></span>
          </div>
          <div>
            <label class="review-label">Type:</label>&nbsp;<span><%= Formatter.toHearingTypeDisplay(hearing_type) %></span>
          </div>
          <div>
            <label class="review-label">Priority:</label>&nbsp;<span><%= Formatter.toUrgencyDisplay(hearing_priority, { urgencyColor: true }) %></span>
          </div>
          <div>
            <label class="review-label">Assigned To:</label>&nbsp;<span><%= hearing_owner ? Formatter.toUserDisplay(hearing_owner) : '-' %></span>
          </div>
        </div>
  
        <div class="editHearingLink-inputs-container">
          <div class="editHearingLink-type-dropdown"></div>
          <div class="editHearingLink-add-container">
            <div class="editHearingLink-add-dms-container <%= isDmsTypeSelected ? '' : 'hidden' %>">
              <div class="editHearingLink-add-dms"></div>
              <div class="editHearingLink-add-btn editHearingLink-add-dms-btn <%= selectedDispute ? 'hidden' : '' %>">Add</div>
            </div>
            <div class="editHearingLink-add-external-container <%= isDmsTypeSelected ? 'hidden' : '' %>">
                <div class="editHearingLink-add-external"></div>
                <div class="editHearingLink-add-btn editHearingLink-add-external-btn <%= selectedDispute ? 'hidden' : '' %>">Add</div>
            </div>
          </div>
        </div>
  
        <div class="addHearing-search-results <%= selectedDispute ? '' : 'hidden' %>">
          <div class="standard-list-header">
            <div class="">File Number</div>
            <div class="">Complexity</div>
            <div class="">Link Role</div>
            <div class="">Link Type</div>
          </div>
          <div class="standard-list-items">
            <div class="standard-list-item addHearing-search-result">
              <div class="editHearingLink-file-number"><%= selectedDispute %></div>
              <div class="editHearingLink-file-complexity"><%= complexity %></div>
              <div class="editHearingLink-link-role">Primary</div>
              <div class="editHearingLink-file-link-type"><%= !isDmsTypeSelected ? 'External' : 'Internal - DMS' %></div>
              <div class="editHearingLink-remove error-red">
                <b class="glyphicon glyphicon-remove clickable"></b>
              </div>
            </div>
          </div>
        </div>
  
        <div class="modal-button-container">
          <button type="button" class="btn btn-lg btn-default btn-cancel cancel-button">Close</button>
          <button
            type="button"
            class="btn btn-lg btn-default btn-primary btn-continue <%= selectedDispute? '' : 'disabled' %>"
            <%= selectedDispute? '' : 'disabled="disabled"' %>
          >Book (assign)</button>
        </div>
      </div>
    </div>
  </div>
  
  