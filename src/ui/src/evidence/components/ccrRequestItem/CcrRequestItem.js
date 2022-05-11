import Radio from 'backbone.radio';
import Marionette from 'backbone.marionette';
import React from 'react';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import TextareaView from '../../../core/components/textarea/Textarea';
import TextareaModel from '../../../core/components/textarea/Textarea_model';
import DocRequestItemModel from '../../../core/components/documents/doc-requests/DocRequestItem_model';
import Question_model from '../../../core/components/question/Question_model';
import DisputeEvidence_model from '../../../core/components/claim/DisputeEvidence_model';
import UploadMixin_model from '../../../core/components/upload/UploadMixin_model';
import UploadEvidenceView from '../../pages/upload/UploadEvidence';
import PageItem from '../../../core/components/page/PageItem';
import Question from '../../../core/components/question/Question';
import { ParentViewMixin } from '../../../core/utilities/ParentViewMixin';
import './CcrRequestItem.scss';

const configChannel = Radio.channel('config');
const modalChannel = Radio.channel('modals');

/**
 * 
 * @param {Backbone.Model} model - the main application model
 * @param {docRequestItemModel} docRequestItemModel - docRequestItemModel, can also pass in a single itemModel that is part of a DocRequestModel
 * @param {disputeEvidenceModel} disputeEvidenceModel - disputeEvidenceModel can be passed in to pre populate the file upload 
 * @param {Number} itemType - associated with the item_type field in docrequestitem model
 * @param {String} itemCssClass - css class applied to item
 * @param {Boolean} enableQuestion - display the component in question mode, where Yes must be selected before description/evidence appear
 * @param {Boolean} enableEvidence - display evidence upload
 
 * Question options
 * @param {String} questionModel - used to pre populate the question model
 * @param {String} questionLabel - label text displayed for the question
 * @param {String} questionHelp - help html for the question

 * Description / Textarea options
 * @param {String} descriptionLabel - label text displayed above the description text area
 * @param {String} descriptionHelp - help html for the textarea
 * @param {Number} descriptionMax - max character count allowed in textarea
 * @param {Number} descriptionMin - min character count allowed in textarea
 * 
 * Evidence / File Upload options
 * @param {String} evidenceTitle - the title of the created file description evidence
 * @param {String} evidenceHelp - help html for the evidence
 * @param {Boolean} evidenceRequired - whether or not the evidence upload is required.  Note: Evidence will never be required when enableQuestion=true and question answer = No
 
 * @param {Boolean} isUpload - Controls whether the the UI should render in upload mode
 * 
 **/

const CcrRequestItem = Marionette.View.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, [
      'docRequestItemModel', 
      'itemType',
      'itemCssClass',
      'enableQuestion', 
      'enableEvidence',
      'questionModel',
      'questionLabel',
      'questionHelp',

      'descriptionModel',
      'descriptionLabel',
      'descriptionHelp',
      'descriptionMax',
      'descriptionMin',
      
      'disputeEvidenceModel',
      'evidenceTitle',
      'evidenceHelp',
      'evidenceRequired',

      'uploadModel',

      'isUpload',
    ]);

    this.itemCssClass = this.itemCssClass || '';
    
    this.docRequestItemModel = this.docRequestItemModel || new DocRequestItemModel();

    this.docRequestItemModel.set({ item_type: this.itemType });
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.uploadModel = this.uploadModel || new UploadMixin_model();
    this.questionModel = new Question_model({
      optionData: [{ name: `form-${this.cid}-no`, value: 0, cssClass: 'option-button dac__yes-no', text: 'NO'},
          { name: `form-${this.cid}-yes`, value: 1, cssClass: 'option-button dac__yes-no', text: 'YES'}],
      beforeClick: (model, value) => this.showChangeAnswerModalPromise(model, value),
      required: this.enableQuestion,
      question_answer: this.questionModel ? this.questionModel.getData() : null,
    });

    this.descriptionModel = this.descriptionModel || new TextareaModel({
      errorMessage: this.errorMessage || 'Description is required',
      max: this.descriptionMax || 500,
      min: this.descriptionMin || 20,
      countdown: true,
      required: !this.enableQuestion,
      value: null || this.docRequestItemModel.get('item_description'),
      apiMapping: 'item_description'
    });

    this.disputeEvidenceModel = this.disputeEvidenceModel || new DisputeEvidence_model({
      title: this.evidenceTitle,
      helpHtml: this.evidenceHelp,
      required: true,
      category: configChannel.request('get', 'EVIDENCE_CATEGORY_OUTCOME_DOC_REQUEST'),
    });
    this.disputeEvidenceModel.get('descriptionModel').set({ required: false });
  },

  setupListeners() {
    this.listenTo(this.descriptionModel, 'change:value', () => {
      this.docRequestItemModel.set(this.descriptionModel.getPageApiDataAttrs());
    });
    this.listenTo(this.docRequestItemModel, 'validate:view', this.validateAndShowErrors);
    
    if (this.enableEvidence) {
      this.listenTo(this.uploadModel, 'file:added', () => {
        this.clearFilesErrorMessage();
      });
    }

    if (this.enableQuestion) {
      this.listenTo(this.questionModel, 'change:question_answer', (model, question_answer) => {
        this.descriptionModel.set({ required: !!question_answer });
        
        // Update view states
        ['descriptionRegion', 'evidenceRegion'].forEach(regionName => {
          this.triggerOnChild(regionName, question_answer ? 'show' : 'hide');
        });
        this.clearFilesErrorMessage();
      });
    }
  },

  showFilesErrorMessage() {
    this.getUI('error').removeClass('hidden');
  },

  clearFilesErrorMessage() {
    this.getUI('error').addClass('hidden');
  },

  validateAndShowErrors() {
    this.clearFilesErrorMessage();

    if ((this.questionModel.getData() || !this.enableQuestion ) && this.evidenceRequired && this.disputeEvidenceModel.get('files').length < 1) {
      this.showFilesErrorMessage();
    }

    const pageItemsToValidate = [
      ...(this.enableQuestion ? ['questionRegion'] : []),
      'descriptionRegion',
      ...(this.enableEvidence ? ['evidenceRegion'] : []),
    ];
    let isValid = true;
    (pageItemsToValidate || []).forEach(pageItemName => {
      const view = this.getChildView(pageItemName);
      if (view) isValid = view.callMethodOnSubView('validateAndShowErrors') && isValid;
    });

    return isValid;
  },

  getData() {
    return {
      disputeEvidenceModel: this.disputeEvidenceModel,
      docRequestItemModel: this.docRequestItemModel,
      questionModel: this.questionModel,
      onUploadComplete: this.onUploadComplete,
      descriptionModel: this.descriptionModel,
    };
  },

  // To be called by any parent when file uploads are complete.  Saves the saved file description id into the cc request
  onUploadComplete() {
    const fileDescription = this.disputeEvidenceModel.get('file_description');
    const fileDescriptionId = fileDescription && fileDescription.id;

    if (fileDescriptionId) this.docRequestItemModel.set({ file_description_id: fileDescriptionId });
  },

  getProcessingOptions() {
    const processingOptionsForDuplicates = {
      customFileValidationErrorMsg: (fileObj) => `File ${fileObj.name || ''} has already been selected to be uploaded`,
      customFileValidationFn: ((fileObj) => {
        const fileObjSize = _.isNumber(fileObj.size) ? fileObj.size : 0;
        const fileComparisonFn = (fileModel) => {
          if (!fileModel) return false;
          return fileModel.get('original_file_name') === fileObj.name && fileModel.get('file_size') === fileObjSize;
        };
        const matchingFileObj = _.find(this.uploadModel.getPendingUploads(), disputeEvidenceModel => {
          const files = disputeEvidenceModel.get('files');
          return files && files.find(fileComparisonFn);
        });
        return !matchingFileObj;
      }).bind(this)
    };

    return processingOptionsForDuplicates;
  },

  onRender() {
    const onlyShowQuestion = this.enableQuestion && !this.questionModel.getData();
    
    if (this.enableEvidence) {
      this.showChildView('evidenceRegion', new PageItem({
        stepText: null,
        helpHtml: null,
        subView: new UploadEvidenceView({
          uploadModel: this.uploadModel,
          model: this.disputeEvidenceModel,
          showDelete: false,
          mode: this.isUpload ? 'upload' : null,
          hideDescription: true,
          required: true,
          fileType: configChannel.request('get', 'FILE_TYPE_USER_EXTERNAL_NON_EVIDENCE'),
          processing_options: this.getProcessingOptions(),
        }),
        stepComplete: true,
        forceVisible: !onlyShowQuestion
      }));
    }

    if (this.isUpload) return;

    if (this.enableQuestion) {
      this.showChildView('questionRegion', new PageItem({
        stepText: this.questionLabel,
        helpHtml: this.questionHelp,
        subView: new Question({ model: this.questionModel }),
        stepComplete: this.questionModel.getData(),
        forceVisible: true
      }));
    }

    this.showChildView('descriptionRegion', new PageItem({
      stepText: this.descriptionLabel,
      helpHtml: this.descriptionHelp,
      subView: new TextareaView({ model: this.descriptionModel }),
      stepComplete: true,
      forceVisible: !onlyShowQuestion
    }));
  },

  showChangeAnswerModalPromise(model, value) {
    let confirmed = false;
    return (new Promise((res, rej) => {
      const hasData = this.disputeEvidenceModel.get('files').length > 0 || this.descriptionModel.getData();

      if (!hasData || value !== 0) return res(true);
      const modalView = modalChannel.request('show:standard', {
        title: `Change Answer?`,
        bodyHtml: `<p>Are you sure that you want to change the current answer to No?  Changing this answer will clear any information that you provided.  This action cannot be undone.</p>`,
        onContinueFn: (_modalView) => {
          confirmed = true;
          _modalView.close();
        },
      });

      this.listenToOnce(modalView, 'removed:modal', () => {
        if (confirmed) res(true);
        else rej();
      });
    })).then(result => {
      if (result && confirmed) {
        // Clear any added data
        this.uploadModel.removePendingUpload(this.disputeEvidenceModel);
        if (this.enableEvidence) this.disputeEvidenceModel.trigger('render');

        this.descriptionModel.set('value', null);
        this.descriptionModel.trigger('render');
      }
      return Promise.resolve(true);
    });
  },

  className: 'request-item',

  regions: {
    questionRegion: '.request-item__question',
    descriptionRegion: '.request-item__description',
    evidenceRegion: '.request-item__evidence',
  },

  ui: {
    error: '.request-item__evidence__error'
  },

  template() {
    return (
      <>
        {!this.isUpload ? <>
          {this.enableQuestion ? <div className="request-item__question"></div> : null}
          <div className="request-item__description"></div>
        </> : null}

        {this.renderJsxEvidence()}
      </>
    );
  },

  renderJsxEvidence() {
    const NO_FILES_ERROR = `Add at least one file to continue`;
    if (!this.enableEvidence) return;

    return (<>
      <div className={`request-item__evidence ${this.itemCssClass}`}></div>
      {!this.isUpload ? <p className={`request-item__evidence__error error-block hidden`}>{NO_FILES_ERROR}</p> : null}
    </>);
  }
});

_.extend(CcrRequestItem.prototype, ViewJSXMixin, ParentViewMixin);
export { CcrRequestItem };
