/**
 * @fileoverview - Modal that displays email receipts via ReceiptContainer
 */
import React from 'react';
import Radio from 'backbone.radio';
import ModalBaseView from '../modals/ModalBase';
import { ReceiptContainer } from '../receipt-container/ReceiptContainer';
import { ViewJSXMixin } from '../../utilities/JsxViewMixin';

const disputeChannel = Radio.channel('dispute');

const ReceiptModal = ModalBaseView.extend({
  id: 'emailReceipt_modal',

  /**
   * 
   * @param {String} [receiptTitle]
   * @param {String} receiptBody - receipt html to display 
   * @param {Number} [receiptParticipantId] - Used for emailing to participant email on file.
   * @param {Boolean} [disableEmail] - Hides email button, disables autoEmail
   */

  initialize(options) {
    this.mergeOptions(options, ['receiptTitle', 'receiptBody', 'receiptParticipantId' ,'disableEmail'])
    this.template = this.template.bind(this);

    this.dispute = disputeChannel.request('get');
  },

  onRender() {
    const receiptView = new ReceiptContainer({
      emailSubject: `File number ${this.dispute.get('file_number')}: ${this.receiptTitle}`,
      containerTitle: this.receiptTitle,
      displayHtml: this.receiptBody,
      hideSubmissionText: true,
      disableEmail: this.disableEmail,
      emailUpdateParticipantId: this.receiptParticipantId,
      autoSendEmail: false
    })
    this.showChildView('emailReceiptRegion', receiptView);

    this.listenTo(receiptView, 'close:communications:modal', () => {
      this.close();
    })
  },

  regions: {
    emailReceiptRegion: '.communication-receipt-modal__receipt',
  },

  template() {
    return (
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">View Receipt</h4>
            <div className="modal-close-icon-lg close-x"></div>
          </div>
          <div className="modal-body">
            <div className="communication-receipt-modal__receipt"></div>
          <div className="button-row">
            <div className="float-right">
              <button type="button" className="btn btn-lg btn-default btn-cancel"><span>Close</span></button>
            </div>
          </div>
          </div>
        </div>
      </div>
    )
  }
});

_.extend(ReceiptModal.prototype, ViewJSXMixin);
export { ReceiptModal }