import Marionette from 'backbone.marionette';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import DecGenData from './DecGenData';
import { CUSTOM_MERGE_FIELDS, DecGenFormatter } from './decision-formatter/DecGenFormatter';

const GeneratedOutcomeDocSection = Marionette.View.extend({
  /**
   * @param {Object} data - An object containing data loaded from `DecGenData`
   * @param {Object} templateData - An object containing template data
   * @param {Object} generationOptions - An object containing options for the generation:
   *  Analysis & Conclusion options:
   *  - insertConversational: Insert conversational analysis and conclusion text
   *  - insertStrict: Insert strict act text in analysis, and no conclusion text
   */
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['data', 'templateData', 'generationOptions']);
    
    this.data = this.data || {};
    this.resetContextData();
    this.templateData = this.templateData || {};
  },

  wrapHtmlWithWarning(htmlString='') {
    return <span className="" style={{ backgroundColor: '#ffff00' }}>{htmlString}</span>
  },

  wrapHtmlWithError(htmlString='') {
    return <span className="" style={{ color: 'red' }}>{htmlString}</span>
  },

  convertTaggedWarningText(htmlString='') {
    // TODO: If we handle all as strings and want to do the regex replace then need to have a BG <span> as a string
    // How to merge this with existing wrap with warning functionality?
    const openTag = `<span style="background-color:#ffff00;">`;
    const closeTag = `</span>`;
    // TODO: How to avoid double-converting?? or converting to yellow when these are already?

    // Find all instances of **Field fields.  Make sure not to match ****
    htmlString = htmlString.replace(/([^*])(\*\*[^*<]+?)([\<\s\,\.\)$])/g, `$1${openTag}$2${closeTag}$3`);
    
    // Add highlight to text between **** tags
    htmlString = htmlString.replace(/\*\*\*\*(.+?)\*\*\*\*/gs, `${openTag}$1${closeTag}`);
    return htmlString;
  },

  /**
   * Applies all necessary conversions and handling of the generated data:
   * - Merge field conversions
   * - Add custom contextual merge data just for this render, which will be added before conversion and removed afterwards
   * - Add highlighting to areas defined in text (**, ****)
   * @param {Object} htmlObj
   * @param {Object} customDataToLoad
   * @param {Boolean} options.renderAsSpan
   */
  finalizeRender(htmlObj=<></>, customDataToLoad={}, options={}) {
    if (Object.keys(customDataToLoad).length) this.addToContextData(customDataToLoad);
    const html = this.convertTaggedWarningText(DecGenFormatter.applyMergeFieldConversions(renderToString(htmlObj), this.data));
    if (Object.keys(customDataToLoad).length) this.removeFromContextData(customDataToLoad);
    return options.renderAsSpan ? <span dangerouslySetInnerHTML={{ __html: html }}></span> : <div dangerouslySetInnerHTML={{ __html: html }}></div>;
  },

  addToContextData(newData={}) {
    this._addedDataKeys = [...(this._addedDataKeys||[]), ...Object.keys(newData)];
    this.data = Object.assign({}, this.data, newData);
  },

  removeFromContextData(dataToRemove={}) {
    if (typeof dataToRemove === 'string') dataToRemove = { dataToRemove: true };
    Object.keys(dataToRemove).forEach(key => {
      delete this.data[key];
      this._addedDataKeys = this._addedDataKeys.filter(k => k !== key);
    });
  },

  // Removes any added context data
  resetContextData() {
    this._addedDataKeys?.forEach(key => delete this.data[key]);
    this._addedDataKeys = [];
  },

  addCustomMergeFields(mergeFieldData={}) {
    // Make sure to not overwrite existing custom fields
    // TODO: Add better system of adding specifically custom merge fields, one that aligns with how addContextData works
    const existingMergeFields = this.data[CUSTOM_MERGE_FIELDS];
    this.addToContextData({ [CUSTOM_MERGE_FIELDS]: Object.assign({}, existingMergeFields, mergeFieldData) });
  },

  removeCustomMergeFields() {
    this.removeFromContextData(CUSTOM_MERGE_FIELDS);
  },

  renderLinkedDisputesOnUI(uiName, viewClass) {
    const toSectionData = (data={}, templateData={}) => ({ data, templateData, generationOptions: this.generationOptions });
    const sectionDataToDisplay = [];
    // When showing repeated file numbers, always enable template field "all:showSectionFileNumber"
    const tData = this.data[DecGenData.linkedDisputes]?.length ? Object.assign({}, this.templateData, { [DecGenData[`all:showSectionFileNumber`]]: true }) : this.templateData;
    sectionDataToDisplay.push(toSectionData(this.data, tData));
    if (this.data[DecGenData.linkedDisputes]?.length) {
      sectionDataToDisplay.push(...this.data[DecGenData.linkedDisputes].map(d => toSectionData(d, tData)));
    }
    sectionDataToDisplay?.forEach(sectionData => {
      this.getUI(uiName).append((new viewClass(sectionData)).render().$el);
    });
  },

});

_.extend(GeneratedOutcomeDocSection.prototype, ViewJSXMixin);
export default GeneratedOutcomeDocSection;
