import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import { routeParse } from '../../../routers/mainview_router';
import { ModalEditPeriod } from '../ModalEditPeriod';
import './SchedulePeriodsTable.scss'

const userChannel = Radio.channel('users');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');

const STATUS_HELP_TEXT = `A period that is not in "Active (in use)" status cannot have hearings modified
by staff in the active hearing schedule. Locking or setting any period status away from "Active (in use)" should
only be done for periods that are not being used or only outside of regular business hours where hearings are not being
modified.`

const EmptyPeriodsItemView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="">No schedule available.</div>`)
});

const SchedulePeriodsItem = Marionette.View.extend({
  initialize() {
    this.template = this.template.bind(this);
  },

  routeToWorkingSchedule() {
    Backbone.history.navigate(routeParse('schedule_manager_working_param_item', null, this.model.id), { trigger: true });
  },

  openEditModal() {
    const editPeriodModal = new ModalEditPeriod({ model: this.model });
    this.listenTo(editPeriodModal, 'removed:modal', () => {
      this.render();
      loaderChannel.trigger('page:load:complete');
    });
    modalChannel.request('add', editPeriodModal);
  },

  template() {
    const periodStart = this.model.get('period_start') ? Formatter.toWeekdayShortDateYearDisplay(this.model.get('period_start')) : '-';
    // Add a correction 6 hours to force the end day selection to be correct
    const periodEnd = this.model.get('period_end') ? Formatter.toWeekdayShortDateYearDisplay(Moment(this.model.get('period_end')).subtract(6, 'hours')) : '-';
    const createdBy = this.model.get('created_by') && this.model.get('created_date') ? `${userChannel.request('get:user:name', this.model.get('created_by'))} - ${Formatter.toDateDisplay(this.model.get('created_date'))}` : '-';
    const modifiedBy = this.model.get('modified_by') && this.model.get('modified_date') ? `${userChannel.request('get:user:name', this.model.get('modified_by'))} - ${Formatter.toDateDisplay(this.model.get('modified_date'))}` : '-';
    const blocksCount = this.model.get('associated_schedule_blocks') ? this.model.get('associated_schedule_blocks') : '-';
    const hearingsCount = this.model.get('associated_hearings') ? this.model.get('associated_hearings') : '-';
    const SHOW_SCHEDULE_PERIOD_EDITS = (configChannel.request('get', 'UAT_TOGGLING') || {})?.SHOW_SCHEDULE_PERIOD_EDITS;

    return (
      <div className="standard-list-item">
        <div className="schedule-manager-periods__start-column">{periodStart}</div>
        <div className="schedule-manager-periods__end-column">{periodEnd}</div>
        <div className="schedule-manager-periods__creator-column">{createdBy}</div>
        <div className="schedule-manager-periods__modifier-column">{modifiedBy}</div>
        <div className="schedule-manager-periods__blocks-column">{blocksCount}</div>
        <div className="schedule-manager-periods__hearings-column">{hearingsCount}</div>
        <div className="schedule-manager-periods__status-column" dangerouslySetInnerHTML={{__html: this.model.getStatusDisplayHtml() }}></div>
        <div className="schedule-manager-periods__edit-column hidden-print">
          {SHOW_SCHEDULE_PERIOD_EDITS ? <a className="schedule-manager-periods__edit-column__link" onClick={() => this.openEditModal()}>edit status</a> : null}
        </div>
        {this.renderJsxManagerLink()}
      </div>
    )
  },

  renderJsxManagerLink() {
    if (this.model.get('period_status') === configChannel.request('get', 'SCHED_PERIOD_STATUS_LOCKED_GENERATION') || this.model.get('period_status') === configChannel.request('get', 'SCHED_PERIOD_STATUS_LOCKED_PREP')) {
      return (
        <div className="schedule-manager-periods__open-column hidden-print">
          <a className="schedule-manager-periods__open-column__link" onClick={() => this.routeToWorkingSchedule()}>open in manager</a>
        </div>
      )
    } else return null;
  }
})

_.extend(SchedulePeriodsItem.prototype, ViewJSXMixin);

const ScheduleListView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: SchedulePeriodsItem,
  emptyView: EmptyPeriodsItemView,

  childViewOptions(model, index) {
    return {
      collection: this.collection,
      index
    }
  }
});

const SchedulePeriodsView = Marionette.View.extend({
  regions: {
    SchedulePeriodsList: '.standard-list-items'
  },
  ui: {
    help: '.help-icon'
  },

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options);
  },

  onRender() {
    this.getUI('help').popover();
    this.showChildView('SchedulePeriodsList', new ScheduleListView(this.options))
  },

  template() {
    const displayedPeriodsCount = this.collection.length;
    const totalPeriodsCount = this.collection.totalAvailable;

    return (
      <>
        { displayedPeriodsCount && totalPeriodsCount ? <div className="schedule-manager-periods__count-display">Displaying <b>{displayedPeriodsCount}/{totalPeriodsCount}</b> of the future 2-week periods</div> : null }
        <div className="standard-list-header schedule-manager-periods__table-header">
        <div className="schedule-manager-periods__start-column">Period Start</div>
        <div className="schedule-manager-periods__end-column">Period End</div>
        <div className="schedule-manager-periods__creator-column">Created By</div>
        <div className="schedule-manager-periods__modifier-column">Modified By</div>
        <div className="schedule-manager-periods__blocks-column">Blocks</div>
        <div className="schedule-manager-periods__hearings-column">Hearings</div>
        <div className="schedule-manager-periods__status-column">
          Current Status&nbsp;
          {/*<span className="badge help-icon" tabindex="-1" data-toggle="popover" data-container="body" data-trigger="focus" data-placement="bottom" data-content={STATUS_HELP_TEXT}>?</span>*/}
        </div>
        <div className="schedule-manager-periods__edit-column"></div>
        <div className="schedule-manager-periods__open-column"></div>
        </div>
        <div className="standard-list-items"></div>
      </>
    )
  }
});

_.extend(SchedulePeriodsView.prototype, ViewJSXMixin);
export default SchedulePeriodsView