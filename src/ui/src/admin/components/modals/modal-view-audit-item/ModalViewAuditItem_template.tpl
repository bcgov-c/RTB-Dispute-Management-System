<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title">Change Log Item</h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>

    <div class="modal-body clearfix">

        <div class="next-prev-audit-top-container">  
          <button type="button" class="btn btn-lg btn-default btn-primary btn-prev">
            <span>Prev Item</span>
          </button>        
          <button type="button" class="btn btn-lg btn-default btn-primary btn-next">
            <span>Next Item</span>
          </button>                           
        </div>

        <div class="dispute-party-column left-column">
          <div class="">
            <span class="general-modal-label">Change Item ID:</span> <span class="general-modal-value"> <%=audit_log_id%></span>
          </div>
          <div class="">
            <span class="general-modal-label">Type of Change:</span> <span class="general-modal-value"> <%=typeOfChangeDisplay%></span>
          </div>
          <div class="">
            <span class="general-modal-label">Change to:</span> <span class="general-modal-value"> <%=changeToDisplay%></span>
          </div>
          <div class="">
            <span class="general-modal-label">Change Date/Time:</span> <span class="general-modal-value"> <%=Formatter.toDateAndTimeDisplay(submitted_date)%></span>
          </div>
        </div>

        <div class="dispute-party-column right-column">
          <div class="">
            <span class="general-modal-label">Submitter Role: </span><span class="general-modal-value"> <%=submitterRoleDisplay %></span>
          </div>
          <div class="">
            <span class="general-modal-label">Submitter User ID: </span><span class="general-modal-value"> <%=submitter_user_id ? submitter_user_id : '-' %></span>
          </div>
          <div class="">
            <span class="general-modal-label">Submitter Participant ID: </span><span class="general-modal-value"> 
              <%=submitter_participant_id ? submitter_participant_id : '-' %></span>
          </div>
          <div class="">
            <span class="general-modal-label">Submitter Name: </span><span class="general-modal-value"> <%= submitter_name || '-' %></span>
          </div>
        </div>
      
        <div class="audit-json-request-title"><span class="general-modal-label">Request Data</span></div>
        <div class="audit-json-request-body">
          <div class="request-json-view">No Content</div>
        </div>

        <div class="api-call-row">
          <span class="general-modal-label">API Call:</span> <span class="general-modal-value"> <%=api_call_type%>&nbsp;<%=api_name%></span>
        </div>
        <div class="">
          <span class="general-modal-label">Response Code: </span><span class="general-modal-value"> <%= api_response %></span>
        </div>
        <div class="">
          <span class="general-modal-label">Associated Record ID: </span><span class="general-modal-value"> <%= associated_record_id || '-' %></span>
        </div>

        <% if (api_error_response) { %>
          <div class="error-response-row"><span class="general-modal-label">Error Response</span></div>   
          <div class=""><%=api_error_response%></div>  
        <% } %>
        <div class="next-prev-audit-bottom-container">  
          <button type="button" class="btn btn-lg btn-default btn-primary btn-prev">
            <span>Prev Item</span>
          </button>        
          <button type="button" class="btn btn-lg btn-default btn-primary btn-next">
            <span>Next Item</span>
          </button>                           
        </div>
    </div>
  </div>
</div>
