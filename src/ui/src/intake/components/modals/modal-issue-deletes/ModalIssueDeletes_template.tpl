<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title">Confirm Issue Deletion</h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>
    <div class="modal-body">
      <p><%= issue_delete_text %></p>
      <ul>
      <% _.escape.each(issues_to_delete, function(issue_to_delete) { %>
        <li><%= issue_to_delete %></li>
      <% }); %>
      </ul>
      <p>Press Cancel to keep <%= singular?'this':'these' %> issue<%=singular?'':'s'%> or Continue to delete the issue<%= singular?'':'s' %>.</p>

      <div class="" style="width: 100%; text-align: right;">
        <button id="issueDeletesCancel" type="button" class="btn btn-lg btn-default btn-cancel">
          <span class="">Cancel</span>
        </button>
        <button id="issueDeletesContinue" type="button" class="btn btn-lg btn-primary btn-continue">
          <span class="">Continue</span>
        </button>
      </div>
    </div>
  </div>
</div>

