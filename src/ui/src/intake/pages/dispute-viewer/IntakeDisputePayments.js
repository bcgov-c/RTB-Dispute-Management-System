import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import PrintIcon from '../../../core/static/Icon_Print.png';
import RefreshIcon from '../../static/Icon_AdminBar_Refresh_Grey.png';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import DisputePrintHeaderJsx from '../../../core/components/print-header/DisputePrintHeaderJsx';

const configChannel = Radio.channel('config');
const paymentsChannel = Radio.channel('payments');
const Formatter = Radio.channel('formatter').request('get');
const participantsChannel = Radio.channel('participants');
const disputeChannel = Radio.channel('dispute');

const IntakeDisputePayments = Marionette.View.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['refreshDataAndRenderView']);
    this.fees = paymentsChannel.request('get:fees');
  },

  print() {
    window.print();
  },

  refresh() {
    this.refreshDataAndRenderView();
  },

  getPayorOptions() {
    const applicants = participantsChannel.request('get:applicants'),
      respondents = participantsChannel.request('get:respondents'),
      participants = _.union(applicants ? applicants.models : [], respondents ? respondents.models : []);
    
    return _.map(participants, (p) => { 
      return { value: String(p.id), text: p.getContactName() };
    });
  },

  template() {

    return (
      <div className="intake-dispute">
        <div className="intake-dispute__page-title hidden-print">
          <span>Payments</span>
          <div className="intake-dispute__header-actions">
            <span onClick={() => this.refresh()} className="intake-dispute__page-title__refresh"><img src={RefreshIcon}/></span>
            <span onClick={() => this.print()} className="intake-dispute__page-title__print hidden-xs"><img src={PrintIcon}/></span>
          </div>
        </div>

        {DisputePrintHeaderJsx(`File Number: ${disputeChannel.request('get')?.get('file_number')} Payments`)}

        <p className="intake-dispute__description">This is a record of all payments on this dispute file.</p>

        {this.fees.map((fee) => {
          const feeType = fee.get('fee_type') ? Formatter.toFeeTypeDisplay(fee.get('fee_type')) : '-';
          const paymentStatus = fee.get('is_paid') ? 'Paid (or waived)' : 'Not paid';
          const feeAmount = fee.get('amount_due') ? Formatter.toAmountDisplay(fee.get('amount_due')) : '-';
          const amountPaid = fee.get('amount_paid') ? `${Formatter.toAmountDisplay(fee.get('amount_paid'))} - ${Formatter.toDateDisplay(fee.get('date_paid'))}` : fee.get('amount_paid') === 0 ? `$0 - ${Formatter.toDateDisplay(fee.get('date_paid'))}` : '-';
          const payorName = fee.get('payor_id') ? (_.findWhere(this.getPayorOptions(), { value: String(fee.get('payor_id')) }))?.text : '-';

          const isApplicantFee = participantsChannel.request('get:participant', fee.get('payor_id'))?.isApplicant();
          if (!isApplicantFee) return; 

          return (
            <>
              <div>
                <div className="intake-dispute__label">
                  <span className="review-label">Fee type:</span>
                  <span><b>{feeType}</b></span>
                </div>
        
                <div className="intake-dispute__label">
                  <span className="review-label">Payment status:</span>
                  <span><b>{paymentStatus}</b></span>
                </div>
        
                <div className="intake-dispute__label">
                  <span className="review-label">Fee amount:</span>
                  <span>{feeAmount}</span>
                </div>
        
                <div className="intake-dispute__label">
                  <span className="review-label">Amount paid:</span>
                  <span>{amountPaid}</span>
                </div>
        
                <div className="intake-dispute__label--break-word">
                  <span className="review-label">Payor:</span>
                  <span>{payorName}</span>
                </div>
              </div>
              <div className="intake-dispute__seperator"></div>
            </>
          )
        }).reverse()}
      </div>
    );
  }
});

_.extend(IntakeDisputePayments.prototype, ViewJSXMixin);
export default IntakeDisputePayments;