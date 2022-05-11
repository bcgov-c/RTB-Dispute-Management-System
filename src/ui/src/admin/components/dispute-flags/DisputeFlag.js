import Radio from 'backbone.radio';
import React from 'react';
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import ModalManageSubServiceView from '../../pages/dispute-overview/modals/ModalManageSubService'
import { routeParse } from '../../routers/mainview_router';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';

const configChannel = Radio.channel('config');
const noticeChannel = Radio.channel('notice');
const loaderChannel = Radio.channel('loader');
const participantChannel = Radio.channel('participants');
const disputeChannel = Radio.channel('dispute');
const modalChannel = Radio.channel('modals');

const DisputeFlag = Marionette.View.extend({
  initialize() {
    this.template = this.template.bind(this);
    this.hideLinkedMenu = true;
    this.isLinkedFlag = this.model.isLinked();
  },

  clickFlag() {
    const flagType = this.model.get('flag_type');
    const flagConfig = configChannel.request('get', 'dispute_flags');
    const reviewFlagId = configChannel.request('get', 'FLAG_ID_REVIEW');
    const reviewFlagLateId = configChannel.request('get', 'FLAG_ID_REVIEW_LATE');
    const correctionFlagId = configChannel.request('get', 'FLAG_ID_CORRECTION');
    const clarificationFlagId = configChannel.request('get', 'FLAG_ID_CLARIFICATION');
    const subServiceFlagId = configChannel.request('get', 'FLAG_ID_SUB_SERVICE_REQUESTED');
    const adjournedFlagId = configChannel.request('get', 'FLAG_ID_ADJOURNED');
    const amendmentFlagId = configChannel.request('get', 'FLAG_ID_AMENDMENT');
    const prelimFlagId = configChannel.request('get', 'FLAG_ID_PRELIM_HEARING');
    const reviewHearingFlagId = configChannel.request('get', 'FLAG_ID_REVIEW_HEARING')

    if (flagType === flagConfig[correctionFlagId].flag_type ||
        flagType === flagConfig[clarificationFlagId].flag_type ||
        flagType === flagConfig[reviewFlagId].flag_type ||
        flagType === flagConfig[reviewFlagLateId].flag_type ||
        flagType === flagConfig[adjournedFlagId].flag_type
    ) {
      Backbone.history.navigate(routeParse('document_item', this.model.get('dispute_guid')), { trigger: true });
    } else if (flagType === flagConfig[subServiceFlagId].flag_type) {
      this.openSubServModal();
    } else if (flagType === flagConfig[amendmentFlagId].flag_type) {
      Backbone.history.navigate(routeParse('notice_item', this.model.get('dispute_guid')), { trigger: true });
    } else if (flagType === flagConfig[prelimFlagId].flag_type || flagType === flagConfig[reviewHearingFlagId].flag_type) {
      Backbone.history.navigate(routeParse('hearing_item', this.model.get('dispute_guid')), { trigger: true });
    }
  },

  openSubServModal() {
    const participantModel = participantChannel.request('get:participant', this.model.get('flag_participant_id'));
    if (!participantModel) {
      alert(`Unable to find participant model for service record id ${this.model.id}`);
      return;
    }

    const openSubServiceFn = () => {
      loaderChannel.trigger('page:load');
      // Always refresh the subservices on click to open sub services
      noticeChannel.request('load:subservices', disputeChannel.request('get:id'))
        .always(() => {
          loaderChannel.trigger('page:load:complete');
          const modalView = new ModalManageSubServiceView({ model: participantModel });
          this.listenTo(modalView, 'removed:modal', () => {
            loaderChannel.trigger('page:load');
            Backbone.history.loadUrl(Backbone.history.fragment);
          });
          modalChannel.request('add', modalView);
        });
    };

    const dispute = disputeChannel.request('get');
    if (!dispute || !_.isFunction(dispute.checkEditInProgressPromise)) {
      openSubServiceFn();
      return;
    }

    dispute.checkEditInProgressPromise(true).then(
      openSubServiceFn,
      () => {
        dispute.showEditInProgressModalPromise()
      }
    );
  },

  handleMouseHover() {
    this.hideLinkedMenu = !this.hideLinkedMenu;
    this.render();
  },

  template() {
      return <> { this.isLinkedFlag ? this.renderJsxLinkedFlag(this.model) : this.renderJsxFlag(this.model) } </>;
  },

  renderJsxLinkedFlag(flag) {
    return (
      <div className="dispute-flags-flag--linked">
        <div className="dispute-flags-flag--linked-menu" onClick={() => this.clickFlag()}>
          <div className="dispute-flags-flag--linked-menu-icon" onMouseEnter={() => this.handleMouseHover()} onMouseLeave={() => this.handleMouseHover()}>
            <div className="calendar-link-img"></div>
            <div className={`dispute-flags-flag-floating-menu ${this.hideLinkedMenu ? 'hidden' : ''}`}>
                <div className="dispute-flags-flag-floating-menu-item" onClick={() => this.clickFlag()}>{flag.get('file_number')}</div>
            </div>
          </div>
          <div className="dispute-flags-flag-text ">{flag.get('flag_title')}{flag.count > 1 ? ` (${flag.count})` : null}</div>
        </div>
      </div>
    )
  },

  renderJsxFlag(flag) {
    return (
      <div className="dispute-flags-flag">
        <div className="dispute-flags-flag-menu" onClick={() => this.clickFlag()}>
          <div className="dispute-flags-flag-text ">{flag.get('flag_title')}{ flag.count > 1 ? ` (${flag.count})` : null}</div>
        </div>
      </div>
    );
  }

});

_.extend(DisputeFlag.prototype, ViewJSXMixin);
export default DisputeFlag;