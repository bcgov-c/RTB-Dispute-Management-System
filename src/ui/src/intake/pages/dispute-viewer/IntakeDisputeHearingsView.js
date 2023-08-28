import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import PrintIcon from '../../../core/static/Icon_Print.png';
import HearingIcon from '../../../core/static/Icon_Hearing_Date.png';
import RefreshIcon from '../../static/Icon_AdminBar_Refresh_Grey.png';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import DisputePrintHeaderJsx from '../../../core/components/print-header/DisputePrintHeaderJsx';

const hearingChannel = Radio.channel('hearings');
const Formatter = Radio.channel('formatter').request('get');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');

const IntakeDisputeHearingsView = Marionette.View.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['refreshDataAndRenderView']);

    this.hearings = hearingChannel.request('get');
  },

  print() {
    window.print();
  },

  refresh() {
    this.refreshDataAndRenderView();
  },

  generateICSFile(hearingModel) {
    const hearingCalendarTitle = `RTB Hearing for File Number ${disputeChannel.request('get')?.get('file_number')}`;
    const hearingCalendarDescription = hearingModel.isFaceToFace() && hearingModel.get('special_instructions') ? `You must attend this hearing for your Residential Tenancy Branch dispute. Type: Face to Face. ${hearingModel.get('special_instructions') ? `Instructions: ${hearingModel.get('special_instructions')}.` : ''} ${hearingModel.get('hearing_location') ? `Location: ${hearingModel.get('hearing_location')}.` : ''}` :
      `You must attend this hearing for your Residential Tenancy Branch dispute. ${hearingModel.get('conference_bridge_dial_in_description1')}: ${hearingModel.get('conference_bridge_dial_in_number1')} ${hearingModel.get('conference_bridge_dial_in_description2')}: ${hearingModel.get('conference_bridge_dial_in_number2')} Teleconference Access Code: ${hearingModel.get('conference_bridge_participant_code')} Dispute File Number: ${disputeChannel.request('get')?.get('file_number')}`;

    hearingChannel.request('generate:ics', hearingModel, hearingCalendarTitle, hearingCalendarDescription);
  },

  template() {
    return (
        <div className="intake-dispute">
          <div className="intake-dispute__page-title hidden-print">
            <span>Hearings</span>
            <div className="intake-dispute__header-actions">
              <span onClick={() => this.refresh()} className="intake-dispute__page-title__refresh"><img src={RefreshIcon}/></span>
              <span onClick={() => this.print()} className="intake-dispute__page-title__print hidden-xs"><img src={PrintIcon}/></span>
            </div>
          </div>

          {DisputePrintHeaderJsx(`File Number: ${disputeChannel.request('get')?.get('file_number')} Hearings`)}
          
          <p className="intake-dispute__description">This is a record of hearing(s) that are associated to this dispute file.</p>

          {this.hearings.map(hearing => {
            const hearingType = hearing.get('hearing_type') ? Formatter.toHearingTypeDisplay(hearing.get('hearing_type')) : '-';
            const dialInNumber1 = hearing.get('conference_bridge_dial_in_number1') || '-';
            const dialInNumber2 = hearing.get('conference_bridge_dial_in_number2') || '-';
            const accessCode = hearing.get('conference_bridge_participant_code') || '-';
            const isFutureHearing = !Moment().isAfter(hearing.get('hearing_end_datetime'), 'minutes');
            const hearingDisplay = isFutureHearing ? 'Upcoming Hearing' : 'Past hearing';
            const specialInstructions = hearing.get('special_instructions');
            const hearingLocation = hearing.get('hearing_location');

            return <div className="intake-dispute__item-wrapper">
              <div className="review-label intake-dispute__hearing-header">
                {hearingDisplay}
              </div>

              <div className="intake-dispute__hearing-time">
                <img className="intake-dispute__hearing-icon hidden-print" src={HearingIcon}/>
                <span className="intake-dispute__hearing-time__display"><b>{Formatter.toWeekdayShortDateYearDisplay(hearing.get('local_start_datetime'))} - {Formatter.toTimeDisplay(hearing.get('local_start_datetime'))}</b></span>
                { hearing.isActive() ? <div><span className="general-link hidden-print" onClick={() => this.generateICSFile(hearing)}>add to calendar</span></div> : null }
              </div>

              <div className="intake-dispute__label">
                <span className="review-label">Type:</span>
                <span>{hearingType}</span>
              </div>
              {isFutureHearing ?

              <>
                {hearing.isFaceToFace() && specialInstructions ?
                  <>
                    <div className="intake-dispute__label--break-word">
                      <span className="review-label">Instructions:</span>
                      <span>{specialInstructions || '-'}</span>
                    </div>
                    <div className="intake-dispute__label--break-word">
                      <span className="review-label">Location:</span>
                      <span>{hearingLocation || '-'}</span>
                    </div>
                  </>
                : null }
              
                {hearing.isFaceToFace() && specialInstructions ? null : 
                  <>
                    <div className="intake-dispute__label">
                      <span className="review-label">Dial in {hearing.get('conference_bridge_dial_in_description1')}:</span>
                      <span>{dialInNumber1}</span>
                    </div>

                    <div className="intake-dispute__label">
                      <span className="review-label">Dial in {hearing.get('conference_bridge_dial_in_description2')}:</span>
                      <span>{dialInNumber2}</span>
                    </div>

                    <div className="intake-dispute__label">
                      <span className="review-label">Teleconference access code:</span>
                      <span><b>{accessCode}</b></span>
                    </div>
                  </>
                }
            </>

              : <div className="intake-dispute__label"><i>Dial in information is not provided for past hearings</i></div> }
            </div>
          })}
        </div>
    );
  }

});

_.extend(IntakeDisputeHearingsView.prototype, ViewJSXMixin);
export default IntakeDisputeHearingsView;