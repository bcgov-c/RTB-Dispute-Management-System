import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';

const DEFAULT_MAX_PARTY_LENGTH = 65;

const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const modalsChannel = Radio.channel('modals');
const Formatter = Radio.channel('formatter').request('get');

const PartyNames = Marionette.View.extend({
  
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['maxLength']);
    this.maxLength = this.maxLength || DEFAULT_MAX_PARTY_LENGTH;
    const dispute = disputeChannel.request('get');
    this.applicants = participantsChannel.request('get:applicants');
    this.respondents = participantsChannel.request('get:respondents');
    this.partiesText = Formatter.toPartiesDisplay(this.applicants, this.respondents, { uppercase: dispute && dispute.get('sessionSettings')?.hearingToolsEnabled });
  },

  className: 'dms-party-names',

  clickViewAll() {
    const participantDisplayFn = (parties) => (
      parties.filter(p => !p.isAssistant()).map(p => p.getDisplayName()).join(', ')
    );
    modalsChannel.request('show:standard', {
      modalCssClasses: 'modal-dms-party-names',
      title: `Dispute Parties list`,
      bodyHtml: `
      <p><span class="review-label">Parties:</span>&nbsp<b><span>${this.partiesText}</span></b></p>
      <hr/>
      <div class="modal-dms-party-names__party-container">
        <div>
          <div><span class="review-label">Applicants</span></div>
          <b><span>${participantDisplayFn(this.applicants)}</span></b>
        </div>
        <div>
          <div><span class="review-label">Respondents</span></div>
          <b><span>${participantDisplayFn(this.respondents)}</span></b>
        </div>
      </div>`,
      hideContinueButton: true,
    });
  },

  template() {
    const trimmedPartyDisplay = Formatter.toTrimmedString(this.partiesText, this.maxLength);
    return <>
      <b><span dangerouslySetInnerHTML={{__html: trimmedPartyDisplay}}></span></b>
      {this.partiesText.length >= this.maxLength && trimmedPartyDisplay.slice(-3) === '...' ?
        <span className="general-link" onClick={() => this.clickViewAll()}>View all</span>
      : null}
    </>;
  }
});

_.extend(PartyNames.prototype, ViewJSXMixin);
export default PartyNames;
