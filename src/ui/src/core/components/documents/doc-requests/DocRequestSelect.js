/**
 * @fileoverview - View which wraps a Dropdown and Checkbox. Used to select a OutcomeDocGroup and OutcomeDoc to associate a DocRequest to.
 */
import Radio from 'backbone.radio';
import Marionette from 'backbone.marionette';
import React from 'react';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import DropdownView from '../../dropdown/Dropdown';
import DropdownModel from '../../dropdown/Dropdown_model';
import CheckboxesView from '../../checkbox/Checkboxes';
import CheckboxCollection from '../../checkbox/Checkbox_collection';
import CheckboxModel from '../../checkbox/Checkbox_model';
import CheckboxView from '../../checkbox/Checkbox';
import './doc-request-select.css';

const configChannel = Radio.channel('config');

const DocRequestSelect = Marionette.View.extend({
  /**
   * @param {DocRequestModel} model - The doc request model
   * @param {OutcomeDocGroupModel} docGroupCollection - All outcome doc groups (with outcome doc files) on the dispute
   * @param {Function} [getValidDocFilesFromGroupFn] - A function which recives an OutcomeDocGroupModel and returns the valid outcome doc files
   * @param {Boolean} [singleAutoSelect] - Determines whether doc groups with one doc should be selected by default
   * @param {Boolean} [autoSelectAll] - All available checkboxes will be selected, and the checkbox hidden.  If not passed in, Review requests default to autoSelectAll=true
   * @param {Boolean} [showOptOut] - Determines whether to show the opt-out feature
   */
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['docGroupCollection', 'getValidDocFilesFromGroupFn', 'singleAutoSelect', 'autoSelectAll', 'showOptOut']);

    // Unless overrides, Review requests should auto-select all
    if (!_.isBoolean(this.autoSelectAll)) this.autoSelectAll = this.model.isReview();

    this.optionData = [];
    this.checkboxOptions = {};
    this.getValidDocFilesFromGroupFn = _.isFunction(this.getValidDocFilesFromGroupFn) ? this.getValidDocFilesFromGroupFn : (docGroup) => docGroup.getOutcomeFiles();
    const affectedDocumentIds = this.model.getAffectedDocumentIds();

    this.docGroupCollection.forEach(docGroup => {
      const validOutcomeFiles = this.getValidDocFilesFromGroupFn(docGroup) || [];
      const checkboxOptions = validOutcomeFiles.map(docFile => {
        return {
          html: docFile?.config.group_title,
          checked: !!affectedDocumentIds.find(docId => docId === docFile.id),
          _docFileId: docFile.id,
          _isDecision: docFile.isDecision(),
          _isMonetaryOrder: docFile.isMonetaryOrder(),
          _isOrderOfPossession: docFile.isOrderOfPossession(),
        };
      // Don't include any doc files that aren't decisions / orders
      }).filter(obj => obj._isDecision || obj._isMonetaryOrder || obj._isOrderOfPossession);

      // If any valid outcome docs exist, then include the docs and the group in the select dropdown/checkboxes
      if (checkboxOptions.length) {
        this.checkboxOptions[docGroup.id] = checkboxOptions;
        const groupRequestTitleDisplay = docGroup.getGroupRequestTitleDisplay();
        this.optionData.push({ value: String(docGroup.id), text: groupRequestTitleDisplay });
      }
    });

    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    const isRequired = !this.model.isSubTypeOutside();
    const shouldOptOutBeSelected = !isRequired && !this.model.get('outcome_doc_group_id');
    const groupId = String(this.model.get('outcome_doc_group_id'));
    this.dropdownModel = new DropdownModel({
      optionData: this.optionData,
      labelText: 'Available documents',
      errorMessage: 'Select an available document',
      disabled: shouldOptOutBeSelected,
      defaultBlank: true,
      required: this.optionData.length > 0 && !shouldOptOutBeSelected,
      value: this.optionData.find(obj => obj.value === groupId) ? groupId : null,
      apiMapping: 'outcome_doc_group_id'
    });

    this.optOutModel = new CheckboxModel({
      html: 'Not on this file',
      required: false,
      checked: shouldOptOutBeSelected,
      apiMapping: 'request_sub_type'
    });

    this.checkboxCollection = new CheckboxCollection();
    this.setCheckboxCollection(groupId);
  },

  setupListeners() {
    this.listenTo(this.dropdownModel, 'change:value', (model, value) => {
      this.setCheckboxCollection(value);
      this.checkboxCollection.trigger('render');
    });

    this.listenTo(this.optOutModel, 'change:checked', (model, checked) => {
      this.dropdownModel.set({
        required: !checked,
        disabled: checked,
        value: null,
      });
      this.dropdownModel.trigger('render');
    });
  },

  setCheckboxCollection(groupId) {
    const checkboxesOptions = this.checkboxOptions[groupId] ? this.checkboxOptions[groupId] : [];
    this.checkboxCollection.reset(this.checkboxOptions[groupId] || []);
    if (this.singleAutoSelect && checkboxesOptions.length === 1) this.checkboxCollection.at(0).set('checked', true);
    if (this.autoSelectAll) this.checkboxCollection.forEach(m => m.set('checked', true));
  },

  validateAndShowErrors() {
    let isValid = true;
    const regionsToValidate = ['dropdownRegion', ...(this.dropdownModel.getData() ? ['checkboxesRegion'] : [])];
    regionsToValidate.forEach(regionName => {
      const view = this.getChildView(regionName);
      if (view && view.isRendered()) isValid = view.validateAndShowErrors() && isValid;
    });
    return isValid;
  },

  getPageApiDataAttrs() {
    const selectedCheckboxes = this.checkboxCollection.getData();
    const hasDecisionSelected = !!selectedCheckboxes.find(c => c.get('_isDecision'));
    const hasMonetaryOrderSelected = !!selectedCheckboxes.find(c => c.get('_isMonetaryOrder'));
    const hasOrderOfPossessionSelected = !!selectedCheckboxes.find(c => c.get('_isOrderOfPossession'));

    const configCodeToUse = (hasDecisionSelected && hasMonetaryOrderSelected && hasOrderOfPossessionSelected) ? 'OUTCOME_DOC_REQUEST_AFFECTED_DOC_DEC_MO_OP'
      : (hasMonetaryOrderSelected && hasOrderOfPossessionSelected) ? 'OUTCOME_DOC_REQUEST_AFFECTED_DOC_MO_OP'
      : (hasDecisionSelected && hasOrderOfPossessionSelected) ? 'OUTCOME_DOC_REQUEST_AFFECTED_DOC_DEC_OP'
      : (hasDecisionSelected && hasMonetaryOrderSelected) ? 'OUTCOME_DOC_REQUEST_AFFECTED_DOC_DEC_MO'
      : (hasOrderOfPossessionSelected) ? 'OUTCOME_DOC_REQUEST_AFFECTED_DOC_OOP'
      : (hasMonetaryOrderSelected) ? 'OUTCOME_DOC_REQUEST_AFFECTED_DOC_MO'
      : (hasDecisionSelected) ? 'OUTCOME_DOC_REQUEST_AFFECTED_DOC_DEC'
      : null;
    const affected_documents = configCodeToUse ? configChannel.request('get', configCodeToUse) : null;
    const affected_documents_text = selectedCheckboxes.map(c => c.get('_docFileId')).join(',');
    const request_sub_type = configChannel.request('get', this.optOutModel.getData() ? 'OUTCOME_DOC_REQUEST_SUB_TYPE_OUTSIDE' : 'OUTCOME_DOC_REQUEST_SUB_TYPE_INSIDE');
    
    return Object.assign({ affected_documents, affected_documents_text, request_sub_type }, this.dropdownModel.getPageApiDataAttrs());
  },

  onRender() {
    this.showChildView('dropdownRegion', new DropdownView({ model: this.dropdownModel }));
    this.showChildView('checkboxesRegion', new CheckboxesView({ collection: this.checkboxCollection }));

    if (this.showOptOut) this.showChildView('optOutRegion', new CheckboxView({ model: this.optOutModel }));
  },

  className: `doc-request-select`,

  regions: {
    dropdownRegion: '.doc-request-select__dropdown',
    checkboxesRegion: '.doc-request-select__checkboxes',
    optOutRegion: '.doc-request-select__opt-out'
  },

  template() {
    return (
      <>
        <div className="doc-request-select__dropdown-container">
          <div className="doc-request-select__dropdown"></div>
          <div className="doc-request-select__opt-out"></div>
        </div>
        <div className={`doc-request-select__checkboxes ${this.autoSelectAll ? 'hidden' : ''}`}></div>
      </>
    );
  },
});

_.extend(DocRequestSelect.prototype, ViewJSXMixin);
export default DocRequestSelect;