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

        <div class="hearing-recording">
          <label class="review-label">Recording:</label>&nbsp;<%= hasRecordedHearing ? '<div class="hearing-recording-file"></div>' : '<span class="error-red">No</span>' %>
        </div>

        <div class="<%= isConference ? '' : 'hidden'  %> hearing-call-info">
          <div class="">
            <label class="review-label">Internal Bridge ID:</label>&nbsp;<span><%= conference_bridge_id %></span>
          </div>
          <div class="">
            <label class="review-label"><%= conferenceBridgeData.dial_in_description1 %>:</label>&nbsp;<span><%= Formatter.toPhoneDisplay(conferenceBridgeData.dial_in_number1) %></span>
          </div>
          <div class="">
            <label class="review-label"><%= conferenceBridgeData.dial_in_description2 %>:</label>&nbsp;<span><%= Formatter.toPhoneDisplay(conferenceBridgeData.dial_in_number2) %></span>
          </div>
          <div class="hearing-participant-code">
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
      <div class="hearing-priority-edit-warning error-block hidden-item">Duty hearings should not be set to other priorities</div>
      <div class="hearing-link-info-container clearfix">
        <div class="hearing-link-display"></div>
      </div>
    </div>
  </div>

  <div class="hearing-note"></div>

  <div class="hearing-details-instructions-container">
    <div class="">
      <label class="review-label">Instructions:</label>&nbsp;<span><%= instructionsDisplay ? (use_special_instructions ? 'Custom' : 'Standard') : '-' %></span>
      <div class="hearing-instructions">
        <%= instructionsDisplay %>
      </div>
    </div>
    <div class="hearing-instructions-text"></div>
  </div>

</div>

<div class="">
  <div class="participations-container">
    <div class="hearing-participation-view-container">
      <div class="hearing-participations-title-container">
        Hearing Participation and Information
      </div>
      <div class="hearing-participation-view"></div>
    </div>
  </div>
  <div class="hearing-participations-hearing-tools hidden-item"></div>
</div>