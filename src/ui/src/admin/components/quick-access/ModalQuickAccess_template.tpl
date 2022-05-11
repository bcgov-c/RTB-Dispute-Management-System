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
        </div>
      </div>
    </div>
  </div>
</div>
