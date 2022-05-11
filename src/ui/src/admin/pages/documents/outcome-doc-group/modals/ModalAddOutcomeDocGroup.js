import Radio from 'backbone.radio';
import ModalBaseView from '../../../../../core/components/modals/ModalBase';
import DropdownView from '../../../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../../../core/components/dropdown/Dropdown_model';
import InputModel from '../../../../../core/components/input/Input_model';
import InputView from '../../../../../core/components/input/Input';
import OutcomeDocGroupModel from '../../../../components/documents/OutcomeDocGroup_model';
import template from './ModalAddOutcomeDocGroup_template.tpl';
import { generalErrorFactory } from '../../../../../core/components/api/ApiLayer';

const configChannel = Radio.channel('config');
const hearingChannel = Radio.channel('hearings');
const statusChannel = Radio.channel('status');
const disputeChannel = Radio.channel('dispute');
const loaderChannel = Radio.channel('loader');
const documentsChannel = Radio.channel('documents');
const Formatter = Radio.channel('formatter').request('get');

export default ModalBaseView.extend({
  template,
  id: 'addOutcomeDocSet_modal',
  
  regions: {
    typeRegion: '#addOutcomeDocFile_type',
    titleRegion: '#addOutcomeDocFile_title',
    acronymRegion: '#addOutcomeDocFile_acronym'
  },

  ui() {
    return Object.assign({}, ModalBaseView.prototype.ui, {
      save: '#addOutcomeDocSet_save'
    });
  },

  events() {
    return Object.assign({}, ModalBaseView.prototype.events, {
      'click @ui.save': 'clickSave'
    });
  },

  clickSave() {
    if (!this.validateAndShowErrors()) {
      return;
    }

    loaderChannel.trigger('page:load');
    this._isOtherDocTypeSelected() ?
        this._createOtherOutcomeFile() :
        this._createOutcomeFileFromConfig(this.typeModel.getData());
    
    // Save the outcome group, then save the outcome group files
    this.model.saveAll({ deliveries: true })
      .done(() => {
        this.trigger('save:complete', this.model);
        loaderChannel.trigger('page:load:complete');
      })
      .fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.OUTCOMEDOCGROUP.SAVE.ALL', () => {
          this.trigger('save:complete', this.model);
        });
        handler(err);
      });
  },

  _isOtherDocTypeSelected() {
    const typeValue = this.typeModel.getData();
    return typeValue && ['65', '66', '67', '68'].includes(String(typeValue));
  },

  _createOutcomeFileFromConfig(docConfigId) {
    const fileConfig = documentsChannel.request('config:file', docConfigId);
    // Add the file then the deliveries
    return this.model.createOutcomeFileFromConfig(fileConfig, { add: true });
  },

  _createOtherOutcomeFile() {
    const models = [this.typeModel, this.titleModel, this.acronymModel];
    return this.model.createOutcomeFile(
      _.extend({},
        ...models.map(model => model.getPageApiDataAttrs() ),
        { file_source: configChannel.request('get', 'OUTCOME_DOC_FILE_SOURCE_EXTERNAL') }
      ), { add: true }
    );
  },

  _generateAcronym(titleValue) {
    const acronymWords = $.trim(titleValue).split(/\s+/);
    return `O-${(acronymWords || [])
      .filter(word => $.trim(word))
      .map(word => word && word.length ? String(word[0]).toUpperCase() : null)
      .join('')
     }`.slice(0, this.OUTCOME_DOC_FILE_ACRONYM_MAX_LENGTH);
  },

  validateAndShowErrors() {
    const regions_to_validate = ['typeRegion', ...(this._isOtherDocTypeSelected() ?  ['titleRegion', 'acronymRegion'] : [])];

    let is_valid = true;
    _.each(regions_to_validate, function(region_name) {
      const view = this.getChildView(region_name);
      if (view) {
        is_valid = view.validateAndShowErrors() && is_valid;
      }
    }, this);

    return is_valid;
  },

  initialize(options) {
    if (!(options || {}).collection) {
      console.log(`[Error] Need a collection to add doc group to`);
      return;
    }
    
    // Create the outcome doc group model, use it as this View's model so this modal can act like ModalAddOutcomeFile.js
    this.model = new OutcomeDocGroupModel({
      doc_group_type: configChannel.request('get', 'OUTCOME_DOC_GROUP_TYPE_CUSTOM'),
      doc_status: configChannel.request('get', 'OUTCOME_DOC_GROUP_STATUS_ACTIVE')
    });

    this.dispute = disputeChannel.request('get');
    this.hearing = hearingChannel.request('get:latest');

    this.OUTCOME_DOC_FILE_TITLE_MAX_LENGTH = configChannel.request('get', 'OUTCOME_DOC_FILE_TITLE_MAX_LENGTH') || 45;
    this.OUTCOME_DOC_FILE_ACRONYM_MAX_LENGTH = configChannel.request('get', 'OUTCOME_DOC_FILE_ACRONYM_MAX_LENGTH') || 4;
    
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    // NOTE: For R1, we are always creating a custom outcome doc set, so this isn't outcome type but instead the file:

    this.typeModel = new DropdownModel({
      optionData: Object.entries(documentsChannel.request('config:files', this.dispute, this.hearing))
        .map( ([code, config_data]) => ({ value: code, text: (config_data||{}).title }) ),
      labelText: 'Initial document',
      errorMessage: 'Select an initial document',
      required: true,
      defaultBlank: true,
      value: null,
      apiMapping: 'file_type'
    });

    this.titleModel = new InputModel({
      labelText: 'Custom Title',
      errorMessage: 'Enter the document title',
      maxLength: this.OUTCOME_DOC_FILE_TITLE_MAX_LENGTH,
      minLength: 5,
      required: true,
      value: null,
      apiMapping: 'file_title'
    });

    this.acronymModel = new InputModel({
      labelText: 'Acronym',
      required: true,
      disabled: true,
      maxLength: this.OUTCOME_DOC_FILE_ACRONYM_MAX_LENGTH,
      value: null,
      apiMapping: 'file_acronym'
    });
  },

  setupListeners() {
    this.listenTo(this.typeModel, 'change:value', this.render, this);

    this.listenTo(this.titleModel, 'change:value', (model, value) => {
      this.acronymModel.set('value', this._generateAcronym(value));
      const view = this.getChildView('acronymRegion');
      if (view) {
        view.render();
      }
    });
  },

  onBeforeRender() {
    if (this._isOtherDocTypeSelected()) {
      this.acronymModel.set('value', this._generateAcronym(this.titleModel.getData()));
    }
  },

  onRender() {
    this.showChildView('typeRegion', new DropdownView({ model: this.typeModel }));
    this.showChildView('titleRegion', new InputView({ model: this.titleModel }));
    this.showChildView('acronymRegion', new InputView({ model: this.acronymModel }));
  },

  templateContext() {
    return {
      Formatter,
      dispute: this.dispute,
      colourClass: statusChannel.request('get:colourclass', this.dispute.getStage(), this.dispute.getStatus()) || '',
      linkTypeDisplay: this.hearing ? this.hearing.getDisputeHearingLinkDisplay() : '-',
      isOtherDocTypeSelected: this._isOtherDocTypeSelected()
    };
  }
});