<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title">Quick Actions</h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>
    <div class="modal-body">
      <div class="quickaccess-options">

        <div class="quickaccess-option">
          <div class="quickaccess-option quickaccess-status">
            <div class="quickaccess-option__title"><b></b>Quick status options</div>
            <div class="quickaccess-option__contents">
              <div class="quickaccess-option__quickstatuses <%= quickStatusAllowed ? '' : 'hidden' %>"></div>
              <% if (!quickStatusAllowed) { %>
                <div class="quickaccess-dismiss__step-description step-description">
                  <span class="standard-list-empty">There are currently no quick status options available for this dispute file.</span>
                </div>
              <% } %>
            </div>
          </div>

          <% if (quickOptionsLinkedFileNumbers?.length) { %>
            <div class="quickaccess-option quickaccess-options">
              <div class="quickaccess-option__title"><b></b>Quick file options</div>
              <div class="quickaccess-option__contents quickaccess-option__file-options-wrapper">
                <div class="quickstatus-title">Open all linked files</div>
                <div class="quickaccess-option__linked-files"><%= quickOptionsLinkedFileNumbers %></div>
                <div class="quickaccess-linked-files-save"></div>
              </div>
            </div>
          <% } %>

          <% if (enableQuickDismiss) { %>
          <div class="quickaccess-option quickaccess-dismiss">
            <div class="quickaccess-option__title"><b></b>Quick dismiss</div>
            <div class="quickaccess-option__contents">
              <div class="quickaccess-option__row <%= quickDismissAllowed ? '' : 'hidden' %>">
                <div>Select the conditions of the dispute</div>
                <div class="quickaccess-dismiss__type"></div>
                <div class="quickaccess-option__row__button"></div>
              </div>
              <% if (!quickDismissAllowed) { %>
                <div class="quickaccess-dismiss__step-description step-description">
                  <span class="standard-list-empty">The conditions are not correct on this dispute file for this option to be available.</span>
                  <span class=""><a role="button" class="badge help-icon">?</a></span>
                </div>
              <% } %>
            </div>
          </div>
          <% } %>

          <div class="quickaccess-option quickaccess-dismiss">
            <div class="quickaccess-option__title"><b></b>Special hearing actions</div>
            <div class="quickaccess-option__contents">
              <% if (enableInHearingCross) { %>
                <div class="quickaccess-option__row">
                  <div>After start link/cross - Enter the File Number with a future hearing to link/cross with this dispute's latest hearing</div>
                  <div class="quickaccess-dismiss__hearing-cross"></div>
                  <div class="quickaccess-option__hearing-cross__row__button"></div>
                </div>
              <% } %>
              <% if (enableHearingReschedule) { %>
                <div class="quickaccess-option__row">
                  <div>In-hearing reschedule - book a future hearing with participants and delete the current hearing</div>
                  <div class="quickaccess-option__hearing-reschedule__row__button"></div>
                </div>
              <% } %>
              <% if (!enableInHearingCross && !enableHearingReschedule) { %>
                <div class="quickaccess-dismiss__step-description step-description">
                  <span class="standard-list-empty">The conditions are not correct on this dispute file for this option to be available.</span>
                </div>
              <% } %>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
