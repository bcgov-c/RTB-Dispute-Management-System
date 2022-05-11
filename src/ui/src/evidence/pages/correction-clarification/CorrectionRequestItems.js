import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import AddIcon from '../../../core/static/Icon_AddBlue.png';
import DeleteIcon from '../../static/Icon_AdminPage_Delete.png';
import DocRequestItemModel from '../../../core/components/documents/doc-requests/DocRequestItem_model';
import TextareaView from '../../../core/components/textarea/Textarea';
import TextareaModel from '../../../core/components/textarea/Textarea_model';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import './CorrectionClarificationPage.scss';

const DEFAULT_DA_CORRECTION_MAX_ITEMS = 6;
const descriptionLabels = {
  default: `Please describe the detail of the request such as: the error(s) that occurred, the corresponding page numbers and what the correction should be`,
  1: `Please describe the detail of the request such as: the error(s) that occurred, the corresponding page numbers and what the corrected text should be`,
  2: `Please describe the detail of the request such as: the error(s) that occurred, the corresponding page number(s) and what the corrected calculation should be`,
  3: `Please describe the detail of the request such as: the obvious error(s) that occurred, the corresponding page number(s) and what the correction should be`,
  4: `Please describe the detail of the request such as: the omission(s) that occurred, the corresponding page number(s) and what the correction should be`,
};

const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');

const EmptyFileView = Marionette.View.extend({
  template: _.template(`<div class="standard-list-empty">No Files added</div>`)
});

const listItemClass = Marionette.View.extend({
  
  initialize(options) {
    this.mergeOptions(options, ['index', 'collection']);
    this.index++;//increment index from 0;
    this.template = this.template.bind(this);
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.dropdownModel = new DropdownModel({
      optionData: this.getCorrectionTypes(),
      labelText: "Type of correction",
      required: true,
      defaultBlank: true,
      value: this.model.get('item_type') ? String(this.model.get('item_type')) : null,
      apiMapping: 'item_type'
    });

    this.textareaModel = new TextareaModel({
      labelText: this.getDescriptionLabelFromSelection(),
      errorMessage: 'Description is required',
      max: 500,
      min: 20,
      countdown: true,
      required: true,
      value: this.model.get('item_description') || null,
      apiMapping: 'item_description'
    });
  },

  setupListeners() {
    this.listenTo(this.dropdownModel, 'change:value', this.handleDropdownChange);
    this.listenTo(this.textareaModel, 'change:value', this.handleDescriptionChange);
    this.listenTo(this.model, 'validate:view', this.validateAndShowErrors);
  },

  getCorrectionTypes() {
    const typeDisplay = configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_TYPE_DISPLAY') || {};
    const corrTypes = configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_TYPES_CORRECTION') || [];
    return corrTypes.map(corrType => ({ value: String(corrType), text: typeDisplay[corrType]  }));
  },

  getDescriptionLabelFromSelection() {
    const selectedCorrectionType = this.model.get('item_type');
    return _.has(descriptionLabels, selectedCorrectionType) ? descriptionLabels[selectedCorrectionType] : descriptionLabels.default;
  },

  validateAndShowErrors() {
    const regionsToValidate = ['dropdownRegion', 'descriptionRegion'];

    let isValid = true;
    (regionsToValidate || []).forEach(regionName => {
      const view = this.getChildView(regionName);
      if (view) {
        isValid = view.validateAndShowErrors() && isValid;
      }
    });

    return isValid;
  },

  regions: {
    dropdownRegion: '.ccr__add-container__type-dropdown',
    descriptionRegion: '.ccr__add-container__type-description'
  },

  deleteItem() {
    this.model.trigger('click:delete', this.model);
  },

  handleDropdownChange() {
    this.model.set(this.dropdownModel.getPageApiDataAttrs());

    this.textareaModel.set('labelText', this.getDescriptionLabelFromSelection());
    this.textareaModel.trigger('render');
  },

  handleDescriptionChange() {
    this.model.set(this.textareaModel.getPageApiDataAttrs());
  },

  template() {
    return (
      <div className="ccr__add-container">
        <div className="ccr__add-container__title">
          <div className="ccr__add-container__title__text">{`Correction: ${Formatter.toLeftPad(this.index)}`}</div>
          {this.collection.length > 1 ? <img className="ccr__add-container__title__icon" src={DeleteIcon} onClick={() => this.deleteItem()}/> : null}
        </div>
        <div className="ccr__add-container__body">
          <div className="ccr__add-container__type-dropdown" onChange={() => this.handleDropdownChange()}></div>
          <div className="ccr__add-container__type-description" onChange={() => this.handleDescriptionChange()}></div>
        </div>
      </div>
    );
  },

  onRender() {
    this.showChildView('dropdownRegion', new DropdownView({ model: this.dropdownModel }));
    this.showChildView('descriptionRegion', new TextareaView({ model: this.textareaModel }));
  }
});
_.extend(listItemClass.prototype, ViewJSXMixin);

const collectionView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: listItemClass,
  emptyView: EmptyFileView,

  childViewOptions(model, index) {
    return {
      collection: this.collection,
      index
    }
  }
});

const CorrectionRequestItems = Marionette.View.extend({
  regions: {
    listRegion: '.ccr__add-list'
  },

  initialize(options) {
    this.options = options || {};
    this.template = this.template.bind(this);
    this.DA_CORRECTION_MAX_ITEMS = configChannel.request('get', 'DA_CORRECTION_MAX_ITEMS') || DEFAULT_DA_CORRECTION_MAX_ITEMS;
    this.listenTo(this.collection, 'click:delete', this.deleteCorrectionItem, this);
  },

  addCorrection() {
    const docRequestItem = new DocRequestItemModel({});
    this.collection.add(docRequestItem);
    this.render();
  },

  deleteCorrectionItem(model) {
    this.collection.remove(model);
    model.destroy();
    this.render();
  },

  template() {
    return (
      <>
        <div className="ccr__add-list"></div>
        {this.collection.length < this.DA_CORRECTION_MAX_ITEMS ?
        <div className="ccr__add" onClick={()=>{ this.addCorrection() }}>
          <img className="ccr__add__image" src={AddIcon} />
          <span>Add another correction</span>
        </div>
        : null }
      </>
    )
  },

  onRender() {
    this.showChildView('listRegion', new collectionView(this.options));
  }
});

_.extend(CorrectionRequestItems.prototype, ViewJSXMixin);
export { CorrectionRequestItems }