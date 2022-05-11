<div id="addClaim_modal" class="modal modal-rtb-default" data-backdrop="static" data-keyboard="false">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Add Issue</h4>
          <div class="modal-close-icon-lg close-x"></div>
        </div>
        <div class="modal-body">

          <div class="dispute-party-column left-column">
            <div>
              <label class="general-modal-label">Creation Method:</label>&nbsp;<span class="general-modal-value"><%= creationMethodDisplay || '-' %></span>
            </div>
            <div>
              <label class="general-modal-label">Act:</label>&nbsp;<span class="general-modal-value"><%= dispute.get('dispute_type') === null ? 'None selected' : ( dispute.isMHPTA() ? 'MHPTA' : 'RTA' ) %></span>
            </div>
            <div>
              <label class="general-modal-label">Applicant Type:</label>&nbsp;<span class="general-modal-value"><%= dispute.get('dispute_sub_type') === null ? 'None selected' : ( dispute.isLandlord() ? 'Landlord' : 'Tenant' ) %></span>
            </div>
            <div>
              <label class="general-modal-label">Tenancy Status:</label>&nbsp;<span class="general-modal-value"><%= dispute.get('tenancy_ended') === null ? 'None selected' : (dispute.isPastTenancy() ? 'Past' : 'Current') + ' Tenant' %></span>
            </div>
          </div>
          <div class="dispute-party-column right-column">
            <div>
              <label class="general-modal-label">Dispute Process:</label>&nbsp;<span class="general-modal-value"><%= Formatter.toProcessDisplay(dispute.getProcess()) %></span>
            </div>
            <div>
              <label class="general-modal-label">Security Deposit:</label>&nbsp;<span class="general-modal-value"><%= dispute.get('security_deposit_amount') ? 'Yes - '+Formatter.toAmountDisplay(security_deposit_amount) : 'None' %></span>
            </div>
            <div>
              <label class="general-modal-label">Pet Damage Deposit:</label>&nbsp;<span class="general-modal-value"><%= dispute.get('pet_damage_deposit_amount') ? 'Yes - '+Formatter.toAmountDisplay(pet_damage_deposit_amount) : 'None' %></span>
            </div>
            <div>
              <label class="general-modal-label"></label>&nbsp;<span class="general-modal-value"></span>
            </div>
          </div>


          <% if (is_post_notice) { %>
            <div class="amendment-warning warning error-block">Important: This issue is being added after dispute notice was provided - this will be added as an amendment.</div>
          <% } %>

          <div class="claim-selector"></div>

          <div class="claim-add-edit-container"></div>
  
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
              <button id="addPartySave" type="button" class="<%= is_post_notice ? 'hidden' : '' %> btn btn-lg btn-primary btn-continue">Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  