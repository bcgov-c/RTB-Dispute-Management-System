<div class="modal-dialog">
  <div class="modal-content clearfix">
    <div class="modal-header">
      <h4 class="modal-title">View Email / Pickup</h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>

    <div class="comm-section-filters-container clearfix">
        <div id="comm-email-forward-resend">

          <div id="comm-email-resend" class="comm-email-resend <%= showResend? '' : 'hidden' %>"></div>
          <div id="comm-email-forward" class="comm-email-forward"></div>
          <div class="comm-email-print clickable <%= emailModel.isPickup() ? '' : 'hidden' %>">
            <span>Print</span>
          </div>

          <div class="comm-email-pickup-status-container <%= emailModel.isPickup() ? '' : 'hidden' %>">
            <div class="comm-email-pickup-status-text">
              <span>Set Pickup Status</span>
            </div>
            <div class="comm-email-pickup-status-edit hidden">
              <div class="comm-email-pickup-status"></div>
              <div class="component-email-buttons">
                <div class="comm-email-pickup-status-cancel component-email-buttons-cancel"></div>
                <div class="comm-email-pickup-status-ok component-email-buttons-ok"></div>
              </div>
            </div>
          </div>
        </div>
    </div>

    <div class="modal-body">
      <div class="row email-no-bottom-padding-row">
        <div class="col-xs-6">
          <span class="general-modal-label">Type:</span> <span class="general-modal-value"><b> <%= emailType %></b></span>
        </div>
        <div class="col-xs-6">
          <span class="general-modal-label">Status:</span>&nbsp;<span class="general-modal-value"><b><%= statusToDisplay %></b></span>
        </div>   
        <div class="col-xs-6">
          <span class="general-modal-label">From:</span> <span class="general-modal-value"> <%=emailModel.get('email_from') %></span>
        </div>
        <div class="col-xs-6">
          <span class="general-modal-label">Preferred send date/time:</span> <span class="general-modal-value"> <%=Formatter.toDateAndTimeDisplay(emailModel.get('preferred_send_date')) || '-' %></span>
        </div>
        <div class="col-xs-6">
          <span class="general-modal-label">Template:</span>&nbsp;<span class="general-modal-value"><%= templateName %></span>
        </div>
        <div class="col-xs-6">
          <span class="general-modal-label">Response due date/time:</span> <span class="general-modal-value"> <%= Formatter.toDateAndTimeDisplay(emailModel.get('response_due_date')) || '-' %></span>
        </div>
        <div class="col-xs-6">
          <span class="general-modal-label">Created:</span>&nbsp;<span class="general-modal-value"><%= Formatter.toDateAndTimeDisplay(emailModel.get('created_date')) %></span>
        </div>
        <div class="col-xs-6">
          <span class="general-modal-label">System send retries:</span>&nbsp;<span class="general-modal-value"><%= emailModel.get('retries') %></span>
        </div>             
      </div>          

        <div class="email-modal-divider"></div>

        <div class="row email-no-bottom-padding-row">
          <div class="col-xs-9">
            <span class="general-modal-label">Subject:</span>&nbsp;<span class="general-modal-value"><%= emailModel.get('subject') %></span>
          </div>
          <div class="col-xs-12">
            <span class="general-modal-label">Recipient:</span>&nbsp;<span class="general-modal-value">
              <% if (emailModel.isPickup() && participant) {
                print(participant.getMessageRecipientDisplayHtml({ no_icons: true, no_email: true }));
              } else if (emailModel.get('email_to')) { %>
                <a href="mailto:<%= emailModel.get('email_to') %>"><%= emailModel.get('email_to') %></a>
              <% } else { %>
                -
              <% } %>
            </span>
          </div>
          <div class="col-xs-12 modal-view-email-attachment-container">
            <span class="general-modal-label">Attachments:&nbsp;</span>
            <div class="modal-view-email-attachment-files"></div>
          </div>
          <% if (showMissingFilesWarning) { %>
            <p class="modal-view-email-attachment-files-warning">Some email files could not be loaded and are not shown</p>
          <% } %>
        </div>

        <div class="row email-no-bottom-padding-row">
          <div class="col-xs-12">
            <div class="modal-view-email__email-content"></div>
            <div class="email-print-frame hidden"></div>
          </div>
        </div>


          <div class="modal-button-container">
          <button type="button" class="btn-cancel btn btn-lg btn-default btn-standard btn-primary">Close</button>
          </div>
        
    </div>
  </div>
</div>
