
<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title">Edit User</h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>

    <div class="modal-body">
      <div class="row row-bottom-margin">
        <div class="col-xs-6">
          <span class="general-modal-label">Created By:</span>&nbsp;<span class="general-modal-value"><%= createdByModel ? createdByModel.get('user_name') : '-' %></span>
        </div>
        <div class="col-xs-6">
          <span class="general-modal-label">User ID:</span>&nbsp;<span class="general-modal-value"><%= user_id %></span>
        </div>
        <div class="col-xs-6">
          <span class="general-modal-label">Created Date:</span>&nbsp;<span class="general-modal-value"><%= Formatter.toDateAndTimeDisplay(created_date) %></span>
        </div>
        <div class="col-xs-6">
          <span class="general-modal-label">User Type:</span>&nbsp;<span class="general-modal-value">Staff User</span>
        </div>
        <div class="col-xs-12">
          <span class="general-modal-label">Modified Date:</span>&nbsp;<span class="general-modal-value"><%= Formatter.toDateAndTimeDisplay(modified_date) %></span>
        </div>
        <div class="col-xs-12">
          <span class="general-modal-label">Modified By:</span>&nbsp;<span class="general-modal-value"><%= modifiedBy %></span>
        </div>
      </div>  

      <div class="row">
        <div class="col-xs-6"><span class="account-active-drop-box"></span></div>
        <div class="col-xs-6"><span class="role-group"></span></div>
        <div class="col-xs-6"><span class="display-name-input"></span></div>
        <div class="col-xs-6"><span class="role-sub-group"></span></div>
        <div class="col-xs-6"><span class="username-input"></span></div>
        <div class="col-xs-6"><span class="engagement-type"></span></span></div>

        <div class="col-xs-6"><span class="email-address"></span></div>
        <div class="col-xs-6">
          <div class="col-xs-4" style="padding: 0">
            <span class="manager-type"></span>
          </div>
          <div class="col-xs-4">
            <span class="manager-sub-type"></span>
          </div>
          <div class="col-xs-4" style="padding: 0">
            <span class="manager"></span>
          </div>
        </div>
        <div class="col-xs-6"><span class="mobile-phone"></span></div>
        <div class="col-xs-6"><span class="user-update-modal-scheduler"></span></div>

        <div class="col-xs-6">
          <span class="">Signature</span>
          <div class="modal-update-user-signature-card">
            <div class="modal-update-user-signature-image-container">
              <img class="modal-update-user-signature-image" src="<%= thumbnailUrl %>"/>
            </div>
          </div>
        </div>
        <div class="col-xs-6">
          <span class="schedule-manager"></span>
          <span class="scheduling-rules"></span>
          <span class="dashboard-access"></span>
          <span class="ceu-access"></span>
          <div class="modal-update-admin-access admin-row">
            <div class="col-xs-12 bg-danger admin-warning-label">Users with admin access can modify user rights and roles in the system.</div>
            <div class="col-xs-12 bg-danger">Admin Access</div>
            <div class="col-xs-12 bg-danger admin-access"></div>
          </div>
        </div>
      </div>        

      <div class="row">
        <div class="col-xs-12">
        <button type="button" class="btn btn-lg btn-default btn-update pull-right">
          <span>Update User</span>
        </button>               
        <button type="button" class="btn btn-lg btn-default btn-cancel pull-right">
          <span>Cancel</span>
        </button>  
        </div>
      </div>
    </div>
  </div>
</div>
