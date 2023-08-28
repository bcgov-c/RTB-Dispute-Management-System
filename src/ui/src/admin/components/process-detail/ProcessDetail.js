//TODO: unused?
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import EditableComponentView from '../../../core/components/editable-component/EditableComponent';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import TextareaModel from '../../../core/components/textarea/Textarea_model';
import TextareaView from '../../../core/components/textarea/Textarea';
import InputModel from '../../../core/components/input/Input_model';
import InputView from '../../../core/components/input/Input';
import template from './ProcessDetail_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const PROCESS_OUTCOME_OTHER_TITLE = 'Other - See Description';
const MAX_OUTCOME_DESCRIPTION_LENGTH = 250;

const disputeChannel = Radio.channel('dispute');
const animationChannel = Radio.channel('animations');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const statusChannel = Radio.channel('status');
const participantsChannel = Radio.channel('participants');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'process-group-detail',

  regions: {
    outcomeRegion: '.process-group-detail-outcome',
    firstApplicantRegion: '.process-group-detail-first-applicant',
    secondApplicantRegion: '.process-group-detail-second-applicant',
    reasonRegion: '.process-group-detail-reason',
    hearingDurationRegion: '.process-group-detail-hearing-duration',
    writingDurationRegion: '.process-group-detail-writing-duration',
    preparationDurationRegion: '.process-group-detail-preparation-duration',
    methodRegion: '.process-group-detail-method',
    complexityRegion: '.process-group-detail-complexity',
    descriptionRegion: '@ui.description',
    noteRegion: '.process-group-detail-note'
  },

  ui: {
    description: '.process-group-detail-description',
    ownBody: '.process-detail-hearing-tools-content.view',
    edit: '.process-detail-hearing-tools-edit',
    saveButtons: '.hearing-tools-save-controls',
    cancel: '.hearing-tools-save-controls-cancel',
    save: '.hearing-tools-save-controls-save'
  },

  events: {
    'click @ui.ownBody': 'clickEdit',
    'click @ui.edit': 'clickEdit',
    'click @ui.cancel': 'clickCancel',
    'click @ui.save': 'clickSave',
  },

  clickEdit() {
    const editFn = () => {
      this.mode = 'edit';
      this.displayOrHide();
      this.render();
      if (Number(this.outcomeModel.getData()) !== configChannel.request('get', 'PROCESS_OUTCOME_OTHER')) this.hideOutcomeDescription();
  
      _.each(this.editGroup, function(component_name) {
        const component = this.getChildView(component_name);
        if (component) {
          component.toEditable();
        }
      }, this);
    };

    const dispute = disputeChannel.request('get');
    if (dispute) {
      dispute.checkEditInProgressPromise().then(
        () => {
          dispute.startEditInProgress(this.model);
          editFn();
        },
        () => dispute.showEditInProgressModalPromise()
      );
    } else {
      editFn();
    }
  },

  clickCancel() {
    this.mode = 'view';
    this.createSubModels();
    this.setHiddenVars();
    this.render();
  },

  clickSave() {
    if (!this.validateAndShowErrors()) {
      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length > 0) {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', { is_page_item: true });
      }
      return;
    }

    const apiChanges = {};
    _.each(this.editGroup, function(regionName) {
      const view = this.getChildView(regionName);
      if (!view) {
        return;
      }
      _.extend(apiChanges, view.getModel().getPageApiDataAttrs());
    }, this);
    
    this.model.set(apiChanges);
    
    loaderChannel.trigger('page:load');
    this.model.save(this.model.getApiChangesOnly())
      .done(() => {
        loaderChannel.trigger('page:load:complete');
        this.mode = 'view';
        this.setHiddenVars();
        this.render();
        this.showOutcomeDescription();
      })
      .fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.PROCESSDETAIL.SAVE', () => {
          this.mode = 'view';
          this.render();
        });
        handler(err);
      });
  },

  validateAndShowErrors() {
    let is_valid = true;
    _.each(this.editGroup, function(component_name) {
      const component = this.getChildView(component_name);
      if (component) {
        is_valid = component.validateAndShowErrors() && is_valid;
      }
    }, this);
    return is_valid;
  },

  initialize(options) {
    this.mergeOptions(options, ['isCurrentProcess']);
    this.editGroup = ['outcomeRegion', 'firstApplicantRegion', 'secondApplicantRegion', 'reasonRegion', 'hearingDurationRegion',
        'methodRegion', 'complexityRegion', 'descriptionRegion', 'noteRegion', 'writingDurationRegion', 'preparationDurationRegion'];
    this.participants = participantsChannel.request('get:all:participants', { include_removed: false });
    this.mode = 'view';

    this.PROCESS_OUTCOME_OTHER = configChannel.request('get', 'PROCESS_OUTCOME_OTHER');
    this.PROCESS_OUTCOME_OTHER = this.PROCESS_OUTCOME_OTHER ? String(this.PROCESS_OUTCOME_OTHER) : null;
    this.setHiddenVars();
    this.setupListeners();
    this.createSubModels();
  },

  _getHearingMethodOptionsData() {
    const HEARING_METHOD_DISPLAYS = configChannel.request('get', 'HEARING_METHOD_DISPLAY');
    return ['HEARING_METHOD_ADJUDICATION', 'HEARING_METHOD_SETTLEMENT', 'HEARING_METHOD_BOTH', 'HEARING_METHOD_OTHER'].map( (configCode) => {
      const configValue = configChannel.request('get', configCode);
      return { value: String(configValue), text: HEARING_METHOD_DISPLAYS[configValue] };
    });
  },

  _getHearingComplexityOptionsData() {
    const HEARING_COMPLEXITY_DISPLAYS = configChannel.request('get', 'HEARING_COMPLEXITY_DISPLAY');
    return ['COMPLEXITY_SIMPLE', 'COMPLEXITY_STANDARD', 'COMPLEXITY_COMPLEX'].map( (configCode) => {
      const configValue = configChannel.request('get', configCode);
      return { value: String(configValue), text: HEARING_COMPLEXITY_DISPLAYS[configValue] };
    });
  },

  _getProcessOutcomeOptions() {
    const options = [];
    const currentProcess = this.model.get('associated_process');
    Object.entries(statusChannel.request('get:processOutcomes:config') || {}).forEach( ([processOutcomeCode, processOutcomeConfig]) => {
      if ( (processOutcomeConfig.associated_processes || []).includes(currentProcess) ) {
        const processTitle = (processOutcomeCode && String(processOutcomeCode) === this.PROCESS_OUTCOME_OTHER) ? PROCESS_OUTCOME_OTHER_TITLE : processOutcomeConfig.title;
        options.push({ value: processOutcomeCode, text: processTitle });
      }
    });
    return options;
  },

  _getProcessReasonOptions() {
    return Object.entries(configChannel.request('get', 'PROCESS_REASON_DISPLAY') || {}).map( ([value, text]) => ({ value, text }) );
  },

  setupListeners() {
    this.listenTo(this.outcomeModel, 'change:value', (model, value) => {
      if (Number(value) === configChannel.request('get', 'PROCESS_OUTCOME_OTHER')) {
        this.showOutcomeDescription();
      } else {
        this.descriptionModel.set({ value: null });
        this.hideOutcomeDescription();
      }
    });
  },

  prePopulateHearingMethod() {
    const currentProcess = this.model.get('associated_process');
    const nonParticipatory = configChannel.request('get', 'PROCESS_WRITTEN_OR_DR');
    const reviewRequest = configChannel.request('get', 'PROCESS_REVIEW_REQUEST');
    const hearingMethodAdjudication = configChannel.request('get', 'HEARING_METHOD_ADJUDICATION');
    if (currentProcess === nonParticipatory || currentProcess === reviewRequest) {
     return String(hearingMethodAdjudication)
    } else return null;
  },

  setHiddenVars() {
    if (!this.isCurrentProcess) return;
    this.firstApplicantHidden = false;
    this.secondApplicantHidden = false;
    this.reasonHidden = false;
    this.hearingDurationHidden = false;
    this.preparationDurationHidden = false;
    this.outcomeDescriptionHidden = true;
  },

  showOutcomeDescription() {
    if (!this.isCurrentProcess) return;
    this.getUI('description').removeClass('hidden');
  },

  hideOutcomeDescription() {
    if (!this.isCurrentProcess) return;
    this.getUI('description').addClass('hidden');
    this.getChildView('descriptionRegion').render();
  },

  createSubModels() {
    const getParticipantsAsOptionsFn = () => this.participants.map((participant) => ({ value: String(participant.id), text: participant.getDisplayName() }) );
    
    this.outcomeModel = new DropdownModel({
      optionData: this._getProcessOutcomeOptions(),
      labelText: 'Process Outcome',
      defaultBlank: true,
      required: false,
      value: this.model.get('process_outcome_code') ? String(this.model.get('process_outcome_code')) : null,
      apiMapping: 'process_outcome_code'
    });

    this.firstApplicantModel = new DropdownModel({
      optionData: getParticipantsAsOptionsFn(),
      labelText: 'First Process Applicant',
      defaultBlank: true,
      required: false,
      value: this.model.get('process_applicant1_id') ? String(this.model.get('process_applicant1_id')) : null,
      apiMapping: 'process_applicant1_id'
    });

    this.secondApplicantModel = new DropdownModel({
      optionData: getParticipantsAsOptionsFn(),
      labelText: 'Second Process Applicant',
      defaultBlank: true,
      required: false,
      value: this.model.get('process_applicant2_id') ? String(this.model.get('process_applicant2_id')) : null,
      apiMapping: 'process_applicant2_id'
    });

    this.reasonModel = new DropdownModel({
      optionData: this._getProcessReasonOptions(),
      labelText: 'Grounds for Review',
      defaultBlank: true,
      required: false,
      value: this.model.get('process_reason_code') ? String(this.model.get('process_reason_code')) : null,
      apiMapping: 'process_reason_code'
    });

    this.hearingDurationModel = new InputModel({
      labelText: 'Hearing Duration (min)',
      errorMessage: 'Enter the actual hearing duration in minutes',
      inputType: 'positive_integer',
      required: false,
      value: this.model.get('process_duration'),
      apiMapping: 'process_duration'
    });

    this.writingDurationModel = new InputModel({
      labelText: 'Writing Duration (min)',
      errorMessage: 'Enter the writing duration in minutes',
      inputType: 'positive_integer',
      required: false,
      value: this.model.get('writing_duration'),
      apiMapping: 'writing_duration'
    });

    this.preparationDurationModel = new InputModel({
      labelText: 'Preparation Duration (min)',
      errorMessage: 'Enter the preparation duration in minutes',
      inputType: 'positive_integer',
      required: false,
      value: this.model.get('preparation_duration'),
      apiMapping: 'preparation_duration'
    });

    const prePophearingValue = this.prePopulateHearingMethod();

    this.methodModel = new DropdownModel({
      labelText: 'Hearing Method',
      errorMessage: 'Enter the hearing method',
      defaultBlank: true,
      required: false,
      optionData: this._getHearingMethodOptionsData(),
      value: this.model.get('process_method') ? String(this.model.get('process_method')) : prePophearingValue ? prePophearingValue : null,
      apiMapping: 'process_method'
    });

    this.complexityModel = new DropdownModel({
      labelText: 'Hearing Complexity',
      errorMessage: 'Enter the hearing complexity',
      defaultBlank: true,
      required: false,
      optionData: this._getHearingComplexityOptionsData(),
      value: this.model.get('process_complexity') ? String(this.model.get('process_complexity')) : null,
      apiMapping: 'process_complexity'
    });

    this.descriptionModel = new TextareaModel({
      labelText: 'Outcome Description',
      errorMessage: 'Enter the description',
      max: MAX_OUTCOME_DESCRIPTION_LENGTH,
      required: false,
      displayRows: 2,
      value: this.model.get('process_outcome_description'),
      apiMapping: 'process_outcome_description'
    });

    this.noteModel = new TextareaModel({
      labelText: 'Internal Outcome Note',
      errorMessage: 'Enter a note',
      required: false,
      displayRows: 2,
      value: this.model.get('process_outcome_note'),
      apiMapping: 'process_outcome_note'
    });
  },

  displayOrHide() {
    if (!this.isCurrentProcess) return;
    const dispute = disputeChannel.request('get');
    const participatory = configChannel.request('get', 'PROCESS_ORAL_HEARING');
    const nonParticipatory = configChannel.request('get', 'PROCESS_WRITTEN_OR_DR');
    const reviewRequest = configChannel.request('get', 'PROCESS_REVIEW_REQUEST');
    const reviewHearing = configChannel.request('get', 'PROCESS_REVIEW_HEARING');
    const joinerRequest = configChannel.request('get', 'PROCESS_JOINER_REQUEST');
    const joinerHearing = configChannel.request('get', 'PROCESS_JOINER_HEARING');
    const rentIncrease = configChannel.request('get', 'PROCESS_RENT_INCREASE');

    if (dispute.checkProcess([participatory, reviewHearing, joinerRequest, joinerHearing, rentIncrease])) {
      this.firstApplicantHidden = true;
      this.secondApplicantHidden = true;
      this.reasonHidden = true;
    } else if (dispute.checkProcess(nonParticipatory)) {
      this.firstApplicantHidden = true;
      this.secondApplicantHidden = true;
      this.reasonHidden = true;
      this.hearingDurationHidden = true;
      this.preparationDurationHidden = true;
    } else if (dispute.checkProcess(reviewRequest)) {
      this.hearingDurationHidden = true;
      this.preparationDurationHidden = true;
    }
  },
  
  onRender() {
    const dispute = disputeChannel.request('get');
    if (this.mode === 'view' && dispute && dispute.checkEditInProgressModel(this.model)) {
      dispute.stopEditInProgress();
    }

    this.showChildView('outcomeRegion', new EditableComponentView({
      state: 'view',
      label: this.outcomeModel.get('labelText'),
      view_value: this.outcomeModel.getSelectedText() || '-',
      subView: new DropdownView({
        model: this.outcomeModel
      })
    }));

    this.showChildView('firstApplicantRegion', new EditableComponentView({
      state: 'view',
      label: this.firstApplicantModel.get('labelText'),
      view_value: this.firstApplicantModel.getSelectedText() || '-',
      subView: new DropdownView({
        model: this.firstApplicantModel
      })
    }));

    this.showChildView('secondApplicantRegion', new EditableComponentView({
      state: 'view',
      label: this.secondApplicantModel.get('labelText'),
      view_value: this.secondApplicantModel.getSelectedText() || '-',
      subView: new DropdownView({
        model: this.secondApplicantModel
      })
    }));

    this.showChildView('reasonRegion', new EditableComponentView({
      state: 'view',
      label: this.reasonModel.get('labelText'),
      view_value: this.reasonModel.getSelectedText() || '-',
      subView: new DropdownView({
        model: this.reasonModel
      })
    }));

    this.showChildView('hearingDurationRegion', new EditableComponentView({
      state: 'view',
      label: this.hearingDurationModel.get('labelText'),
      view_value: this.hearingDurationModel.getData() || '-',
      subView: new InputView({
        model: this.hearingDurationModel
      })
    }));

    this.showChildView('writingDurationRegion', new EditableComponentView({
      state: 'view',
      label: this.writingDurationModel.get('labelText'),
      view_value: this.writingDurationModel.getData() || '-',
      subView: new InputView({
        model: this.writingDurationModel
      })
    }));


    this.showChildView('preparationDurationRegion', new EditableComponentView({
      state: 'view',
      label: this.preparationDurationModel.get('labelText'),
      view_value: this.preparationDurationModel.getData() || '-',
      subView: new InputView({
        model: this.preparationDurationModel
      })
    }));

    this.showChildView('complexityRegion', new EditableComponentView({
      state: 'view',
      label: this.complexityModel.get('labelText'),
      view_value: this.complexityModel.getSelectedText() || '-',
      subView: new DropdownView({
        model: this.complexityModel
      })
    }));

    this.showChildView('methodRegion', new EditableComponentView({
      state: 'view',
      label: this.methodModel.get('labelText'),
      view_value: this.methodModel.getSelectedText() || '-',
      subView: new DropdownView({
        model: this.methodModel
      })
    }));

    this.showChildView('descriptionRegion', new EditableComponentView({
      state: 'view',
      label: this.descriptionModel.get('labelText'),
      view_value: this.descriptionModel.getData() || '-',
      subView: new TextareaView({
        model: this.descriptionModel
      })
    }));

    this.showChildView('noteRegion', new EditableComponentView({
      state: 'view',
      label: this.noteModel.get('labelText'),
      view_value: this.noteModel.getData() || '-',
      subView: new TextareaView({
        model: this.noteModel
      })
    }));

    this.setupListeners();
  },

  templateContext() {
    return {
      Formatter,
      mode: this.mode,
      isEmpty: !this.model.hasSavedData(),
      processDisplay: Formatter.toProcessDisplay(this.model.get('associated_process')) || 'Process',
      firstApplicantHidden: this.firstApplicantHidden,
      secondApplicantHidden: this.secondApplicantHidden,
      reasonHidden: this.reasonHidden,
      hearingDurationHidden: this.hearingDurationHidden,
      preparationDurationHidden: this.preparationDurationHidden,
    };
  }
});