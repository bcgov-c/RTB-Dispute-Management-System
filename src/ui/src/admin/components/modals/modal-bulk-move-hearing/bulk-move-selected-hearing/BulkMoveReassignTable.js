import React from 'react';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ScheduleIcon from '../../../../static/Icon_AdminBar_Hearing.png';
import { ViewJSXMixin } from '../../../../../core/utilities/JsxViewMixin';
import './BulkMoveReassignTable.scss';
import { toUserLevelAndNameDisplay } from '../../../user-level/UserLevel';

const userChannel = Radio.channel('users');
const Formatter = Radio.channel('formatter').request('get');

const BulkMoveReassignItemView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="">No matching hearings are available for reassignment</div>`)
});

const BulkMoveItem = Marionette.View.extend({
  initialize(options) {
    this.mergeOptions(options, ['allAvailableHearings']);
    this.template = this.template.bind(this);
  },

  clickReassign() {
    this.collection.trigger('reassign:hearing', this.model);
  },

  template() {
    const scheduledHearingsCount = this.allAvailableHearings.filter((hearing) => hearing.get('hearing_owner') === this.model.get('hearing_owner') && hearing.isAssigned()).length
    const userModel = userChannel.request('get:user', this.model.get('hearing_owner'));
    const primaryDisputeHearing = this.model.getPrimaryDisputeHearing();
    const primaryFileNumberDisplay = primaryDisputeHearing ? primaryDisputeHearing.getFileNumber() : '-';
    const ownerDisplay = toUserLevelAndNameDisplay(userModel, { displaySchedulerType: true, displayUserLevelIcon: true });
    const hearingPriority = Formatter.toUrgencyDisplay(this.model.get('hearing_priority'));
    const moderatorCode = this.model.getModeratorCodeDisplay();

    return (
      <div className={`reassign-table__list__item`}>
        <div className="reassign-table__scheduled-count">{scheduledHearingsCount}</div>
        <div className="reassign-table__file-number">{primaryFileNumberDisplay}</div>
        <div className="reassign-table__owner" dangerouslySetInnerHTML={{__html: ownerDisplay }}></div>
        <div className={`reassign-table__priority--${hearingPriority.toLowerCase()}`}>{hearingPriority}</div>
        <div className="reassign-table__moderator-code">{moderatorCode}</div>
        <div className="reassign-table__reassign-button" onClick={() => this.clickReassign()}>
          <img className="reassign-table__reassign-button__img" src={ScheduleIcon} />
          <span className="reassign-table__reassign-button__text">Reassign to this owner and delete</span>
        </div>
      </div>
    )
  }
});

_.extend(BulkMoveItem.prototype, ViewJSXMixin);

const BulkMoveReassignListView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: BulkMoveItem,
  emptyView: BulkMoveReassignItemView,

  childViewOptions(model, index) {
    return {
      collection: this.options.collection,
      allAvailableHearings: this.options.allAvailableHearings,
      index
    }
  }
});

const BulkMoveReassignTable = Marionette.View.extend({
  regions: {
    reassignList: '.reassign-table__list'
  },

  initialize(options) {
    this.mergeOptions(options, ['initHearingRowId', 'allAvailableHearings']);
    this.template = this.template.bind(this);
    this.activeRowId = this.initHearingRowId || null;
  },

  setActiveRowId(hearingId) {
    this.activeRowId = hearingId;
  },

  onRender() {
    this.showChildView('reassignList', new BulkMoveReassignListView({ collection: this.collection, allAvailableHearings: this.allAvailableHearings }))
  },

  template() {
    return (
      <>
        <div className="reassign-table__list__header">
          <div className="reassign-table__scheduled-count">Scheduled</div>
          <div className="reassign-table__file-number">Primary File Number</div>
          <div className="reassign-table__owner">Staff Owner</div>
          <div className="reassign-table__priority">Priority</div>
          <div className="reassign-table__moderator-code">Moderator Code</div>
          <div className="reassign-table__reassign-button"></div>
        </div>
        <div className="reassign-table__list"></div>
      </>
    )
  }
});

_.extend(BulkMoveReassignTable.prototype, ViewJSXMixin);
export default BulkMoveReassignTable