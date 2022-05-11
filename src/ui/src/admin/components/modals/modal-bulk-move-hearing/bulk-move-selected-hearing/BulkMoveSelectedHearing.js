import React from 'react';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import HearingCollection from '../../../../../core/components/hearing/Hearing_collection';
import BulkMoveReassignTable from './BulkMoveReassignTable';
import hearingDisplayOwnerTemplate from '../../../../../core/components/hearing/hearing-display/HearingDisplayOwner_template.tpl';
import hearingDisplayLinkTemplate from '../../../../../core/components/hearing/hearing-display/HearingDisplayLink_template.tpl';
import DeleteIcon from '../../../../static/Icon_AdminPage_DeleteLRG.png';
import InfoIcon from '../../../../static/Icon_FeedbackReminder.png';
import { ViewJSXMixin } from '../../../../../core/utilities/JsxViewMixin';
import { generalErrorFactory } from '../../../../../core/components/api/ApiLayer';
import './BulkMoveSelectedHearing.scss';
import { toUserLevelAndNameDisplay } from '../../../user-level/UserLevel';

const Formatter = Radio.channel('formatter').request('get');
const userChannel = Radio.channel('users');
const hearingChannel = Radio.channel('hearings');
const loaderChannel = Radio.channel('loader');

const BulkMoveSelectedHearing = Marionette.View.extend({ 
  initialize() {
    this.template = this.template.bind(this);
    this.availableReassignHearings = null;
    this.allAvailableHearings = null;
    this.isAdjourned = null;
    this.hearingModel = this.model.getHearingModel();
    if (this.hearingModel.getPrimaryDisputeHearing()) this.loadPageData();
  },

  regions: {
    reassignTableRegion: '.selected-hearing__reassign-table'
  },

  ui: {
    ownerDisplay: ".hearing-owner-display",
    linkDisplay: '.hearing-link-display',
  },

  loadPageData() {
    loaderChannel.trigger('page:load');
    Promise.all([this.checkAdjourned(), this.loadDailyHearingData()]).finally(() => loaderChannel.trigger('page:load:complete'));
  },

  loadDailyHearingData() {
    const hearingDate = Moment(this.hearingModel.get('local_start_datetime')).format('YYYY-MM-DD');
    hearingChannel.request('get:by:day', hearingDate).done(hearings => {
      hearings = hearings.owner_hearings || [];;
      this.setHearingsList(hearings);
    }).fail(
      generalErrorFactory.createHandler('ADMIN.SCHEDULE.DAILY', () => {
        this.close();
      })
    );
  },

  checkAdjourned() {
    return hearingChannel.request('check:adjourned', this.hearingModel)
    .then(isAdjourned => {
      this.isAdjourned = isAdjourned;
    });
  },

  setHearingsList(hearingData) {
    const hearingModelId = this.hearingModel.get('hearing_id');
    const parsedHearingData = [];
    const timezoneFormat = 'YYYY-MM-DDTHH:mm:ss';

    _.each(hearingData, function(ownerHearingData) {
      _.each(ownerHearingData.hearings, function(hearingData) {
        hearingData.local_start_datetime = Moment(`${hearingData.local_start_datetime}`).format(timezoneFormat);
        hearingData.local_end_datetime = Moment(`${hearingData.local_end_datetime}`).format(timezoneFormat);
        hearingData.hearing_owner = ownerHearingData.user_id;
        if (hearingData.hearing_id !== hearingModelId) {
          parsedHearingData.push(hearingData);
        }
      });
    });
    this.allAvailableHearings = new HearingCollection(parsedHearingData);
    this.availableReassignHearings = new HearingCollection(_.where(parsedHearingData, {
      local_start_datetime: Moment(this.hearingModel.get('local_start_datetime')).format(timezoneFormat),
      local_end_datetime: Moment(this.hearingModel.get('local_end_datetime')).format(timezoneFormat)
    }));
    this.availableReassignHearings.reset(this.availableReassignHearings.filter(hearing => !hearing.isReserved() && !hearing.isAssigned()));
    this.listenTo(this.availableReassignHearings, 'reassign:hearing', (hearingModel) => {
      this.collection.trigger('reassign:hearing', hearingModel);
    })
    this.render();
  },

  deleteHearing() {
    this.collection.trigger('delete:hearing', this.model);
  },

  onRender() {
    const primaryDisputeHearing = this.hearingModel.getPrimaryDisputeHearing();
    const secondaryDisputeHearings = this.hearingModel.getSecondaryDisputeHearings();
    const primaryDisputeHearingDisplay = primaryDisputeHearing ? primaryDisputeHearing.getFileNumber() : '-';
    const secondaryDisputeHearingsDisplay = secondaryDisputeHearings ? secondaryDisputeHearings.map(function(dispute_hearing_model) {
      return dispute_hearing_model.getFileNumber();
    }).join(',&nbsp;') : '-';

    this.getUI('linkDisplay').html(hearingDisplayLinkTemplate({
      linkTypeDisplay: this.hearingModel.getDisputeHearingLinkDisplay(),
      primaryDisputeHearingDisplay,
      secondaryDisputeHearingsDisplay
    })); 

    this.getUI('ownerDisplay').html(hearingDisplayOwnerTemplate({
      ownerNameDisplay: toUserLevelAndNameDisplay(userChannel.request('get:user', this.hearingModel.get('hearing_owner')), { displaySchedulerType: true, displayUserLevelIcon: true }),
      dialCodeDisplay: this.hearingModel.getModeratorCodeDisplay(),
      webPortalLoginDisplay: this.hearingModel.getWebPortalLoginDisplay(),
      hearingPriorityDisplay: Formatter.toUrgencyDisplay(this.hearingModel.get('hearing_priority')),
      isReserved: this.hearingModel.isReserved(),
      isAdjourned: this.isAdjourned
    }));

    if (this.hearingModel.getPrimaryDisputeHearing()) this.showChildView('reassignTableRegion', new BulkMoveReassignTable({ collection: this.availableReassignHearings, allAvailableHearings: this.allAvailableHearings }));
  },

  template() {
    const localStartDateTime = this.hearingModel.get('local_start_datetime');
    const localEndDateTime = this.hearingModel.get('local_end_datetime');

    return (
    <div className="selected-hearing">
      <div className="selected-hearing__header">
        <span className="selected-hearing__header__text">Selected Hearing</span>
      </div>
      <div className="selected-hearing__info-container">
        <div className="hearing-date-display-container">
          <div className="hearing-start-date-icon"></div>
          <span className="hearing-start-date-display">
            { Formatter.toWeekdayShortDateYearDisplay(localStartDateTime) }
          </span>
          <div className="hearing-start-time-display-container">
            <div className="hearing-start-time-icon"></div>
            <span className="hearing-start-time-display">
              { Formatter.toTimeDisplay(localStartDateTime) }
            </span>
            <span className="hearing-duration-display">
              ({ Formatter.toDuration(localStartDateTime, localEndDateTime) })
            </span>
          </div>
          <div className="hearing-link-display"></div>
        </div>
        <div className="hearing-owner-display"></div>
      </div>
      { this.renderJsxHearingDisplay() }
    </div>
    )
  },

  renderJsxHearingDisplay() {
    if (this.hearingModel.getPrimaryDisputeHearing()) {
      return <div className="selected-hearing__reassign-table"></div>;
    } else if (this.hearingModel.isReserved()) {
      return (
        <div className="selected-hearing__delete__text--reserved">
          <img src={InfoIcon} />&nbsp;<span>This unassigned hearing is on hold and cannot be deleted</span>
        </div>
      );
    } else {
      return (
        <div className="selected-hearing__delete">
          <div className="selected-hearing__delete__wrapper" onClick={() => this.deleteHearing()}>
            <img src={DeleteIcon}/><span className="selected-hearing__delete__text">&nbsp;Delete this unassigned hearing</span>
          </div>
        </div>
      );
    }
  }
});

_.extend(BulkMoveSelectedHearing.prototype, ViewJSXMixin);
export default BulkMoveSelectedHearing