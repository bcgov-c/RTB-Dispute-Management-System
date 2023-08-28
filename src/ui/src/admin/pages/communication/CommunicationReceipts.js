import React from 'react';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import { ReceiptModal } from '../../../core/components/email/ReceiptModal';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import './CommunicationReceipts.scss'
import SessionCollapse from '../../components/session-settings/SessionCollapseHandler';

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
    const emailReceiptModal = new ReceiptModal({
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
  },

  viewComparator(m) { return (-1 * Number(Moment(m.get('created_date')).unix())) || 0 },

})

const CommunicationReceipts = Marionette.View.extend({
  className: 'communication-receipt',
  regions: {
    receiptsList: '.standard-list-items'
  },
  ui: {
    collapse: '.dispute-section-title-add.collapse-icon',
  },
  events: {
    'click @ui.collapse': 'clickCollapse',
  },

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options);
    this.collapseHandler = SessionCollapse.createHandler(this.model, 'Communications', 'Receipts');
    this.isCollapsed = this.collapseHandler?.get();
  },

  clickCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.collapseHandler.update(this.isCollapsed);
    this.render();
  },

  onRender() {
    if (this.isCollapsed) return;
    this.showChildView('receiptsList', new ReceiptsListView(this.options))
  },

  template() {
    const enableCollapse = !!this.collapseHandler;
    return (
      <>
        <div className="page-section-title-container communication-receipt__section-header">
          <div className="page-section-title">Submission Receipts</div>
          {enableCollapse ?
            <span className={`dispute-section-title-add collapse-icon ${this.isCollapsed ? 'collapsed' : ''}`}></span>
          : null}
        </div>

        {!this.isCollapsed ? <>
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
        </> : null}
      </>
    )
  }
});

_.extend(CommunicationReceipts.prototype, ViewJSXMixin);
export default CommunicationReceipts;