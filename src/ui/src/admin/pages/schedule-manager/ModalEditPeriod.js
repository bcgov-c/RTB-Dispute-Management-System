import Radio from 'backbone.radio';
import React from 'react';
import ModalBaseView from '../../../core/components/modals/ModalBase';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import './ModalEditPeriod.scss';

const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');

const ModalEditPeriod = ModalBaseView.extend({

  initialize() {
    this.template = this.template.bind(this);
    const periodStatusOptions = this.getPeriodStatusOptions();
    this.periodStatusModel = new DropdownModel({
      optionData: periodStatusOptions,
      labelText: 'Period Status',
      required: true,
      value: this.model.get('period_status') ? String(this.model.get('period_status')) : null,
      apiMapping: 'period_status',
      defaultBlank: true,
    });
  },

  onRender() {
    this.showChildView('dropdownRegion', new DropdownView({ model: this.periodStatusModel }));
  },

  getPeriodStatusOptions() {
    /*
    That status options that appear depend on the characteristics of the period and the following rules
    Active (in use):  Is only available when there are hearings in the period
    Inactive:  Can only be set when there are no blocks and no hearings in the period
    Locked for generation:  Can only be set when there are no blocks and no hearings in the period
    Locked for preparation: Can be set at any time with any period characteristics
    Locked for rebalancing: Can be set on any period where the local_period_start is >= 7 days from now
    */
    const hasHearings = this.model.get('associated_hearings');
    const hasBlocks = this.model.get('associated_schedule_blocks') && this.model.get('associated_schedule_blocks').length;
    const isEmpty = !hasHearings && !hasBlocks;
    const isOneWeekFromNow = Moment().add(7, 'days').isBefore(Moment(this.model.get('period_start')));
    const SCHEDULE_PERIODS_STATUS_DISPLAY = configChannel.request('get', 'SCHEDULE_PERIODS_STATUS_DISPLAY');
    const SCHED_PERIOD_STATUS_ACTIVE = configChannel.request('get', 'SCHED_PERIOD_STATUS_ACTIVE');
    const SCHED_PERIOD_STATUS_INACTIVE = configChannel.request('get', 'SCHED_PERIOD_STATUS_INACTIVE');
    const SCHED_PERIOD_STATUS_LOCKED_GENERATION = configChannel.request('get', 'SCHED_PERIOD_STATUS_LOCKED_GENERATION');
    const SCHED_PERIOD_STATUS_LOCKED_PREP = configChannel.request('get', 'SCHED_PERIOD_STATUS_LOCKED_PREP');
    const SCHED_PERIOD_STATUS_LOCKED_REBALANCE = configChannel.request('get', 'SCHED_PERIOD_STATUS_LOCKED_REBALANCE');

    return [
      ...(hasHearings ? [{ value: String(SCHED_PERIOD_STATUS_ACTIVE), text: SCHEDULE_PERIODS_STATUS_DISPLAY[SCHED_PERIOD_STATUS_ACTIVE] }] : []),
      ...(isEmpty ? [{ value: String(SCHED_PERIOD_STATUS_INACTIVE), text: SCHEDULE_PERIODS_STATUS_DISPLAY[SCHED_PERIOD_STATUS_INACTIVE] }] : []),
      ...(isEmpty ? [{ value: String(SCHED_PERIOD_STATUS_LOCKED_GENERATION), text: SCHEDULE_PERIODS_STATUS_DISPLAY[SCHED_PERIOD_STATUS_LOCKED_GENERATION] }] : []),
      ...[{ value: String(SCHED_PERIOD_STATUS_LOCKED_PREP), text: SCHEDULE_PERIODS_STATUS_DISPLAY[SCHED_PERIOD_STATUS_LOCKED_PREP] }],
      ...(isOneWeekFromNow ? [{ value: String(SCHED_PERIOD_STATUS_LOCKED_REBALANCE), text: SCHEDULE_PERIODS_STATUS_DISPLAY[SCHED_PERIOD_STATUS_LOCKED_REBALANCE] }] : []),
    ]
  },

  clickSave() {
    const statusView = this.getChildView('dropdownRegion');
    if (statusView && statusView.isRendered() && !statusView.validateAndShowErrors()) return;

    loaderChannel.trigger('page:load');
    this.model.set(this.periodStatusModel.getPageApiDataAttrs());
    this.model.save(this.model.getApiChangesOnly()).done(() => {
      this.close();
    }).fail(err => {
      loaderChannel.trigger('page:load:complete');
      generalErrorFactory.createHandler('SCHEDULE.PERIOD.SAVE', () => this.close())(err)
    });
  },

  id: 'editPeriod-modal',
  regions: {
    dropdownRegion: '.editPeriod-modal__dropdown'
  },

  template() {
    return (
      <div className="modal-dialog">
        <div className="modal-content clearfix">
          <div className="modal-header">
            <h4 className="modal-title">Change Period Status</h4>
            <div className="modal-close-icon-lg close-x"></div>
          </div>
          <div className="modal-body clearfix">

            <p>Select the status you want to set for the period. The options that are available depend on the current date and the time blocks and hearings in the period.</p>

            <p className="editPeriod-modal__warning error-red"><b>WARNING:</b>&nbsp;Setting any period to locked or inactive will block hearings in that period from being modified by staff and should only be used when hearings in target period are not in use.</p>

            <div className="">
              <label className="general-modal-label">Current Period Status:</label>&nbsp;<span className="editPeriod-modal__status" dangerouslySetInnerHTML={{__html: this.model.getStatusDisplayHtml() || '-'}}></span>
              <div className="editPeriod-modal__dropdown"></div>
            </div>
            <div className="modal-button-container">
              <button type="button" className="btn btn-lg btn-default btn-cancel cancel-button" onClick={() => this.close()}>Cancel</button>
              <button type="button" className="btn btn-lg btn-default btn-primary btn-continue" onClick={() => this.clickSave()}>Change Status</button>
            </div>
          </div>
        </div>
      </div>
    );
  },

});

_.extend(ModalEditPeriod.prototype, ViewJSXMixin)

export { ModalEditPeriod }

