import Backbone from 'backbone';
import Radio from 'backbone.radio';
import { routeParse } from '../../../routers/mainview_router';
import ComposerSectionView from '../../../components/composer/ComposerSection';
import template from './BackgroundSection_template.tpl';

const disputeChannel = Radio.channel('dispute'),
  configChannel = Radio.channel('config'),
  filesChannel = Radio.channel('files'),
  Formatter = Radio.channel('formatter').request('get');

export default ComposerSectionView.extend({
  className: `${ComposerSectionView.prototype.className} composer-section-background`,
  
  outcomeDocContentType() {
    return configChannel.request('get', 'OUTCOME_DOC_CONTENT_TYPE_BACKGROUND');
  },
  title: 'Section 6: Background and Evidence',
  hasRefresh: false,


  _hasTenancyAgreement() {
    this.tenancyAgreementFileDescriptionModel = filesChannel.request('get:filedescription:code', configChannel.request('get', 'STANDALONE_TENANCY_AGREEMENT_CODE'));
    if (this.tenancyAgreementFileDescriptionModel) {
      return !!filesChannel.request('get:filedescription:files', this.tenancyAgreementFileDescriptionModel).length;
    }
  },

  _toSignedByDisplay(signed_by) {
    const signedByDisplay = {
      1: 'signed by all parties',
      2: 'signed by the landlords only',
      3: 'signed by the tenants only',
      4: 'not signed by any party'
    };
    return _.has(signedByDisplay, signed_by) ? signedByDisplay[signed_by] : signedByDisplay[4];
  },

  _toPaymentIntervalDisplay(payment_interval) {
    const paymentIntervalDisplay = {
      1: 'first day of each month',
      2: 'last day of each month',
      3: 'middle day of each month'
    };
    return _.has(paymentIntervalDisplay, payment_interval) ? paymentIntervalDisplay[payment_interval] : payment_interval;
  },
  
  generateFn() {
    // TODO: Add generated content into edit...
    const dispute = disputeChannel.request('get'),
      hasTenancyAgreement = this._hasTenancyAgreement(),
      dfd = $.Deferred(),
      self = this;

    return template({
      Formatter,
      dispute,
      hasTenancyAgreement,
      signedByDisplay: this._toSignedByDisplay(dispute.get('tenancy_agreement_signed_by')),
      rentPaymentIntervalDisplay: this._toPaymentIntervalDisplay(dispute.get('rent_payment_interval')),
      isMonthlyRentInterval: _.contains(['1', '2', '3'], String(dispute.get('rent_payment_interval')))
    });
  },

  links: [{
    text: 'Edit Evidence',
    actionFn() {
      Backbone.history.navigate(routeParse('overview_item', disputeChannel.request('get:id')), { trigger: true });
    }
  },
  {
    text: 'Edit Tenancy',
    actionFn() {
      Backbone.history.navigate(routeParse('overview_item', disputeChannel.request('get:id')), { trigger: true });
    }
  }]
});