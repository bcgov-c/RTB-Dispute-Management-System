import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import Icon_Menu_Hide_OVR from '../../static/Icon_Menu_Hide_OVR.png';
import Icon_Menu_Hide from '../../static/Icon_Menu_Hide.png';
import Icon_Menu_Show_OVR from '../../static/Icon_Menu_Show_OVR.png';
import Icon_Menu_Show from '../../static/Icon_Menu_Show.png';
import PrintIcon from '../../../core/static/Icon_Print.png';
import RefreshIcon from '../../static/Icon_AdminBar_Refresh_Grey.png';
import ModalViewEmail from '../../../core/components/email/modal-view-email/ModalViewEmail';
import DisputePrintHeaderJsx from '../../../core/components/print-header/DisputePrintHeaderJsx';

const Formatter = Radio.channel('formatter').request('get');
const emailsChannel = Radio.channel('emails');
const participantsChannel = Radio.channel('participants');
const modalChannel = Radio.channel('modals');
const disputeChannel = Radio.channel('dispute');
const configChannel = Radio.channel('config');

const RECEIPT_LOAD_COUNT = configChannel.request('get', 'IVD_RECEIPT_LOAD_COUNT') || 20;

const IntakeDisputeEmailsView = Marionette.View.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['refreshDataAndRenderView']);
    this.emails = emailsChannel.request('get:all')?.filter(email => email.get('message_type') !== configChannel.request('get', 'EMAIL_MESSAGE_TYPE_RECEIPT'))
    .sort((a, b) => Moment(a.get('created_date')).isAfter(Moment(b.get('created_date'))))
    this.index = 0;
    this.count = 20;
  },

  print() {
    window.print();
  },

  refresh() {
    this.refreshDataAndRenderView();
  },

  openEmailModal(emailModel) {
    const modalViewEmail = new ModalViewEmail({ emailModel: emailModel });
    modalChannel.request('add', modalViewEmail);
  },

  template() {
    return (
      <div className="intake-dispute">
        <div className="intake-dispute__page-title hidden-print">
          <span>Emails</span>
          <div className="intake-dispute__header-actions">
            <span onClick={() => this.refresh()} className="intake-dispute__page-title__refresh"><img src={RefreshIcon}/></span>
            <span onClick={() => this.print()} className="intake-dispute__page-title__print hidden-xs"><img src={PrintIcon}/></span>
          </div>
        </div>

        {DisputePrintHeaderJsx(`File Number: ${disputeChannel.request('get')?.get('file_number')} Emails`)}

        <p className="intake-dispute__description">
          This is a record of emails that were sent from the Residential Tenancy Branch regarding your dispute file. Emails from hsrto@gov.bc.ca are not displayed here.
        </p>

        { this.renderJsxPaginationRow() }
        { this.renderJsxEmails() }

      </div>
    );
  },

  renderJsxEmails() {
    return this.emails.slice(this.index, this.index + this.count).map(email => {
      return (
        <>
          <div key={email.id}>
            <div className="intake-dispute__label">
              <span className="review-label">Subject:</span>
              <span><span className="intake-dispute__subject">
                {email.get('subject')}
                { email.getAttachments()?.length ? 
                  <span className="intake-dispute__attachments-display">
                    <img src={`${configChannel.request('get', 'COMMON_IMAGE_ROOT')}Icon_File_email.png`} className="intake-dispute__attachments-icon er-file-icon"></img>
                    <span>{email.getAttachments()?.length} attachment{email.getAttachments()?.length === 1 ? '' : 's'}</span>
                  </span> 
                : null }
              </span>
                <span className="intake-dispute__view-details general-link hidden-print" onClick={() => this.openEmailModal(email)}>View details</span>
              </span>
            </div>

            <div className="intake-dispute__label--break-word">
              <span className="review-label">Recipient:</span>
              <span>{participantsChannel.request('get:participant:name', email.get('participant_id'))}, {email.get('email_to')} - {Formatter.toDateDisplay(email.get('created_date'))}</span>
            </div>

          </div>
          <div className="intake-dispute__seperator"></div>
        </>
      )
    })
  },

  renderJsxPaginationRow() {
    const emailsLength = this.emails?.length;

    const prevPage = () => {
      if (this.index <= 0) return;
      this.index -= RECEIPT_LOAD_COUNT;
      this.render();
    };
    const nextPage = () => {
      if ((this.index) + this.count >= emailsLength) return;
      this.index += RECEIPT_LOAD_COUNT;
      this.render();
    };

    const loadedResultsCount = this.index + this.count > emailsLength ? emailsLength : this.index + this.count;
    const paginationResultsText = `Viewing ${this.index + 1} - ${loadedResultsCount} of ${emailsLength}`;
    return <div className="intake-dispute__pagination">
      <span className="intake-dispute__pagination__view-text">{paginationResultsText}</span>
      <div className="intake-dispute__pagination__controls hidden-print">
        <span className={`${this.index > 0 ? 'intake-dispute__pagination__selectable-text' : 'intake-dispute__pagination__disabled-text'}`} onClick={() => prevPage()}><img className="intake-dispute__pagination__icon" src={this.index > 0 ? Icon_Menu_Hide_OVR : Icon_Menu_Hide} />Prev</span>
        <span className={`${loadedResultsCount < emailsLength ? 'intake-dispute__pagination__selectable-text' : 'intake-dispute__pagination__disabled-text'}`} onClick={() => nextPage()}>Next<img className="intake-dispute__pagination__icon" src={loadedResultsCount < emailsLength ? Icon_Menu_Show_OVR : Icon_Menu_Show}/></span>
      </div>
    </div>;
  }

});

_.extend(IntakeDisputeEmailsView.prototype, ViewJSXMixin);
export default IntakeDisputeEmailsView;