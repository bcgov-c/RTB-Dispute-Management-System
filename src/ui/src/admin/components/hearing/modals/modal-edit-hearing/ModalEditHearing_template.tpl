<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title"><%= isViewOnly ? 'View ' : 'Edit '%>Hearing</h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>
    <div class="modal-body <%= editTypeClass %>">
      <div class="review-information-body hearing-item">
        <div class="two-column-edit-container">
          <div class="dispute-party-column left-column">
      
            <div class="hearing-info-display-container">
              <div class="hearing-info-calendar-container clearfix">
                <div class="hearing-type-title-container">
                  <span class="hearing-type-title-display"><%= Formatter.toHearingTypeDisplay(hearing_type) %></span>
                  <span class="hearing-status-display <%= isActive? 'success-green' : 'inactive' %>">
                    <div class="hearing-status-icon <%= isActive? 'active' : 'inactive' %>"></div>
                    <span><%= isActive ? 'Active' : 'Inactive' %></span>
                  </span>
                </div>
      
                <div class="hearing-date-display-container">
                  <div class="hearing-start-date-icon"></div>
                  <span class="hearing-start-date-display">
                    <%= Formatter.toWeekdayShortDateYearDisplay(local_start_datetime) %>
                  </span>
                  <div class="hearing-start-time-display-container">
                    <div class="hearing-start-time-icon"></div>
                    <span class="hearing-start-time-display">
                      <%= Formatter.toTimeDisplay(local_start_datetime) %>
                    </span>
                    <span class="hearing-duration-display">
                      (<%= Formatter.toDuration(local_start_datetime, local_end_datetime) %>)
                    </span>
                  </div>
                </div>
              </div>

      
              <div class="hearing-end-time"></div>
      
              <div class="hearing-notice-generated-info">
                <label class="review-label">Notice generated for this hearing:</label>&nbsp;<span><%= noticeGeneratedDisplay %></span>
              </div>
      
              <div class="spacer-block-30"></div>
              <div class="<%= isConference ? '' : 'hidden' %>">
                <div class="">
                  <label class="review-label">Internal Bridge ID:</label>&nbsp;<span><%= conference_bridge_id %></span>
                </div>
                <div class="">
                  <label class="review-label"><%= conferenceBridgeData.dial_in_description1 %>:</label>&nbsp;<span><%= Formatter.toPhoneDisplay(conferenceBridgeData.dial_in_number1) %></span>
                </div>
                <div class="">
                  <label class="review-label"><%= conferenceBridgeData.dial_in_description2 %>:</label>&nbsp;<span><%= Formatter.toPhoneDisplay(conferenceBridgeData.dial_in_number2) %></span>
                </div>
      
                <div class="spacer-block-10"></div>
                <div class="">
                  <label class="review-label">Participant Access Code:</label>&nbsp;<span><%= conferenceBridgeData.participant_code %></span>
                </div>
              </div>
              <div class="<%= isConference ? 'hidden' : '' %>">
                <div class="">
                  <label class="review-label">Location:</label>&nbsp;<span><%= hearing_location %></span>
                </div>
              </div>
      
            </div>
      
          </div>
          
          <div class="dispute-party-column right-column hearing-actions">
            <div class="hearing-owner-display"></div>
            <div class="hearing-priority-edit"></div> 
            <% if (isReserved) { %> <span class="hearing-on-hold-view">On Hold</span> <% } %>
            <div class="hearing-on-hold-edit"></div>
            <div class="hearing-priority-edit-warning error-block hidden-item">Duty hearings should not be set to other priorities</div>
            <div class="spacer-block-10"></div>
            <div class="hearing-result-hearing-tools hidden-item hidden"></div>
            <div class="spacer-block-10"></div>
            <div class="hearing-link-info-container clearfix">
              <div class="hearing-link-display"></div>
            </div>
          </div>
        </div>
      
        <div class="spacer-block-10"></div>
        <div class="hearing-note"></div>
        <div class="spacer-block-10"></div>
      
        <div class="hearing-details-instructions-container">
          <div class="">
            <label class="review-label">Instructions:</label>&nbsp;<span><%= instructionsDisplay ? (use_special_instructions ? 'Custom' : 'Standard') : '-' %></span>
            <div class="spacer-block-5"></div>
            <div class="">
              <%= instructionsDisplay %>
            </div>
          </div>
          <div class="hearing-instructions-text"></div>
        </div>
      
      </div>

      <div class="modal-button-container">
        <button type="button" class="btn btn-lg btn-default btn-cancel cancel-button">Close</button>
        
        <% if (!isViewOnly) { %>
          <button type="button" class="btn btn-lg btn-default btn-primary btn-continue">Save</button>
        <% } %>
      </div>
    </div>
  </div>
</div>

