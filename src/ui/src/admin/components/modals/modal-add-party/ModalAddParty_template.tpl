<div id="addParty_modal" class="modal modal-rtb-default" data-backdrop="static" data-keyboard="false">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Add <%= participantType ? participantType : 'Party' %> <%= baseName ? '('+baseName+')' : ''%></h4>
        <div class="modal-close-icon-lg close-x"></div>
      </div>
      <div class="modal-body">
        <% if (is_post_notice) { %>
          <div class="amendment-warning warning error-block">Important: This <%= participantType ? participantType.toLowerCase() : 'party' %> is being added after dispute notice was provided - this will be added as an amendment.</div>
        <% } %>
        <div id="addParty_participant"></div>

        <div class="amendment-container <%= is_post_notice ? '' : 'hidden' %>">
            <div class="review-applicant-title section-header">Amendment Information</div>
            <div class="amendment-regions clearfix">
              <div class="amendment-by"></div>
              <div class="amendment-rtb-init"></div>
              <div class="amendment-respondent-init"></div>
              <div class="amendment-note"></div>
            </div>
        </div>
        <div class="row">
          <div class="pull-right" style="width:100%;text-align:right;">
            <button id="addPartyCancel" type="button" class="btn btn-lg btn-default btn-cancel">
              <span>Cancel</span>
            </button>
            <button id="addPartyAmend" type="button" class="<%= is_post_notice ? '' : 'hidden' %> btn btn-lg btn-primary btn-continue">Submit Amendment</button>
            <button id="addPartySave" type="button" class="<%= is_post_notice ? 'hidden' : '' %> btn btn-lg btn-primary btn-continue">Add</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>