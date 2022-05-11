<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title">Create/Modify Outcome Document(s)</h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>
    <div class="modal-body">
      <div class="addOutcomeDocSet_top-container">
        <div class="">
          <div>
            <label class="general-modal-label">Act:</label>&nbsp;<span class="general-modal-value"><%= dispute.get('dispute_type') === null ? 'None selected' : ( dispute.isMHPTA() ? 'MHPTA' : 'RTA' ) %></span>
          </div>

          <div>
            <label class="general-modal-label">Stage:</label>&nbsp;<span class="general-modal-value <%= colourClass %>"><%= Formatter.toStageDisplay(dispute.getStage()) %></span>
          </div>

          <div>
            <label class="general-modal-label">Status:</label>&nbsp;<span class="general-modal-value <%= colourClass %>"><%= Formatter.toStatusDisplay(dispute.getStatus()) %></span>
          </div>

          <div>
            <label class="general-modal-label">Process:</label>&nbsp;<span class="general-modal-value"><%= Formatter.toProcessDisplay(dispute.getProcess()) %></span>
          </div>

          <div>
            <label class="general-modal-label">Owner:</label>&nbsp;<span class="general-modal-value"><%= dispute.getOwner() ? Formatter.toUserDisplay(dispute.getOwner()) : 'Unassigned' %></span>
          </div>

          <div>
            <label class="general-modal-label">Link Type:</label>&nbsp;<span class="general-modal-value"><%= linkTypeDisplay %></span>
          </div>
        </div>
        <div class="addOutcomeDocSet_show-all"></div>
      </div>

      <% if (showFileSubType) { %>
        <div class="addOutcomeDocSet_instructions clearfix">
          <div><%= !isShowAllSelected ? '<b>Important</b>: This file either has a Request for Correction or a successful Application for Review Consideration which resulted in a Review Hearing.' : '' %> Please indicate whether this document set is for a Corrected Decision and/ or Order or if it is a Review Hearing Decision and Order(s).</div>
          <div class="addOutcomeDocSet_file-sub-type"></div>
        </div>
      <% } %>

      <div class="addOutcomeDocSet_instructions">
        Select the document you would like to add to this set.<%= !isShowAllSelected ? ' The documents that are available in this list depend on the process and link type of the dispute file.':''%> Documents that are already added cannot be removed from this view.
      </div>

      <div class="addOutcomeDocFile_inputs <%= isShowAllSelected ? 'showAll' : '' %>">
        <div id="addOutcomeDocFile_checkboxes"></div>
        <div class="addOutcomeDocFile_checkboxes-other <%= isOtherDocTypeSelected ? '' : 'hidden' %>">
          <div id="addOutcomeDocFile_title" class=""></div>
          <div id="addOutcomeDocFile_acronym" class=""></div>
        </div>
      </div>

      <div class="modal-button-container">
        <button type="button" class="btn btn-lg btn-default btn-cancel">Cancel</button>
        <button id="addOutcomeDocFile_save" type="button" class="btn btn-lg btn-primary btn-continue">Save Set</button>
      </div>
    </div>
  </div>
</div>
