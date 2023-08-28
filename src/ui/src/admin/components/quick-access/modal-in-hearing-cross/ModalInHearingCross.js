import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import iconCrossMoved from '../../../static/Icon_Admin_CrossMoved.png';
import iconCrossStatic from '../../../static/Icon_Admin_CrossStatic.png';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';
import { routeParse } from '../../../routers/mainview_router';
import './ModalHearingCross.scss';

const disputeChannel = Radio.channel('dispute');
const hearingChannel = Radio.channel('hearings');
const loaderChannel = Radio.channel('loader');

const ModalInHearingCross = ModalBaseView.extend({
  id: 'inHearingCross_modal',

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['crossDispute', 'crossDisputeHearing']);

    this.currentDispute = disputeChannel.request('get');
    this.currentDisputeHearing = hearingChannel.request('get:latest');
    this.displayErrorUI = !this.crossDisputeHearing || !this.crossDispute || !this.crossDispute.checkProcess(1) || Moment(this.crossDisputeHearing.get('hearing_start_datetime')).isBefore(Moment()) || !this.crossDisputeHearing.isSingleApp();
  },

  clickCrossFiles() {
    const disputeA = this.currentDispute?.id;
    const disputeB = this.crossDispute?.id;

    loaderChannel.trigger('page:load');
    hearingChannel.request('cross:past:hearings', disputeA, disputeB)
    .then(() => this.close())
    .catch((err) => {
      this.displayErrorUI = true;
      this.render();
    })
    .finally(() => {
      loaderChannel.trigger('page:load:complete');
      this.trigger('hearingCross:complete');
    });
  },

  clickViewDispute(disputeGuid) {
    this.trigger('hearingCross:complete');
    this.close();
    setTimeout(() => Backbone.history.navigate(routeParse('overview_item', disputeGuid), { trigger: true }), 5);
  },

  template() {
    return (
      <div className="modal-dialog modal-hearing-cross">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">In-Hearing Cross</h4>
            <div className="modal-close-icon-lg close-x"></div>
          </div>
          <div className="modal-body">
            <div className="modal-hearing-cross__wrapper">
              <div className="modal-hearing-cross__item">
                <div className="modal-hearing-cross__item__header">
                  <img className="modal-hearing-cross__img" src={iconCrossStatic} />
                  <div >
                    <p className="modal-hearing-cross__item__title"><b>This Dispute File</b></p>
                    <span>This dispute file will retain its current hearing but will have the dispute on the right added</span>
                  </div>
                </div>
                { this.renderJsxHearingCrossInfo(this.currentDispute, this.currentDisputeHearing) }
              </div>
              <div className="modal-hearing-cross__item__border"></div>
              <div className="modal-hearing-cross__item--right">
                <div className="modal-hearing-cross__item__header">
                  <img className="modal-hearing-cross__img" src={iconCrossMoved} />
                  <div >
                    <p className="modal-hearing-cross__item__title"><b>Dispute File Being Crossed</b></p>
                    <span>This dispute file will have its hearing cancelled and be moved to the hearing on the left</span>
                  </div>
                </div>
                { this.renderJsxHearingCrossInfo(this.crossDispute, this.crossDisputeHearing, true) }
              </div>
            </div>
            { this.displayErrorUI ? 
              <p className="modal-hearing-cross__confirmation-text--error">The destination dispute does not meet the criteria to be linked. It must have the correct process and a future single-linked hearing in order for this action to cancel the future hearing and book the target dispute onto the current dispute file.</p>
              :
              <p className="modal-hearing-cross__confirmation-text">Are you sure you want to link both disputes above to the hearing on this dispute file? These actions will happen automatically and cannot be undone.</p>
            }
            <div className="modal-button-container hearing-generation__import-wrapper">
              <button type="button" className="btn btn-lg btn-default btn-cancel btn-cancel-bulk-add-blocks" onClick={() => this.close()}>Cancel</button>
              { !this.displayErrorUI ? <button type="button" className="btn btn-lg btn-default btn-primary btn-continue" onClick={() => this.clickCrossFiles(this.crossedDispute)}>Yes, Cross These Files</button> : null }
            </div>
          </div>
        </div>
    </div>
    )
  },

  renderJsxHearingCrossInfo(dispute, hearing=null, showDisputeLink=false) {
    const hearingTimeDisplay = hearing ? `${Moment(hearing?.get('local_start_datetime')).format('ddd, MMM D YYYY, h:mmA')}-${Moment(hearing?.get('local_end_datetime')).format('h:mmA')}` : '-';
    return (
      <div className="modal-hearing-cross__item__info-wrapper">
        <div className="modal-hearing-cross__item__info">
          <span className="review-label">File Number:&nbsp;</span>
          <span>{dispute?.get('file_number') || '-'}</span>
          { showDisputeLink ? <>&nbsp;-&nbsp;<span className="general-link" onClick={() => this.clickViewDispute(dispute.id)}>view dispute</span></> : null }
        </div>
        <div className="modal-hearing-cross__item__info">
          <span className="review-label">Rental Address:&nbsp;</span>
          <span>{dispute?.getCompleteAddress() || '-'}</span>
        </div>
        <div className="modal-hearing-cross__item__info">
          <span className="review-label">Applicant Type:&nbsp;</span>
          <span>{dispute?.isLandlord() ? 'Landlord' : 'Tenant'}</span>
        </div>
        <div className="modal-hearing-cross__item__info">
          <div>
            <span className="review-label">Hearing:&nbsp;</span>
            <span>{hearingTimeDisplay || '-'}</span>
          </div>
          <div>
            <span className="review-label">Linking Type:&nbsp;</span>
            <span>{hearing?.getDisputeHearingLinkShortDisplay() || '-'}</span>
          </div>
          <div>
            <span className="review-label">Teleconference Access Code:&nbsp;</span>
            <span>{hearing?.getConferenceBridge()?.get('participant_code') || '-'}</span>
          </div>
        </div>
      </div>
    )
  }
});

_.extend(ModalInHearingCross.prototype, ViewJSXMixin);
export default ModalInHearingCross;