import React from 'react';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import { CommunicationsReceiptModal } from './CommunicationReceiptModal';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import './CommunicationReceipts.scss'

const Formatter = Radio.channel('formatter').request('get');
const modalChannel = Radio.channel('modals');
const participantChannel = Radio.channel('participants');

const EmptyReceiptItemView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="">No receipts available.</div>`)
});


const CommunicationReceiptItem = Marionette.View.extend({
  initialize() {
    this.template = this.template.bind(this);
  },

  openReceiptModal() {
    const emailReceiptModal = new CommunicationsReceiptModal({
      receiptTitle: this.model.get('receipt_title'),
      receiptBody: this.model.get('receipt_body'),
      receiptParticipantId: this.model.get('participant_id')
    });

    modalChannel.request('add', emailReceiptModal);
  },

  getParticipantText() {
    if (!this.model.get('participant_id')) return '-';

    const participant = participantChannel.request('get:participant', this.model.get('participant_id'));
    return `${participant.isLandlord() ? 'Landlord' : 'Tenant'}: ${participant.getDisplayName()}`
  },

  template() {
    const createdDate = this.model.get('created_date') ? Formatter.toDateAndTimeDisplay(this.model.get('created_date')) : '-';
    const participant = this.getParticipantText();
    const site = this.model.getSiteTypeDisplay();
    const title = this.model.get('receipt_title');

    return (
      <div className="standard-list-item">
          <div className="communication-receipt__created-column">{createdDate}</div>
          <div className="communication-receipt__participant-column">{participant}</div>
          <div className="communication-receipt__site-column">{site}</div>
          <div className="communication-receipt__title-column">Receipt: {title}</div>
          <div className="communication-receipt__view-column hidden-print">
          <a className="communication-receipt__view-column__link" onClick={() => this.openReceiptModal()}>View</a>
        </div>
      </div>
    )
  }
});

_.extend(CommunicationReceiptItem.prototype, ViewJSXMixin);

const ReceiptsListView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: CommunicationReceiptItem,
  emptyView: EmptyReceiptItemView,

  childViewOptions(model, index) {
    return {
      collection: this.collection,
      index
    }
  }

})

const CommunicationReceipts = Marionette.View.extend({
  className: 'communication-receipt',
  regions: {
    receiptsList: '.standard-list-items'
  },

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options);
  },

  onRender() {
    this.showChildView('receiptsList', new ReceiptsListView(this.options))
  },

  template() {
    return (
      <>
        <div className="page-section-title-container communication-receipt__section-header">
          <div className="page-section-title">Submission Receipts</div>
        </div>
        <div className="standard-list">
          <div className="standard-list-header communication-receipt__table-header">
            <div className="communication-receipt__created-column">Created Date</div>
            <div className="communication-receipt__participant-column">Dispute Participant</div>
            <div className="communication-receipt__site-column">Site</div>
            <div className="communication-receipt__title-column">Title</div>
            <div className="communication-receipt__view-column hidden-print"></div>
          </div>
          <div className="standard-list-items"></div>
        </div>
      </>
    )
  }
});

_.extend(CommunicationReceipts.prototype, ViewJSXMixin);
export default CommunicationReceipts;