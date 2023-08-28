import React from 'react';
import Marionette from 'backbone.marionette';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import RadioView from '../../../core/components/radio/Radio';
import RadioModel from '../../../core/components/radio/Radio_model';

const CONVERSATIONAL_LANGUAGE_RADIO_CODE = 1;
const ACT_LANGUAGE_RADIO_CODE = 2;
const BLANK_LANGUAGE_RADIO_CODE = 3;

const GeneratedDocOptionOneView = Marionette.View.extend({ 
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['selectedGenerationOptionsCode']);
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.decisionPopulationTypeModel = new RadioModel({
      optionData: [
        { text: 'Conversational analysis and populated conclusion text', value: CONVERSATIONAL_LANGUAGE_RADIO_CODE },
        { text: 'Act language only in analysis, no conclusion text', value: ACT_LANGUAGE_RADIO_CODE },
        { text: 'Blank analysis and conclusion', value: BLANK_LANGUAGE_RADIO_CODE },
      ],
      valuesToDisable: [ACT_LANGUAGE_RADIO_CODE, BLANK_LANGUAGE_RADIO_CODE],
      defaultBlank: false,
      required: true,
      value: this.selectedGenerationOptionsCode || CONVERSATIONAL_LANGUAGE_RADIO_CODE
    });
  },

  setupListeners() {
    this.listenTo(this.decisionPopulationTypeModel, 'change:value', (m, value) => this.model.trigger('select:generationOptions', value));
  },

  getSelectedGenerationOptions() {    
    return {
      insertConversational: this.decisionPopulationTypeModel.getData() === CONVERSATIONAL_LANGUAGE_RADIO_CODE,
      insertStrict: this.decisionPopulationTypeModel.getData() === ACT_LANGUAGE_RADIO_CODE
    };
  },

  onRender() {
    this.showChildView('decisionPopulationRegion', new RadioView({ model: this.decisionPopulationTypeModel }));
  },

  regions: {
    decisionPopulationRegion: '.doc-option-one__issue-options'
  },

  template() {
    return (
      <>
        <p>
          Below is a preview of the generated decision. You should review the preview below and validate that the sections being populated by DMS data are correct.
          You can generate a decision without DMS data populating the section - just download the decision and delete the red warning text from the generated document.
          You may then write the associated section manually.
        </p>
        {/*
          * Hide strict act and blank act selection for DecGen participatory release
        <p>
          The decision can have the analysis and conclusion section populated in three ways. Choose the option below that you would like to use to populate the decision. You
          can change your selections and then view the analysis and conclusion sections in the preview to validate your selection.
        </p>
        */}
        <div className="doc-option-one__issue-options" style={{ visibility: 'hidden', marginBottom: 0 }}></div>
      </>
    )
  }
});

_.extend(GeneratedDocOptionOneView.prototype, ViewJSXMixin);
export default GeneratedDocOptionOneView;