import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import { ViewJSXMixin } from '../../../../../core/utilities/JsxViewMixin';
import Radio_model from '../../../../../core/components/radio/Radio_model'
import RadioIcon from '../../../../../core/components/radio/RadioIcon';

const isWeekendFn = dayOfWeek => dayOfWeek === 0 || dayOfWeek === 6;
const isWritingDayFn = dayOfWeek => dayOfWeek == 3;

const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get')

const BulkAddBlocksDaySelect = Marionette.View.extend({

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['periodModel', 'dayRadioModels']);

    this.SCHED_BLOCK_TYPE_HEARING = configChannel.request('get', 'SCHED_BLOCK_TYPE_HEARING');
    this.SCHED_BLOCK_TYPE_WRITING = configChannel.request('get', 'SCHED_BLOCK_TYPE_WRITING');
    this.SCHED_BLOCK_TYPE_OTHER_WORKING = configChannel.request('get', 'SCHED_BLOCK_TYPE_OTHER_WORKING');
    this.__SCHED_BLOCK_TYPE_NOSELECT = -99;
    this.__SCHED_BLOCK_TYPE_DISABLED = -100;

    this.noSelectionError = false;
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    if (this.dayRadioModels && this.dayRadioModels.length) return;

    const getRadioGroupOptionsFor = (dayOfWeek) => (
      isWeekendFn(dayOfWeek) ? [
          { iconClass: 'bulkAddBlocks-modal__day-select__week-row__radio__icon--disabled', value: this.__SCHED_BLOCK_TYPE_DISABLED }
        ] : [
          { iconClass: 'bulkAddBlocks-modal__day-select__week-row__radio__icon--hear', value: this.SCHED_BLOCK_TYPE_HEARING },
          ...(isWritingDayFn(dayOfWeek) ? [{ iconClass: 'bulkAddBlocks-modal__day-select__week-row__radio__icon--writ', value: this.SCHED_BLOCK_TYPE_WRITING }] : []),
          { iconClass: 'bulkAddBlocks-modal__day-select__week-row__radio__icon--blk', value: this.SCHED_BLOCK_TYPE_OTHER_WORKING },
          { iconClass: 'bulkAddBlocks-modal__day-select__week-row__radio__icon--noselect', value: this.__SCHED_BLOCK_TYPE_NOSELECT },
        ]
    );
    const getDefaultValueFor = (dayOfWeek) => (
      isWeekendFn(dayOfWeek) ? this.__SCHED_BLOCK_TYPE_DISABLED : 
        isWritingDayFn(dayOfWeek) ? this.SCHED_BLOCK_TYPE_WRITING : this.SCHED_BLOCK_TYPE_HEARING
    );

    const periodStartMoment = Moment(this.periodModel.get('period_start'));
    const periodEndMoment = Moment(this.periodModel.get('period_end'));
    const momentCursor = Moment(periodStartMoment);

    while (momentCursor.isBefore(periodEndMoment)) {
      const dayOfWeek = momentCursor.day();
      const datetime = momentCursor.toISOString();
      
      const radioModel = new Radio_model({
        optionData: getRadioGroupOptionsFor(dayOfWeek),
        value: getDefaultValueFor(dayOfWeek),
        disabled: !!isWeekendFn(dayOfWeek),

        // Add extra attributes to locate the radio models after
        _dayOfWeek: dayOfWeek,
        _datetimeISO: datetime,
      });

      this.dayRadioModels.push(radioModel);
      momentCursor.add(1, 'day');
    }
  },

  setupListeners() {
    this.dayRadioModels.forEach(model => {
      this.listenTo(model, 'change:value', () => {
        this.noSelectionError = false;
        this.render();
      });
    });

    this.listenTo(this.model, 'change:disabled', (modal, value) => {
      this.dayRadioModels.forEach(model => {
        if (model.get('vallue') === this.__SCHED_BLOCK_TYPE_DISABLED) return;
        model.set('disabled', value, { silent: true });
        model.trigger('render');
      });
    });
  },

  validateAndShowErrors() {
    const hasSelected = this.dayRadioModels.some(radioModel => radioModel.getData() > 0);
    this.noSelectionError = !hasSelected;
    this.render();
    return hasSelected;
  },

  getPageApiDataAttrs() {
    return {
      dayRadioModels: this.dayRadioModels,
      parsedDayData: this.dayRadioModels.map(radioModel => {
        const blockType = radioModel.getData();
        return {
          date: radioModel.get('_datetimeISO'),
          dayOfWeek: radioModel.get('_dayOfWeek'),
          blockType: blockType,
          isNotIncluded: blockType === this.__SCHED_BLOCK_TYPE_NOSELECT,
          isNotSelectable: blockType === this.__SCHED_BLOCK_TYPE_DISABLED
        };
      }),
    };
  },

  onRender() {
    const dayRadioModels = this.dayRadioModels;
    this.getUI('radioIcons').each(function() {
      const datetime = $(this).data('datetime');
      const radioModel = dayRadioModels.find(m => m.get('_datetimeISO') === datetime);
      const radioView = new RadioIcon({ isSingleViewMode: true, model: radioModel });
      $(this).html(radioView.render().$el);
    });

  },

  ui: {
    radioIcons: '.bulkAddBlocks-modal__day-select__week-row__radio__icon',
    error: '.error-block',
  },


  template() {
    const renderJsxError = () => (
      this.noSelectionError ? <div className="error-block">Select at least one day</div> : null
    );

    // NOTE: This assumes two-week periods
    const firstWeekStart = Moment(this.periodModel.get('period_start'));
    const secondWeekStart = Moment(firstWeekStart).add(1, 'week');
    
    
    return <>
      <div className="bulkAddBlocks-modal__day-select">
        {this.renderJsxHeader()}
        <div className="bulkAddBlocks-modal__day-select__content">
          {this.renderJsxWeekRow(firstWeekStart, this.dayRadioModels.slice(0, 7))}
          {this.renderJsxWeekRow(secondWeekStart, this.dayRadioModels.slice(7, 14))}
        </div>
      </div>
      {renderJsxError()}
    </>
  },

  renderJsxHeader() {
    return <div className="bulkAddBlocks-modal__day-select__header">
      <div className="bulkAddBlocks-modal__day-select__header--hear">
        <div className="bulkAddBlocks-modal__day-select__header__icon"></div>
        <div className="bulkAddBlocks-modal__day-select__header__title">Hearing Day</div>
      </div>
      <div className="bulkAddBlocks-modal__day-select__header--writ">
        <div className="bulkAddBlocks-modal__day-select__header__icon"></div>
        <div className="bulkAddBlocks-modal__day-select__header__title">Writing Day</div>
      </div>
      <div className="bulkAddBlocks-modal__day-select__header--blk">
        <div className="bulkAddBlocks-modal__day-select__header__icon"></div>
        <div className="bulkAddBlocks-modal__day-select__header__title">Other Working Time</div>
      </div>
      <div className="bulkAddBlocks-modal__day-select__header--noselect">
        <div className="bulkAddBlocks-modal__day-select__header__icon"></div>
        <div className="bulkAddBlocks-modal__day-select__header__title">Not Included</div>
      </div>
      <div className="bulkAddBlocks-modal__day-select__header--disabled">
        <div className="bulkAddBlocks-modal__day-select__header__icon"></div>
        <div className="bulkAddBlocks-modal__day-select__header__title">Not Selectable</div>
      </div>
    </div>;
  },

  renderJsxWeekRow(weekStartMoment, weekRadioModels) {
    return (
      <div className="bulkAddBlocks-modal__day-select__week-row">
        <div className="bulkAddBlocks-modal__day-select__week-row__text">Week Starting:<b>{Formatter.toPeriodDateDisplay(weekStartMoment)}</b></div>
        {weekRadioModels.map((radioModel, index) => (
          <div className="bulkAddBlocks-modal__day-select__week-row__radio" key={index}>
            <div className="bulkAddBlocks-modal__day-select__week-row__radio__icon" data-datetime={radioModel.get('_datetimeISO')}></div>
            <div className="">{Moment(radioModel.get('_datetimeISO')).format('ddd')}</div>
          </div>
        ))}
      </div>
    );
  },

});

_.extend(BulkAddBlocksDaySelect.prototype, ViewJSXMixin)

export { BulkAddBlocksDaySelect }

