import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import DisputeClaimCollection from '../../../core/components/claim/DisputeClaim_collection';
import template from './SearchResult_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const configChannel = Radio.channel('config');
const statusChannel = Radio.channel('status');
const loaderChannel = Radio.channel('loader');
const searchChannel = Radio.channel('searches');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'search-result-item',

  ui: {
    fileNumber: '.file-number-link',
    crossFileNumber: '.cross-app-number',
  },

  events: {
    'click @ui.fileNumber': 'clickSearchFileNumber',
    'click @ui.crossFileNumber': 'clickCrossAppNumber',
  },

  initialize() {
    this.HEARING_LINK_TYPE_DISPLAY = configChannel.request('get', 'HEARING_LINK_TYPE_DISPLAY') || {};
    this.PAYMENT_METHOD_DISPLAY = configChannel.request('get', 'PAYMENT_METHOD_DISPLAY') || {};
    this.DISPUTE_CREATION_METHOD_DISPLAY = configChannel.request('get', 'DISPUTE_CREATION_METHOD_DISPLAY') || {};
    this.ID_CLAIM_CODES = _.invert(configChannel.request('get', 'CLAIM_ID_CONVERSIONS')) || {};

    // Set dispute fields
    this.disputeType = this.model.get('dispute_sub_type') === configChannel.request('get', 'DISPUTE_SUBTYPE_LANDLORD') ? 'Landlord' : 'Tenant',
    this.disputeSubType = this.model.get('dispute_type') === configChannel.request('get', 'DISPUTE_TYPE_MHPTA') ? 'MHPTA' : 'RTA';
    
    // Set payment
    this.paymentMethodDisplay = this.PAYMENT_METHOD_DISPLAY[this.model.get('intake_payment_payment_method')] || null;

    // Set claims
    this.issueCodesDisplay = Formatter.toIssueCodesDisplay(new DisputeClaimCollection(this.model.get('claims')));

    // Set hearing display
    const hearingLinkTypeToUse = this.model.get('shared_hearing_link_type') || (this.model.get('hearing_start_date') ? 1 : null);
    this.linkTypeDisplay = this.HEARING_LINK_TYPE_DISPLAY[hearingLinkTypeToUse] || '-';
    this.linkTypeDisplay = this.linkTypeDisplay.replace(' Application', '');
    
    // Set creation method
    this.creationMethodDisplay = this.DISPUTE_CREATION_METHOD_DISPLAY[this.model.get('creation_method')] || '-';
  },

  getComplexityUrgencyDisplay() {
    const urgency = this.model.get('dispute_urgency');
    const complexity = this.model.get('dispute_complexity');

    if (complexity && urgency) return `<span>${Formatter.toComplexityDisplay(complexity)}</span> : ${Formatter.toUrgencyDisplay(urgency, { urgencyColor: true })}`;
    else if (complexity) return `${Formatter.toComplexityDisplay(complexity)}`;
    else if (urgency) return `${Formatter.toUrgencyDisplay(urgency, { urgencyColor: true })}`;
    return '<span>-</span>';
  },

  clickSearchFileNumber() {
    loaderChannel.trigger('page:load');
    searchChannel.request('search:dispute:direct', this.model.get('file_number'))
      .done(disputeGuid => {
        if (!disputeGuid) {
          loaderChannel.trigger('page:load:complete');
          // Simulate a 400 error for UI display
          generalErrorFactory.createHandler('ADMIN.SEARCH.DISPUTE')({ status: 400 });
        } else {
          Backbone.history.navigate(`dispute/${disputeGuid}`, { trigger: true });
        }
      }).fail(err => {
        loaderChannel.trigger('page:load:complete');
        generalErrorFactory.createHandler('ADMIN.SEARCH.DISPUTE')(err);
      });
  },

  clickCrossAppNumber() {
    // Deprecated
  },

  onBeforeRender() {
    
  },

  templateContext() {

    return {
      Formatter,
      crossScore: this.model.get('cross_score'),
      disputeType: this.disputeType,
      disputeSubType: this.disputeSubType,
      paymentMethodDisplay: this.paymentMethodDisplay,
      issueCodesDisplay: this.issueCodesDisplay,
      complexityUrgencyDisplay: this.getComplexityUrgencyDisplay(),
      creationMethodDisplay: this.creationMethodDisplay,
      linkTypeDisplay: this.linkTypeDisplay,
      stage_status_color_code: statusChannel.request('get:colourclass', this.model.get('stage'), this.model.get('status')),
    };
  }
});
