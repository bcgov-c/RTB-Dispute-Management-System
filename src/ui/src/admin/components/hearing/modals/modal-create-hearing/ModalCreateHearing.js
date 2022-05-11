import Radio from 'backbone.radio';
import ModalBaseView from '../../../../../core/components/modals/ModalBase';
import DropdownView from '../../../../../core/components/dropdown/Dropdown';
import InputView from '../../../../../core/components/input/Input';
import InputModel from '../../../../../core/components/input/Input_model';
import RadioView from '../../../../../core/components/radio/Radio';
import TextareaView from '../../../../../core/components/textarea/Textarea';
import template from './ModalCreateHearing_template.tpl';
import conference_template from './Teleconference_template.tpl';
import { generalErrorFactory } from '../../../../../core/components/api/ApiLayer';

const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');
const configChannel = Radio.channel('config');

export default ModalBaseView.extend({
  template,

  id: 'createHearing_modal',

  regions: {
    hearingTypeRegion: '.create-hearing-type',
    hearingPriorityRegion: '.create-hearing-priority',
    hearingNoteRegion: '.create-hearing-note',
    hearingDateRegion: '.create-hearing-date',
    hearingStartTimeRegion: '.create-hearing-start-time',
    hearingEndTimeRegion: '.create-hearing-end-time',
    
    hearingArbsRegion: '.create-hearing-arbs',

    hearingBridgesRegion: '.create-hearing-bridges',
    hearingScheduleRegion: '.create-hearing-schedule-radio',

    hearingParticipantCodeRegion: '.create-hearing-participant-code',
    hearingModeratorCodeRegion: '.create-hearing-moderator-code',
    hearingPrimaryDialinRegion: '.create-hearing-primary-dialin',
    hearingPrimaryTitleRegion: '.create-hearing-primary-title',
    hearingSecondaryDialinRegion: '.create-hearing-secondary-dialin',
    hearingSecondaryTitleRegion: '.create-hearing-secondary-title',

    hearingOtherLocationRegion: '.create-hearing-other-location',
    hearingInstructionsRegion: '.create-hearing-instructions',
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      step1Error: '.create-hearing-step1-error',
      step1Update: '.create-hearing-step1-btn',
      step2Update: '.create-hearing-step2-btn',
      arbHearingInfo: '.create-hearing-arbs-info',
      hearingConferenceDetails: '.create-hearing-conference-details',
      save: '.btn-continue'
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.step1Update': 'clickStep1Update',
      'click @ui.step2Update': 'clickStep2Update',
      'click @ui.save': 'clickSave'
    });
  },

  clickSave() {
    if (!this.validateAndShowErrors()) {
      return;
    }
    
    if (this.model.hasUnsavedStep1Changes()) {
      this.getUI('step1Error').show();
      this.$el.scrollTop(0);
      return;
    }

    if (this.model.isCustomSelected()) {
      this.model.hearingModel.set(_.extend({
          use_custom_schedule: true,
          use_special_instructions: true,
          conference_bridge_id: null
        },
        this.model.otherLocationModel.getPageApiDataAttrs(),
        this.model.hearingInstructionsTextModel.getPageApiDataAttrs(),
      ));
    } else {
      this.model.hearingModel.set({
        hearing_details: this.getUI('hearingConferenceDetails').html(),
        use_custom_schedule: false,
        use_special_instructions: false
      });
    }

    loaderChannel.trigger('page:load');
    this.model.hearingModel.save()
      .done(() => {
        this.trigger('save:complete', this.model.hearingModel);
        this.close();
      })
      .fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.HEARING.SAVE');
        handler(err);
      });
  },

  clickStep1Update() {
    if (!this.validateAndShowErrors(1)) {
      return;
    }

    this.model.saveInternalDataToModel(1);
    loaderChannel.trigger('page:load');
    this.model.loadAvailableArbs().done(() => {
      if (_.isEmpty(this.model.availableArbsModel.get('optionData'))) {
        this.errorMessage = "No available staff during this time";
        this.model.set('currentStep', 1);
      } else {
        this.model.set('currentStep', 2);
      }
      this.render();
    }).fail(generalErrorFactory.createHandler('ADMIN.SCHEDULE.AVAILABLE.STAFF', () => this.render()))
    .always(() => loaderChannel.trigger('page:load:complete'));
  },

  clickStep2Update() {
    if (!this.validateAndShowErrors(2)) {
      return;
    }

    this.model.saveInternalDataToModel(2);
    loaderChannel.trigger('page:load');
    Promise.all([
      this.model.loadAvailableConferenceBridges(),
      this.model.loadOwnerSchedule()
    ]).then(() => {
      if (_.isEmpty(this.model.availableBridgesModel.get('optionData'))) {
        this.errorMessage = "No available conference bridges during this time";
        this.model.set('currentStep', 2);
      } else {
        this.model.set('currentStep', 3);
      }
      this.render();
    })
    .catch(generalErrorFactory.createHandler('ADMIN.SCHEDULE.AVAILABLE.CONFERENCES', () => this.render()))
    .finally(() => loaderChannel.trigger('page:load:complete'));
  },

  validateAndShowErrors(stepToValidate) {
    this.errorMessage = null;

    const validationsGroups = {
      1: ['hearingTypeRegion', 'hearingPriorityRegion', 'hearingNoteRegion', 'hearingDateRegion', 'hearingStartTimeRegion', 'hearingEndTimeRegion'],
      2: ['hearingArbsRegion'],
      3: this.model.isCustomSelected() ? ['hearingOtherLocationRegion', 'hearingInstructionsRegion'] : ['hearingBridgesRegion']
    };
    // If a step to validate is passed in, validate that.  Otherwise validate all regions
    const regionsToValidate = stepToValidate && _.has(validationsGroups, stepToValidate) ?
      validationsGroups[stepToValidate] :
      _.union.apply(_, _.values(validationsGroups));

    let is_valid = true;
    _.each(regionsToValidate, function(view_name) {
      const view = this.getChildView(view_name);
      if (view) {
        is_valid = view.validateAndShowErrors() && is_valid;
      }
    }, this);
    return is_valid;
  },


  initialize() {
    this.minBookingTime = configChannel.request('get', 'HEARING_MIN_BOOKING_TIME');
    this.setupListeners();
  },

  setupListeners() {
    this.listenTo(this.model, 'update', this.render, this);
    this.listenTo(this.model.hearingDateModel, 'change:value', (model, value) => {
      if (Moment(value).isBefore()) {
        const remainder = this.model.getMinutesToHalfHour();
        this.model.hearingStartTimeModel.set({ value: null, minTime: Moment().add(remainder, "minutes").format(InputModel.getTimeFormat()) });
        this.model.hearingEndTimeModel.set({ value: null, minTime: Moment().add(remainder, "minutes").format(InputModel.getTimeFormat()) });
        this.render();
      } else {
        this.model.hearingStartTimeModel.set({ minTime: this.minBookingTime });
        this.model.hearingEndTimeModel.set({ minTime: this.minBookingTime });
        this.render();
      }
    });
  },

  onRender() {    
    this.renderStep1Views();
    this.renderStep2Views();
    this.renderStep3Views();
    
  },

  renderStep1Views() {
    this.showChildView('hearingTypeRegion', new DropdownView({ model: this.model.hearingTypeModel }));
    this.showChildView('hearingPriorityRegion', new DropdownView({ model: this.model.hearingPriorityModel }));
    this.showChildView('hearingNoteRegion', new InputView({ model: this.model.hearingNoteModel }));

    this.showChildView('hearingDateRegion', new InputView({ model: this.model.hearingDateModel }));
    this.showChildView('hearingStartTimeRegion', new InputView({ model: this.model.hearingStartTimeModel }));
    this.showChildView('hearingEndTimeRegion', new InputView({ model: this.model.hearingEndTimeModel }));
  },

  renderStep2Views() {
    this.showChildView('hearingArbsRegion', new DropdownView({ model: this.model.availableArbsModel }));
  },

  renderStep3Views() {
    this.showChildView('hearingBridgesRegion', new DropdownView({ model: this.model.availableBridgesModel }));
    this.showChildView('hearingScheduleRegion', new RadioView({ model: this.model.hearingScheduleModel }));
    this.showChildView('hearingParticipantCodeRegion', new InputView({ model: this.model.participantCodeModel }));
    this.showChildView('hearingModeratorCodeRegion', new InputView({ model: this.model.moderatorCodeModel }));
    this.showChildView('hearingPrimaryDialinRegion', new InputView({ model: this.model.primaryDialInNumberModel }));
    this.showChildView('hearingPrimaryTitleRegion', new InputView({ model: this.model.primaryDialInTitleModel }));
    this.showChildView('hearingSecondaryDialinRegion', new InputView({ model: this.model.secondaryDialInNumberModel }));
    this.showChildView('hearingSecondaryTitleRegion', new InputView({ model: this.model.secondaryDialInTitleModel }));
    this.renderConferenceDetails();

    this.showChildView('hearingOtherLocationRegion', new InputView({ model: this.model.otherLocationModel }));
    this.showChildView('hearingInstructionsRegion', new TextareaView({ model: this.model.hearingInstructionsTextModel }));
  },

  renderConferenceDetails() {
    const templateData = {
      Formatter,
      access_code: this.model.participantCodeModel.getData(),
      conference_data_items: [{
        title: this.model.primaryDialInTitleModel.getData(),
        phone_number: this.model.primaryDialInNumberModel.getData()
      }, {
        title: this.model.secondaryDialInTitleModel.getData(),
        phone_number: this.model.secondaryDialInNumberModel.getData()
      }]
    };
    this.getUI('hearingConferenceDetails').html(conference_template(templateData));
  },

  templateContext() {
    const currentStep = this.model.get('currentStep');
    const showStep3 = currentStep >= 3;
    const selectedBridge = Number($.trim(this.model.availableBridgesModel.get('value')));
    const hasSelectedBridge = !!selectedBridge;

    return {
      step1Display: this.model.getStep1Display(),
      step2Display: this.model.getStep2Display(),
      showScheduleWarning: !this.model.hasDutyOrWorkingTime() && showStep3,
      arbInfoMessage: this.model.getArbInfoDisplay(this.model.availableArbsModel.getData({ parse: true })),
      conferenceBridgesInfoMessage: this.model.getConferenceBridgeInfoDisplay(selectedBridge),
      
      errorMessage: this.errorMessage,
      showStep2: currentStep >= 2,
      showStep3,

      showCustom: showStep3 && this.model.isCustomSelected(),
      hasSelectedBridge
    };
  }

});
