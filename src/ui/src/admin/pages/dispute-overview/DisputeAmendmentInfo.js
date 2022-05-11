import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';

const amendmentsChannel = Radio.channel('amendments');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const claimsChannel = Radio.channel('claims');
const configChannel = Radio.channel('config');

export default Marionette.View.extend({
  template: _.template(`
    <div class="amendment-info-container">
    <% _.each(removedAmendedParties, function(p) { %>
      <div class="amendment-info-item">
        <div class="amendment-icon" data-type=<%= AMENDMENT_TO_TYPE_PARTY %> ></div>
        <span class="">Party Removed - </span><span class=""><%= p.getDisplayName() %>&nbsp(<%= getTenantTypeString(p) %>)</span>
      </div>
    <% }) %>

    <% _.each(removedAmendedClaims, function(c) { %>
      <div class="amendment-info-item">
        <div class="amendment-icon" data-type=<%= AMENDMENT_TO_TYPE_ISSUE %> ></div>
        <span class="">Issue Removed - </span><span class=""><%= c.getClaimTitleWithCode() %></span>
      </div>
    <% }) %>
    </div>
  `),

  ui: {
    amendmentIcon: '.amendment-icon'
  },

  events: {
    'click @ui.amendmentIcon': 'clickAmendmentIcon'
  },

  clickAmendmentIcon(ev) {
    const ele = $(ev.currentTarget);
    const amendmentToType = ele.data('type');
    amendmentsChannel.request('show:modal:view', amendmentToType);
  },

  initialize() {
    this.dispute = disputeChannel.request('get');

    const removedParties = participantsChannel.request('get:removed');
    const removedClaims = claimsChannel.request('get:removed');

    this.listenTo(removedParties, 'update', this.render, this);
    this.listenTo(removedClaims, 'update', this.render, this);
  },

  templateContext() {
    return {
      removedAmendedParties: participantsChannel.request('get:removed').filter(function(p) { return p.isAmendRemoved(); }),
      removedAmendedClaims: claimsChannel.request('get:removed').filter(function(c) { return c.isAmendRemoved(); }),
      getTenantTypeString: (participantModel) => {
        const isApplicant = participantModel.isApplicant();
        if (this.dispute.isTenant()) {
          return isApplicant? 'Tenant' : 'Landlord';
        } else {
          return isApplicant ? 'Landlord' : 'Tenant';
        }
      },
      AMENDMENT_TO_TYPE_PARTY: configChannel.request('get', 'AMENDMENT_TO_TYPE_PARTY'),
      AMENDMENT_TO_TYPE_ISSUE: configChannel.request('get', 'AMENDMENT_TO_TYPE_ISSUE'),
    };
  }
});