<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title">Edit Linked Applications</h4>
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
          <label class="review-label">Hearing Notice:</label>&nbsp;
          <% if (hasHearingNotice) { %>
            <span class="error-red"><b>Yes </b> - Changing this linking may create errors in the hearing notice</span>
          <% } else { %>
            <span class="">No</span>
          <% } %>
        </div>
      </div>

      <div class="editHearingLink-inputs-container <%= hasPrimary ? '' : 'hidden'  %>">
        <div class="editHearingLink-link-type"></div>
        <div class="editHearingLink-add-container">
          <div class="editHearingLink-type-dropdown"></div>
          <div class="editHearingLink-add-dms-container <%= isDmsTypeSelected ? '' : 'hidden' %>">
            <div class="editHearingLink-add-dms"></div>
            <div class="editHearingLink-add-btn editHearingLink-add-dms-btn">Add</div>
          </div>
          <div class="editHearingLink-add-external-container <%= isDmsTypeSelected ? 'hidden' : '' %>">
              <div class="editHearingLink-add-external"></div>
              <div class="editHearingLink-add-btn editHearingLink-add-external-btn">Add</div>
          </div>
        </div>
      </div>

      <div class="editHearingLink-linked-applications"></div>

      <div class="modal-button-container">
        <button type="button" class="btn btn-lg btn-default btn-cancel cancel-button">Close</button>
      </div>
    </div>
  </div>
</div>

