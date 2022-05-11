import Radio from 'backbone.radio';
import Marionette from 'backbone.marionette';
import React from 'react';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import EditableComponent from '../../../../core/components/editable-component/EditableComponent';
import FileBlockDisplay from '../../common-files/FileBlockDisplay';
import FileCollection from '../../../../core/components/files/File_collection';
import TextareaView from '../../../../core/components/textarea/Textarea';
import TextareaModel from '../../../../core/components/textarea/Textarea_model';
import ViewMixin from '../../../../core/utilities/ViewMixin';

const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');

const DisputeDocRequestItemView = Marionette.View.extend({
  /**
   * @param {DocRequestItemModel} model
   * @param {Boolean} statusRequiredInitialVal - Whether the status dropdow should be required on initialize
   * @param {Boolean} showThumbnails - True if thumbails should be shown
   */
  initialize(options) {
    this.template = this.template.bind(this);

    this.mergeOptions(options, ['statusRequiredInitialVal', 'showThumbnails', 'isDisabledOnLoad']);

    this.grantedCode = String(configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_STATUS_GRANTED') || '');
    this.dismissedCode = String(configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_STATUS_DISMISSED') || '');
    
    this.createSubModels();
    this.editGroup = ['statusRegion', 'noteRegion'];

    this.setupListeners();
  },


  createSubModels() {
    this.statusModel = new DropdownModel({
      optionData: [{ value: this.grantedCode, text: 'Granted' },
        { value: this.dismissedCode, text: 'Dismissed' }
      ],
      labelText: 'Request Item Status',
      defaultBlank: true,
      errorMessage: 'Please provide item status',
      disabled: this.isDisabledOnLoad,
      required: !!this.statusRequiredInitialVal,
      value: this.model.get('item_status') ? String(this.model.get('item_status')) : null,
      apiMapping: 'item_status'
    });

    this.noteModel = new TextareaModel({
      labelText: 'Internal Processing Note',
      required: false,
      min: 5,
      max: 500,
      value: this.model.get('item_note'),
      apiMapping: 'item_note'
    });
  },

  setupListeners() {
    this.listenTo(this.model, 'ui:status:set', (reqStatus) => {
      this.statusModel.set('value', reqStatus ? String(reqStatus) : reqStatus);
      this.statusModel.trigger('render');
    });
    this.listenTo(this.model, 'ui:status:required', (required) => {
      this.statusModel.set({ required });
      this.statusModel.trigger('render');
    });

    this.listenTo(this.model, 'ui:disabled:set', (disabled) => {
      this.statusModel.set({ disabled });
      this.statusModel.trigger('render');
    })
  },

  validateAndShowErrors() {
    let isValid = true;
    this.editGroup.forEach(regionName => {
      const view = this.getChildView(regionName);
      if (view) isValid = view.validateAndShowErrors() && isValid;
    });
    return isValid;
  },

  toEditable() {
    this.editGroup.forEach(regionName => {
      const view = this.getChildView(regionName);
      if (view) view.toEditable();
    });
  },

  saveInternalDataToModel() {
    this.model.set(Object.assign(
      this.statusModel.getPageApiDataAttrs(),
      this.noteModel.getPageApiDataAttrs()
    ));
  },

  onBeforeRender() {
    const itemStatus = this.model.get('item_status') ? String(this.model.get('item_status')) : null;
    this.statusDisplayHtml = itemStatus === this.grantedCode ? `<span class="success-green">Granted</span>`
      : itemStatus === this.dismissedCode ? `<span class="error-red">Dismissed</span>`
      : null;
  },

  onRender() {
    this.showChildView('statusRegion', new EditableComponent({
      state: 'view',
      label: 'Status',
      view_value: this.statusDisplayHtml || 'Not Set',
      subView: new DropdownView({ model: this.statusModel })
    }));

    this.showChildView('noteRegion', new EditableComponent({
      state: 'view',
      label: 'Internal Note',
      view_value: this.model.get('item_note') || '-',
      subView: new TextareaView({ model: this.noteModel })
    }));

    const uploadedFileModels = this.model.getUploadedFiles();
    if (uploadedFileModels.length) {
      this.showChildView('associatedDocumentsRegion', new FileBlockDisplay({
        collection: new FileCollection(uploadedFileModels),
        showThumbnails: this.showThumbnails,
      }));
    }

    ViewMixin.prototype.initializeHelp(this, this.model.getTypeHelpHtml());
  },

  regions: {
    statusRegion: '.doc-request-item__status',
    associatedDocumentsRegion: '.doc-request-item__docs',
    noteRegion: '.doc-request-item__note',
  },

  className: 'doc-request-item',

  template() {
    const hasUploadedFiles = (this.model.getUploadedFiles() || []).length;
    return (
      <>
        <div className="doc-request-item__left">
          <div className="doc-request-item__status"></div>
          <div className="doc-request-item__status-display">
            {`${Formatter.toUserDisplay(this.model.get('modified_by'))} - ${Formatter.toDateDisplay(this.model.get('modified_date'))}`}
          </div>
        </div>
        <div className="doc-request-item__right help-target">
          <div className="doc-request__labelval">
            <label><a role="button" className="badge help-icon">?</a>{this.model.getTypeDisplay()}:</label>&nbsp;<span>{this.model.get('item_description') || '-'}</span>
          </div>
          <div className="doc-request-item__note"></div>

          <div className="doc-request__labelval">
            <label className={`${hasUploadedFiles ? 'has-files ' : ''}doc-request__docs-label`} >Associated Document(s):</label>&nbsp;{hasUploadedFiles ? <span className="doc-request-item__docs"></span> : <span>&nbsp;-</span>}
          </div>
        </div>
      </>
    );
  },
  
});

_.extend(DisputeDocRequestItemView.prototype, ViewJSXMixin);
export default DisputeDocRequestItemView;
