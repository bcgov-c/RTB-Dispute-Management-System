<div class="modal-dialog">
  <div class="modal-content clearfix">
    <div class="modal-header">
      <h4 class="modal-title"><%= title %></h4>
      <div class="modal-close-icon-lg close-x <%= hideAllControls || hideHeaderX ? 'hidden' : '' %>"></div>
    </div>
    <div class="modal-body clearfix">
      <%= bodyHtml %>
      <div class="modal-blank-form-groups"></div>
      <div class="modal-blank-buttons pull-right">
        <button type="button" class="btn btn-lg btn-default btn-cancel cancel-button <%= hideCancelButton || hideAllControls ? 'hidden' : '' %>">
          <span class="<%= cancelButtonTextMobile? 'hidden-xs' : '' %>"><%= cancelButtonText %></span>
          <span class="<%= cancelButtonTextMobile? 'hidden-sm hidden-md hidden-lg' : 'hidden' %>"><%= cancelButtonTextMobile %></span>
        </button>
        <% if (secondaryButtonText && !hideAllControls) { %>
          <button type="button" class="btn btn-lg btn-default btn-secondary">
            <span class=""><%= secondaryButtonText %></span>
          </button>
        <% } %>
        <button type="button" class="btn btn-lg btn-primary btn-continue continue-button <%= hideContinueButton || hideAllControls ? 'hidden' : '' %>">
          <span class="<%= primaryButtonTextMobile? 'hidden-xs' : ''%>"><%= primaryButtonText %></span>
          <span class="<%= primaryButtonTextMobile? 'hidden-sm hidden-md hidden-lg' : 'hidden'%>"><%= primaryButtonTextMobile %></span>
        </button>
      </div>
    </div>
  </div>
</div>

