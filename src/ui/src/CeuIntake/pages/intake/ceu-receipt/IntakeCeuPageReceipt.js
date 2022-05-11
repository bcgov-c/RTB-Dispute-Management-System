import React from 'react';
import ReactDOM from 'react-dom';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import Radio from 'backbone.radio';
import CeuPage from '../../../components/page/CeuPage';
import { ReceiptContainer } from '../../../../core/components/receipt-container/ReceiptContainer';
import CeuReceiptRendererMixin from '../../../../core/components/custom-data-objs/ceu/CeuReceiptRendererMixin';
import './IntakeCeuPageReceipt.scss';

const RECEIPT_TITLE = `CEU Complaint Submission`;

const modalChannel = Radio.channel('modals');
const applicationChannel = Radio.channel('application');

const IntakeCeuPageReceipt = CeuPage.extend({

  initialize() {
    CeuPage.prototype.initialize.call(this, arguments);
    this.template = this.template.bind(this);

    this.prepareReceiptVariablesForRender();
    applicationChannel.trigger('progress:step', 9);
  },

  getRoutingFragment() {
    return 'page/9';
  },
  
  className: `${CeuPage.prototype.className} intake-ceu-receipt`,

  regions: {
    receiptContainerRegion: '.intake-ceu-receipt__receipt-container',
  },

  onRender() {
    this.showChildView('receiptContainerRegion', new ReceiptContainer({
      emailSubject: `File number ${this.model.get('reference_id')}: ${RECEIPT_TITLE} Receipt`,
      containerTitle: RECEIPT_TITLE,
      displayHtml: this.receiptRenderPageHtml(),
      submissionMessage: `Be sure to print a copy of this page for your records as a proof of your submission. Once you leave this page, you will not be able to return.`,
      enableLogout: true,
      logoutWarningFn: () => new Promise(res => (
        modalChannel.request('show:standard', {
          title: 'Leaving Your Application',
          bodyHtml: `<p>If you log out, you will lose access to all submitted information. Do you want to continue and logout?</p>`,
          primaryButtonText: 'Yes, logout',
          onContinueFn(modalView) {
            modalView.close();
            res();
          }
        })
      )),
      disableEmail: true,
    }));
  },

  template() {
    return <div className="">
      <div className="intake-ceu-receipt__receipt-container"></div>
    </div>
  },
});

_.extend(IntakeCeuPageReceipt.prototype, CeuReceiptRendererMixin, ViewJSXMixin);
export default IntakeCeuPageReceipt;
