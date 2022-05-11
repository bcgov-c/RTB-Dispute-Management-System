<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title">Add Hearing</h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>
    <div class="modal-body">

      <div class="createHearingModal-step1 clearfix">
        <div class="">
            <div class="create-hearing-type"></div>
            <div class="create-hearing-priority"></div>
            <div class="create-hearing-note"></div>
        </div>
        <div class="clearfix">
          <div class="create-hearing-date-container">
            <div class="create-hearing-date"></div>
            <div class="create-hearing-start-time"></div>
            <div class="create-hearing-end-time"></div>
            <button class="btn-primary btn-standard create-hearing-step1-btn">Update</button>
          </div>          
        </div>

        <div class="create-hearing-step1-error error-block hidden-item">There are unsaved changes above. Press Update to continue.</div>
      </div>


      <div class="createHearingModal-step2 <%= showStep2 ? '' : 'hidden-item' %>">
        <div class="create-hearing-arbs-container clearfix">
          <div class="create-hearing-arbs"></div>
          <button class="btn-primary btn-standard create-hearing-step2-btn">Update</button>
          <div class="create-hearing-arbs-info"><%= arbInfoMessage %></div>
        </div>
      </div>

      <div class="create-hearing-display-container <%= !showStep2 || (!$.trim(step1Display) && !$.trim(step2Display)) ? 'hidden' : '' %>">
        <div class="create-hearing-step1-display">
          <%= step1Display %>
        </div>
        <div class="create-hearing-step2-display">
          <span><%= step2Display %></span>
        </div>
      </div>

      <% if (showScheduleWarning) { %>
        <div class="error-block warning create-hearing-schedule-error">This is not indicated as working time for the selected arbitrator in the schedule. If you are unsure if this time is available contact your manager</div>
      <% } %>
      <div class="createHearingModal-step3 <%= showStep3 ? '' : 'hidden-item' %>">

        <div class="create-hearing-schedule-radio"></div>

        <div class="create-hearing-conference-container <%= showCustom ? 'hidden-item' : '' %>">
          <div class="create-hearing-bridges-container">
            <div class="create-hearing-bridges"></div>
            <div class="create-hearing-bridges-info"><%= conferenceBridgesInfoMessage %></div>
          </div>

          <div class="<%= hasSelectedBridge ? '' : 'hidden-item' %>">
            <div class="create-hearing-conference-info">
              <div class="create-hearing-participant-code"></div>
              <div class="create-hearing-moderator-code"></div>
              <div class="create-hearing-primary-dialin"></div>
              <div class="create-hearing-primary-title"></div>
              <div class="create-hearing-secondary-dialin"></div>
              <div class="create-hearing-secondary-title"></div>
            </div>
            <div class="create-hearing-conference-details"></div>
          </div>
        </div>
        <div class="create-hearing-custom-container <%= showCustom ? '' : 'hidden-item' %>">
          <div class="create-hearing-other-location"></div>
          <div class="create-hearing-instructions"></div>
        </div>
      </div>

      <div class="create-hearing-error-container error-block <%= errorMessage ? '' : 'hidden-item' %>">
        <%= errorMessage %>
      </div>


      <div class="modal-button-container">
        <button type="button" class="btn btn-lg btn-default btn-cancel cancel-button">Close</button>
        <% if (showStep3) { %>
          <button type="button" class="btn btn-lg btn-default btn-primary btn-continue">Create Hearing</button>
        <% } %>
      </div>
    </div>
  </div>
</div>
