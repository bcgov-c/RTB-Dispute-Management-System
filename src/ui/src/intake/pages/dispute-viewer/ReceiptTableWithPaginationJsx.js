import React from 'react';
import Radio from 'backbone.radio';
import { ReceiptModal } from '../../../core/components/email/ReceiptModal';
import Icon_Menu_Hide_OVR from '../../static/Icon_Menu_Hide_OVR.png';
import Icon_Menu_Hide from '../../static/Icon_Menu_Hide.png';
import Icon_Menu_Show_OVR from '../../static/Icon_Menu_Show_OVR.png';
import Icon_Menu_Show from '../../static/Icon_Menu_Show.png';

const Formatter = Radio.channel('formatter').request('get');
const participantsChannel = Radio.channel('participants');
const configChannel = Radio.channel('config');
const modalChannel = Radio.channel('modals');

const ReceiptTableWithPagination = (emailReceipts, index, count, previousPageFn, nextPageFn) => {
  if (!emailReceipts?.length) return;

    const renderJsxPaginationRow = () => {
      const emailReceiptsLength = emailReceipts?.length;
  
      const loadedResultsCount = index + count > emailReceiptsLength ? emailReceiptsLength : index + count;
      const paginationResultsText = `Viewing ${index + 1} - ${loadedResultsCount}/${emailReceiptsLength}`;
      return <div className="intake-dispute__pagination">
        <span className="intake-dispute__pagination__view-text">{paginationResultsText}</span>
        <div className="intake-dispute__pagination__controls hidden-print">
          <span className={`${index > 0 ? 'intake-dispute__pagination__selectable-text' : 'intake-dispute__pagination__disabled-text'}`} onClick={() => previousPageFn()}><img className="intake-dispute__pagination__icon" src={index > 0 ? Icon_Menu_Hide_OVR : Icon_Menu_Hide} />Prev</span>
          <span className={`${loadedResultsCount < emailReceiptsLength ? 'intake-dispute__pagination__selectable-text' : 'intake-dispute__pagination__disabled-text'}`} onClick={() => nextPageFn()}>Next<img className="intake-dispute__pagination__icon" src={loadedResultsCount < emailReceiptsLength ? Icon_Menu_Show_OVR : Icon_Menu_Show} /></span>
        </div>
      </div>;
    }

    const getRequestOriginType = (receipt) => {
      if (receipt.get('receipt_type') === configChannel.request('get', 'RECEIPT_TYPE_OFFICE_SUBMISSION')) return 'Office, front desk';
      else if (receipt.get('receipt_type') === configChannel.request('get', 'RECEIPT_TYPE_INTAKE_SUBMISSION') || receipt.get('receipt_type') === configChannel.request('get', 'RECEIPT_TYPE_DISPUTEACCESS_SUBMISSION')) return 'Online';
      
      return '';
    }

    const openReceiptModal = (receipt) => {
      const emailReceiptModal = new ReceiptModal({
        receiptTitle: receipt.get('receipt_title'),
        receiptBody: receipt.get('receipt_body'),
        receiptParticipantId: receipt.get('participant_id'),
        disableEmail: true
      });
  
      modalChannel.request('add', emailReceiptModal);
    }

    return (
      <>
        <div>
          <div className="intake-dispute__section-title"><b>Submission Receipts</b></div>
        </div>
        { renderJsxPaginationRow() }
        {
          emailReceipts.slice(index, index + count).map(receipt => {
            return (
              <>
                <div key={receipt?.id}>
                  <div className="intake-dispute__label">
                    <span className="review-label">Type:</span>
                    <span><span className="intake-dispute__receipt-title">{receipt.get('receipt_title')}</span> <span className="intake-dispute__view-details general-link hidden-print" onClick={() => openReceiptModal(receipt)}>View details</span></span>
                  </div>
      
                  <div className="intake-dispute__label--break-word">
                    <span className="review-label">Requested by:</span>
                    <span>{participantsChannel.request('get:participant:name', receipt.get('participant_id'))} - {Formatter.toDateDisplay(receipt.get('created_date'))} ({getRequestOriginType(receipt)})</span>
                  </div>
                </div>
                <div className="intake-dispute__seperator"></div>
              </>
            );
          })
        }
      </>
    )
}

export default ReceiptTableWithPagination;