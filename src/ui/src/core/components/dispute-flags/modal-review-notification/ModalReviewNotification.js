import React from 'react';
import Radio from 'backbone.radio';
import ModalBaseView from '../../modals/ModalBase';
import { ViewJSXMixin } from '../../../utilities/JsxViewMixin';
import './ModalReviewNotification.scss';

const Formatter = Radio.channel('formatter').request('get');
const configChannel = Radio.channel('config');

const ModalReviewNotification = ModalBaseView.extend({
  id: 'reviewNotification_modal',
  
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['reviewFlag', 'participant', 'dispute', 'hearingLinkType']);
    this.fileNumber = this.dispute ? this.dispute.get('file_number') : null;
  },

  template() {
    const DISPUTE_ACCESS_URL = configChannel.request('get', 'DISPUTE_ACCESS_URL');
    return (
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">Application for Review Consideration</h4>
          </div>
          <div className="modal-body">
            <span>{this.getJsxNotificationText()}</span>
            <p>Learn more about applications for review consideration on the <a className="static-external-link" href="#" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/solving-problems/dispute-resolution/after-the-hearing/review-clarify-or-correct-a-decision">Residential Tenancy Branch website</a>.
            </p>
            <p>Want to receive documents faster? Update your contact information and add your email address by visiting the <a className="static-external-link" href="#" url={DISPUTE_ACCESS_URL}>Dispute Access Site</a>.
            </p>
            <div className="row pull-right">
              <button className="btn btn-lg btn-primary btn-standard" onClick={() => this.close()}>Acknowledge</button>
            </div>
          </div>
        </div>
      </div>
    )
  },

  getJsxNotificationText() {
    const participantDisplay = () => {
      if (!this.participant) return;
      const participantInitialsDisplay = this.participant.getDisplayName();
      const isTenant = this.participant.isApplicant() ? this.dispute.isTenant() : !this.dispute.isTenant();

      return <span>by {participantInitialsDisplay} - {isTenant ? 'Tenant' : 'Landlord'}</span>
    }

    if (this.hearingLinkType === configChannel.request('get', 'DISPUTE_HEARING_LINK_TYPE_SINGLE') || !this.hearingLinkType) {
      return (
        <>
          <p>Dispute Resolution File Number <b>{this.fileNumber}</b> has an open application for review consideration that was filed {participantDisplay()} on {Formatter.toDateDisplay(this.reviewFlag.get('created_date'))}.</p>
          <p>Orders made as a result of this dispute may not be enforced until the Residential Tenancy Branch has made a decision about the application for review consideration.</p>
        </>
      )
    } else if (this.fileNumber !== this.reviewFlag.get('file_number')) {
      return (
        <>
          <p>Dispute Resolution File Number <b>{this.reviewFlag.get('file_number')}</b> has an open application for review consideration that was filed on {Formatter.toDateDisplay(this.reviewFlag.get('created_date'))}. You are seeing this message because this file number {this.fileNumber} shared the same dispute resolution hearing.</p>
          <p>Orders made as a result of any file that shares the same dispute resolution hearing may not be enforced until the Residential Tenancy Branch has made a decision about the application for review consideration.</p>
        </>
      )
    } else {
      return (
        <>
          <p>Dispute Resolution File Number <b>{this.fileNumber}</b> has an open application for review consideration that was filed {participantDisplay()} on {Formatter.toDateDisplay(this.reviewFlag.get('created_date'))}.</p>
          <p>Orders made as a result of any file that shares the same dispute resolution hearing may not be enforced until the Residential Tenancy Branch has made a decision about the application for review consideration.</p>
        </>
      )
    }
  }
});

_.extend(ModalReviewNotification.prototype, ViewJSXMixin);
export default ModalReviewNotification