import Radio from 'backbone.radio';
import ModalBaseView from '../../../../../core/components/modals/ModalBase';
import InputView from '../../../../../core/components/input/Input';
import InputModel from '../../../../../core/components/input/Input_model';
import CheckboxCollection from '../../../../../core/components/checkbox/Checkbox_collection';
import CheckboxCollectionView from '../../../../../core/components/checkbox/Checkboxes';
import CheckboxModel from '../../../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../../../core/components/checkbox/Checkbox';
import RadioModel from '../../../../../core/components/radio/Radio_model';
import RadioView from '../../../../../core/components/radio/Radio';
import { generalErrorFactory } from '../../../../../core/components/api/ApiLayer';
import template from './ModalAddOutcomeFile_template.tpl';

const MAX_ACRONYM_LENGTH = 5;

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

  className: 'modal modal-rtb-default',

  regions: {
    checkboxesRegion: '#addOutcomeDocFile_checkboxes',
    titleRegion: '#addOutcomeDocFile_title',
    acronymRegion: '#addOutcomeDocFile_acronym',
    showAllRegion: '.addOutcomeDocSet_show-all',
    fileSubTypeRegion: '.addOutcomeDocSet_file-sub-type',
  },

  ui() {
    return Object.assign({}, ModalBaseView.prototype.ui, {
      save: '#addOutcomeDocFile_save',
    });
  },

  events() {
    return Object.assign({}, ModalBaseView.prototype.events, {
      'click @ui.save': 'clickSave'
    });
  },

  clickSave() {
    if (!this.validateAndShowErrors()) return;

    loaderChannel.trigger('page:load');

    // Reset any changes made to the existing file models in edit because we are saving changes
    this.model.getOutcomeFiles().each(outcomeFile => outcomeFile.resetModel());

    this.filesCheckbox.each(checkboxModel => {
      if (checkboxModel.get('disabled') || !checkboxModel.get('checked')) return;

      const fileType = checkboxModel.get('_file_type');
      const fileConfig = documentsChannel.request('config:file', fileType) || {};

      if (fileConfig.is_other) this._createOtherOutcomeFile(fileType)
      else this.model.createOutcomeFileFromConfig(fileConfig, { add: true });
    });

    if (this.showFileSubType) this.model.getOutcomeFiles().forEach(m => m.set('file_sub_type', this.fileSubTypeModel.getData())); 

    const promiseToUse = this.fullSave ? this.model.saveAll({ deliveries: true }) : this.model.saveOutcomeFiles();
    const errorCodeToUse = this.fullSave ? 'ADMIN.OUTCOMEDOCGROUP.SAVE.ALL' : 'ADMIN.OUTCOMEDOCFILE.SAVE.ALL';
    
    promiseToUse.done(() => this.trigger('save:complete', this.model))
      .fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler(errorCodeToUse, () => {
          this.trigger('save:complete', this.model);
        });
        handler(err);
      });
  },

_incrementAcronym(sortedExistingAcronymList) {
  const incrementCount = sortedExistingAcronymList.get('file_acronym').match(/\d*$/);
  const incrementAmount = (++incrementCount[0]);
  
  if (sortedExistingAcronymList.get('file_acronym').length < MAX_ACRONYM_LENGTH) {
    const incrementedAcronym = sortedExistingAcronymList.get('file_acronym').substr(0, incrementCount.index) + (incrementAmount);
    const incrementedTitle = this.titleModel.getData() + (incrementAmount);
  
    this.titleModel.set({ value: incrementedTitle });
    this.acronymModel.set({ value: incrementedAcronym });
  }
},

  _createOtherOutcomeFile(fileType) {
    const sortedExistingAcronymList = this.model.getOutcomeFiles().filter(model => model.get('file_acronym').includes(this.acronymModel.getData())).sort((a,b) => (a.get('file_acronym') > b.get('file_acronym')) ? 1 : ((b.get('file_acronym') > a.get('file_acronym')) ? -1 : 0))

    if (sortedExistingAcronymList.length) {
      const indexToIncrement = sortedExistingAcronymList.length -1;
      this._incrementAcronym(sortedExistingAcronymList[indexToIncrement]);
    }

    const models = [this.titleModel, this.acronymModel];
    return this.model.createOutcomeFile(
      _.extend({
          file_type: fileType
        },
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

  isFileTypeOtherDoc(fileType) {
    const docConfig = documentsChannel.request('config:file', fileType) || {};
    return docConfig && docConfig.code === configChannel.request('get', 'OUTCOME_DOC_OTHER_CODE');
  },

  // Checks whether a NEW other doc is selected
  // NOTE: Limitation is only one "other" file can be added per group
  _isOtherDocTypeSelected() {
    return this.filesCheckbox.find(checkboxModel => (
      checkboxModel.get('checked') &&
      !checkboxModel.get('disabled') &&
      this.isFileTypeOtherDoc(checkboxModel.get('_file_type'))
    ));
  },

  validateAndShowErrors() {
    const regions_to_validate = ['checkboxesRegion',
      ...(this.showFileSubType ? ['fileSubTypeRegion'] : []),
      ...(this._isOtherDocTypeSelected() ?  ['titleRegion', 'acronymRegion'] : [])
    ];

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
    if (!(options || {}).model) {
      console.log(`[Error] Need the outcome document group model to add outcome document to`);
      return;
    }

    this.mergeOptions(options, ['fullSave']);

    this.dispute = disputeChannel.request('get');
    this.hearing = hearingChannel.request('get:latest');
    
    this.OUTCOME_DOC_FILE_TYPE_PDF_ANONYMIZED_DECISION = String(configChannel.request('get', 'OUTCOME_DOC_FILE_TYPE_PDF_ANONYMIZED_DECISION') || '');
    this.OUTCOME_DOC_FILE_TITLE_MAX_LENGTH = configChannel.request('get', 'OUTCOME_DOC_FILE_TITLE_MAX_LENGTH') || 45;
    this.OUTCOME_DOC_FILE_ACRONYM_MAX_LENGTH = configChannel.request('get', 'OUTCOME_DOC_FILE_ACRONYM_MAX_LENGTH') || 4;
    this.OUTCOME_DOC_OTHER_CODE = configChannel.request('get', 'OUTCOME_DOC_OTHER_CODE') || 4;
    this.outcome_doc_group_sort_order = configChannel.request('get', 'outcome_doc_group_sort_order') || [];

    this.OUTCOME_DOC_FILE_SUB_TYPE_NEW = configChannel.request('get', 'OUTCOME_DOC_FILE_SUB_TYPE_NEW');
    this.OUTCOME_DOC_FILE_SUB_TYPE_CORR = configChannel.request('get', 'OUTCOME_DOC_FILE_SUB_TYPE_CORR');
    this.OUTCOME_DOC_FILE_SUB_TYPE_REVIEW = configChannel.request('get', 'OUTCOME_DOC_FILE_SUB_TYPE_REVIEW');
    
    const existingOutcomeFiles = this.model.getOutcomeFiles();
    const activeGrantedRequests = documentsChannel.request('get:requests').filter(r => (
      r.isStatusCompleted() && r.getRequestItems().find(item => item.isStatusGranted())
      && Moment(r.get('request_completion_date')).isSameOrBefore(this.model.get('created_date') ? Moment(this.model.get('created_date')) : Moment())
    ));
    this.hasCorrRequest = activeGrantedRequests.find(r => r.isCorrection()) || existingOutcomeFiles.find(f => f.get('file_sub_type') === this.OUTCOME_DOC_FILE_SUB_TYPE_CORR);
    this.hasReviewRequest = activeGrantedRequests.find(r => r.isReview()) || existingOutcomeFiles.find(f => f.get('file_sub_type') === this.OUTCOME_DOC_FILE_SUB_TYPE_REVIEW);
    this.showFileSubType = this.hasCorrRequest || this.hasReviewRequest;
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.filesCheckbox = new CheckboxCollection();

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

    this.showAllModel = new CheckboxModel({
      html: 'Show all available decisions',
      checked: false,
      required: false,
    });

    const OUTCOME_DOC_GROUP_SUB_TYPE_DISPLAY = configChannel.request('get', 'OUTCOME_DOC_GROUP_SUB_TYPE_DISPLAY');
    this.fileSubTypeModel = new RadioModel({
      optionData: [
        ...(this.hasCorrRequest ? [{ value: this.OUTCOME_DOC_FILE_SUB_TYPE_CORR, text: OUTCOME_DOC_GROUP_SUB_TYPE_DISPLAY[this.OUTCOME_DOC_FILE_SUB_TYPE_CORR] }] : []),
        ...(this.hasReviewRequest ? [{ value: this.OUTCOME_DOC_FILE_SUB_TYPE_REVIEW, text: OUTCOME_DOC_GROUP_SUB_TYPE_DISPLAY[this.OUTCOME_DOC_FILE_SUB_TYPE_REVIEW] }] : []),
        { value: this.OUTCOME_DOC_FILE_SUB_TYPE_NEW, text: OUTCOME_DOC_GROUP_SUB_TYPE_DISPLAY[this.OUTCOME_DOC_FILE_SUB_TYPE_NEW] },
      ],
      required: true,
      value: this.model.isSubTypeCorrection() && !this.model.isSubTypeReview() ? this.OUTCOME_DOC_FILE_SUB_TYPE_CORR
        : this.model.isSubTypeReview() && !this.model.isSubTypeCorrection() ? this.OUTCOME_DOC_FILE_SUB_TYPE_REVIEW
        : this.OUTCOME_DOC_FILE_SUB_TYPE_NEW
    });

    this.setFileCheckboxCollection();
  },

  setFileCheckboxCollection() {
    const showAll = this.showAllModel.getData();
    const existingFileCodes = {};
    const outcomeFiles = this.model.getOutcomeFiles();
    outcomeFiles.each(outcomeDocFile => {
      // Allow duplicates of "other" files, don't show public or external outcome files
      if (!outcomeDocFile.isOther()) existingFileCodes[outcomeDocFile.get('file_type')] = true;
    });

    let checkboxOptions = [
      ..._.map(outcomeFiles.filter(m =>!m.isPublic() && !m.isExternal()), outcomeFile => ({
        _file_type: outcomeFile.get('file_type'),
        _file_acronym: outcomeFile.get('file_acronym'),
        html: outcomeFile.get('file_title'),
        checked: true,
        disabled: true
      })),
      ...Object.entries(documentsChannel.request(showAll ? 'config:all:files' : 'config:files', this.dispute, this.hearing))
        .filter( ([code, configData]) => !existingFileCodes[code] && code
          && code !== this.OUTCOME_DOC_FILE_TYPE_PDF_ANONYMIZED_DECISION
          && configData?.can_staff_create
        ).map( ([code, config_data]) => ({
          _file_type: code,
          _file_acronym: (config_data||{}).code,
          html: (config_data||{}).title
        }) )
    ];
    checkboxOptions = _.sortBy(checkboxOptions, optionData => {
      let order = this.outcome_doc_group_sort_order.indexOf(optionData._file_acronym);
      // Sort "other" to the bottom
      if (order === -1) order = Number.MAX_SAFE_INTEGER-(optionData._file_acronym === this.OUTCOME_DOC_OTHER_CODE ? 0 : 1);
      return order;
    });
    
    this.filesCheckbox.reset(checkboxOptions, { silent: true });
  },

  toggleFileSubTypes() {
    const OUTCOME_DOC_GROUP_SUB_TYPE_DISPLAY = configChannel.request('get', 'OUTCOME_DOC_GROUP_SUB_TYPE_DISPLAY');
    if (this.showAllModel.getData()) {
      this.showFileSubType = true;
      this.fileSubTypeModel.set({
        optionData: [
          { value: this.OUTCOME_DOC_FILE_SUB_TYPE_CORR, text: OUTCOME_DOC_GROUP_SUB_TYPE_DISPLAY[this.OUTCOME_DOC_FILE_SUB_TYPE_CORR] },
          { value: this.OUTCOME_DOC_FILE_SUB_TYPE_REVIEW, text: OUTCOME_DOC_GROUP_SUB_TYPE_DISPLAY[this.OUTCOME_DOC_FILE_SUB_TYPE_REVIEW] },
          { value: this.OUTCOME_DOC_FILE_SUB_TYPE_NEW, text: OUTCOME_DOC_GROUP_SUB_TYPE_DISPLAY[this.OUTCOME_DOC_FILE_SUB_TYPE_NEW] },
        ]
      });
    } else {
      this.showFileSubType = this.hasCorrRequest || this.hasReviewRequest;
      this.fileSubTypeModel.set({
        optionData: [
          ...(this.hasCorrRequest ? [{ value: this.OUTCOME_DOC_FILE_SUB_TYPE_CORR, text: OUTCOME_DOC_GROUP_SUB_TYPE_DISPLAY[this.OUTCOME_DOC_FILE_SUB_TYPE_CORR] }] : []),
          ...(this.hasReviewRequest ? [{ value: this.OUTCOME_DOC_FILE_SUB_TYPE_REVIEW, text: OUTCOME_DOC_GROUP_SUB_TYPE_DISPLAY[this.OUTCOME_DOC_FILE_SUB_TYPE_REVIEW] }] : []),
          { value: this.OUTCOME_DOC_FILE_SUB_TYPE_NEW, text: OUTCOME_DOC_GROUP_SUB_TYPE_DISPLAY[this.OUTCOME_DOC_FILE_SUB_TYPE_NEW] },
        ]
      })
    }
    this.render();
  },

  setupListeners() {
    this.listenTo(this.typeModel, 'change:value', this.render, this);

    this.listenTo(this.titleModel, 'change:value', (model, value) => {
      this.acronymModel.set('value', this._generateAcronym(value));
      const view = this.getChildView('acronymRegion');
      if (view) view.render();
    });

    this.listenTo(this.filesCheckbox, 'change:checked', (model, checked) => {
      const clickedOther = this.isFileTypeOtherDoc(model.get('_file_type'));
      this.filesCheckbox.forEach(checkbox => {
        if (!clickedOther || checkbox.cid === model.cid) return;
        if (this.isFileTypeOtherDoc(checkbox.get('_file_type'))) {
          checkbox.set('disabled', !!checked, { silent: true });
        }
      });
      this.render();
    });

    this.listenTo(this.showAllModel, 'change:checked', () => {
      this.setFileCheckboxCollection();
      this.toggleFileSubTypes();
      this.render();
    });
  },

  onBeforeRender() {
    if (this._isOtherDocTypeSelected()) {
      this.acronymModel.set('value', this._generateAcronym(this.titleModel.getData()));
    }
  },

  onRender() {
    this.showChildView('checkboxesRegion', new CheckboxCollectionView({ collection: this.filesCheckbox }));
    this.showChildView('titleRegion', new InputView({ model: this.titleModel }));
    this.showChildView('acronymRegion', new InputView({ model: this.acronymModel }));
    this.showChildView('showAllRegion', new CheckboxView({ model: this.showAllModel }));

    if (this.showFileSubType) this.showChildView('fileSubTypeRegion', new RadioView({ model: this.fileSubTypeModel }));
  },

  templateContext() {
    return {
      Formatter,
      dispute: this.dispute,
      colourClass: statusChannel.request('get:colourclass', this.dispute.getStage(), this.dispute.getStatus()) || '',
      linkTypeDisplay: this.hearing ? this.hearing.getDisputeHearingLinkDisplay() : '-',
      isOtherDocTypeSelected: this._isOtherDocTypeSelected(),
      isShowAllSelected: this.showAllModel.getData(),
      showFileSubType: this.showFileSubType,
    };
  }
});