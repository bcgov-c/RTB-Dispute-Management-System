import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DropdownView from '../../../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../../../core/components/dropdown/Dropdown_model';
import InputView from '../../../../../core/components/input/Input';
import InputModel from '../../../../../core/components/input/Input_model';
import GarbageCanIcon from '../../../../../admin/static/Icon_AdminPage_Delete.png';
import React from 'react';
import { ViewJSXMixin } from '../../../../../core/utilities/JsxViewMixin';

const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');

const MIN_HEARING_TIME_MINUTES = 15;
const MAX_HEARING_TIME_MINUTES = 240;

const HEARING_DURATION_ERROR = 'Hearing duration must be greater than 15 minutes and less than 4 hours';
const NEGATIVE_DURATION_ERROR = 'The end date must be greater than the start date to use the hearing generator';

const HearingGenerationItemView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div className="">No hearings available.</div>`)
});

const HearingGenerationItem = Marionette.View.extend({
  initialize(options) {
    this.mergeOptions(options, ['index', 'isDisabled']);
    this.template = this.template.bind(this);

    this.HEARING_MIN_BOOKING_TIME = configChannel.request('get', 'HEARING_MIN_BOOKING_TIME');
    this.HEARING_MAX_BOOKING_TIME = configChannel.request('get', 'HEARING_MAX_BOOKING_TIME');

    this.createSubModels();
    this.createListeners();

    this.duration = null;
    this.setDuration();
  },

  createSubModels() {
    this.startTimeModel = new InputModel({
      labelText: 'Hearing Start',
      inputType: 'time',
      disabled: this.isDisabled || false,
      allowFutureDate: true,
      minTime: this.HEARING_MIN_BOOKING_TIME,
      maxTime: this.HEARING_MAX_BOOKING_TIME,
      required: true,
      value: this.model.get('start_time') || null,
      apiMapping: 'hearing_start_datetime'
    });

    this.endTimeModel = new InputModel({
      labelText: 'Hearing End',
      inputType: 'time',
      disabled: this.isDisabled || false,
      allowFutureDate: true,
      minTime: this.HEARING_MIN_BOOKING_TIME,
      maxTime: this.HEARING_MAX_BOOKING_TIME,
      required: true,
      value: this.model.get('end_time') || null,
      apiMapping: 'hearing_end_datetime'
    });

    this.hearingPriorityModel = new DropdownModel({
      labelText: 'Default Hearing Priority',
      disabled: this.isDisabled || false,
      optionData: this.getPriorityOptions(),
      defaultBlank: true,
      required: true,
      value: this.model.get('hearing_priority') ? String(this.model.get('hearing_priority')) : null,
      apiMapping: 'hearing_priority'
    });
  },

  createListeners() {
    this.listenTo(this.startTimeModel, 'change:value', (model, value) => {
      this.getUI('durationError').addClass('hidden');
      if (!this.endTimeModel.getData()) this.endTimeModel.set({ value: Moment(value, InputModel.getTimeFormat()).add(1, 'hour').format(InputModel.getTimeFormat()) });
      this.setDuration();
      this.endTimeModel.trigger('render');
      this.getUI('duration').text(this.duration);
      this.saveInternalDataToModel();
    });

    this.listenTo(this.endTimeModel, 'change:value', (model, value) => {
      this.getUI('durationError').addClass('hidden');
      this.setDuration();
      this.getUI('duration').text(this.duration);
      this.saveInternalDataToModel();
    });

    this.listenTo(this.hearingPriorityModel, 'change:value', () => {
      this.getUI('durationError').addClass('hidden');
      this.saveInternalDataToModel();
    });

    this.listenTo(this.collection, 'validate', () => {
      const isValid = this.validateAndShowErrors();
      if (isValid) this.saveInternalDataToModel();
    });
  },

  saveInternalDataToModel() {
    this.model.set({
      start_time: this.startTimeModel.getData({ iso: true }),
      end_time: this.endTimeModel.getData({ iso: true }),
      hearing_priority: Number(this.hearingPriorityModel.getData()),
    });
  },

  validateAndShowErrors() {
    let isValid = false;
    const validations = ['hearingStart', 'hearingEnd', 'hearingPriority'];
    
    validations.forEach(view => {
      const childView = this.getChildView(view);
      isValid = childView.validateAndShowErrors();
    });
    const startDate = Moment(this.startTimeModel.getData(), InputModel.getTimeFormat());
    const endDate = Moment(this.endTimeModel.getData(), InputModel.getTimeFormat());
    const difference = Moment(endDate).diff(Moment(startDate), 'minutes');
    if (endDate.isBefore(startDate)) {
      this.getUI('durationError').removeClass('hidden');
      this.getUI('durationError').text(NEGATIVE_DURATION_ERROR)
    } else if (difference < MIN_HEARING_TIME_MINUTES || difference > MAX_HEARING_TIME_MINUTES) {
      this.getUI('durationError').removeClass('hidden');
      this.getUI('durationError').text(HEARING_DURATION_ERROR)
    }

    return isValid;
  },

  getPriorityOptions() {
    return _.map(['DISPUTE_URGENCY_EMERGENCY', 'DISPUTE_URGENCY_REGULAR', 'DISPUTE_URGENCY_DEFERRED'],
    function(code) {
      const value = configChannel.request('get', code);
      return { value: String(value), text: Formatter.toUrgencyDisplay(value) };
    });
  },

  setDuration() {
    const startDate = Moment(this.startTimeModel.getData(), InputModel.getTimeFormat());
    const endDate = Moment(this.endTimeModel.getData(), InputModel.getTimeFormat());
    const difference = Formatter.toDurationFromSecs(Moment(endDate).diff(Moment(startDate), 'seconds'));
    this.duration = startDate.isValid() && endDate.isValid() && difference ? difference : '-';
  },

  deleteHearing() {
    this.collection.remove(this.model);
    this.collection.trigger('re:render');
  },

  onRender() {
    this.showChildView('hearingStart', new InputView({ model: this.startTimeModel }));
    this.showChildView('hearingEnd', new InputView({ model: this.endTimeModel }));
    this.showChildView('hearingPriority', new DropdownView({ model: this.hearingPriorityModel }));
  },

  regions: {
    hearingStart: '.hearing-generation__hearing-start',
    hearingEnd: '.hearing-generation__hearing-end',
    hearingPriority: '.hearing-generation__hearing-priority'
  },

  ui: {
    duration: '.hearing-generation__duration',
    durationError: '.hearing-generation__hearing-length-error'
  },

  template() {
    const index = this.index + 1;
    return (
      <>
        <div className="hearing-generation__hearings">
          <span className="hearing-generation__hearing-number">{index}</span>
          <span className="hearing-generation__hearing-start"></span>
          <div className="hearing-generation__to"><span>&nbsp;to&nbsp;</span></div>
            <span className="hearing-generation__hearing-end"></span>
          <div className="hearing-generation__hearing-end-wrapper">
            <label className="review-label">Duration:</label>&nbsp;
            <span className="hearing-generation__duration">{this.duration}</span>
          </div>
          <span className="hearing-generation__hearing-priority"></span>
          { !this.isDisabled && this.collection.length > 1 ? <img className="hearing-generation__delete" src={GarbageCanIcon} alt="" onClick={() => this.deleteHearing()}/> : null}
        </div>
        <p className="hearing-generation__hearing-length-error error-block hidden"></p>
      </>
    );
  }
});

_.extend(HearingGenerationItem.prototype, ViewJSXMixin);

const HearingGenerationHearings = Marionette.CollectionView.extend({
  template: _.noop,
  childView: HearingGenerationItem,
  emptyView: HearingGenerationItemView,

  childViewOptions(model, index) {
    return {
      collection: this.collection,
      index,
      isDisabled: this.getOption('isDisabled')
    }
  }
});

_.extend(HearingGenerationHearings.prototype, ViewJSXMixin);
export default HearingGenerationHearings