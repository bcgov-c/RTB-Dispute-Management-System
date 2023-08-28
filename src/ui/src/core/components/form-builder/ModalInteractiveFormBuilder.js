import React from 'react';
import Radio from 'backbone.radio';
import ModalBase from "../modals/ModalBase";
import Textarea from "../textarea/Textarea";
import Textarea_model from "../textarea/Textarea_model";
import { FormBuilder } from "./FormBuilder";
import { ViewJSXMixin } from "../../utilities/JsxViewMixin";
import test_form from './test_form';

const ModalInteractiveFormBuilder = ModalBase.extend({
  className: `${ModalBase.prototype.className} form-builder__interactive__modal modal-fullsize`,
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, []);

    this.hasJsonError = false;
    this.hasFormError = false;
    this.generationMode = true;
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.userEntry = new Textarea_model({
      labelText: 'Enter JSON form configuration',
      required: true,
      displayRows: 30,
      max: 999999,
      value: test_form,
    });
    this.builder = new FormBuilder({ jsonString: this.userEntry.getData() });
  },

  setupListeners() {
    this.listenTo(this.userEntry, 'change:value', () => {
      this.hasJsonError = false;
      this.hasFormError = false;
    });
  },

  regions: {
    userEntry: '.form-builder__interactive__input',
    generatedForm: '.form-builder__interactive__preview',
  },

  onRender() {
    this.showChildView('userEntry', new Textarea({ model: this.userEntry }));
    this.prepareAndRenderForm();
    this.generationMode = false;
  },

  prepareAndRenderForm() {
    if (this.hasFormError) return;

    const currentJson = this.builder.jsonString;
    
    // If the user input is not valid, use the existing json in the builder to re-render
    const json = this.hasJsonError ? currentJson : this.userEntry.getData();
    try {
      // Only re-generate and re-set the form data if Generate clicked
      if (this.generationMode) {
        this.builder.setJsonString(json);
        this.builder.parseJsonForm();
      }
      this.showChildView('generatedForm', this.builder.createFormView('Example Form Output', true, 'vertical'));
    } catch (err) {
      console.log(err);

      // Reset builder to previous value
      this.builder.setJsonString(currentJson);
      try {
        this.builder.parseJsonForm();
      } catch (err2) {
        // Any errors here are allowed to fail - preview will be blank
        console.log(err2);
      }

      this.hasFormError = true;
      this.render();
    }
  },

  formatJsonTextarea() {
    const view = this.getChildView('userEntry');
    let formattedJsonString;
    try {
      const parsedJson = JSON.parse(view.getUI('input').val());
      formattedJsonString = JSON.stringify(parsedJson, undefined, 4);
    } catch (err) {
      console.log(err);
      formattedJsonString = null;
      this.hasJsonError = true;
      this.render();
      return;
    }

    if (formattedJsonString) {
      view.getUI('input').val(formattedJsonString);
      this.userEntry.set('value', formattedJsonString, { silent: true });
    }

    setTimeout(() => this.render(), 1);
  },

  resetForm() {
    this.userEntry.set('value', test_form);
    this.render();
  },

  generateForm() {
    this.hasFormError = false;
    this.generationMode = true;
    this.prepareAndRenderForm();
  },

  downloadFormJson() {
    // Only allow downloads if formatting passes and form is valid
    // TODO: Fix returns
    this.formatJsonTextarea();
    if (this.hasJsonError || this.hasFormError) return;
    
    Radio.channel('files').request('download:file',
      new Blob([this.builder.jsonString], { type: 'application/json;charset=utf8' }),
      `FormBuilder_JsonConfiguration_${Moment().format('YYYY-MM-DD_hh:mmA')}.json`
    );
  },

  template() {
    const modalTitle = `POC: JSON Form Builder`;
    return (
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">{modalTitle}</h4>
            <div className="modal-close-icon-lg close-x"></div>
          </div>
          <div className="modal-body">
            <div className="form-builder__interactive">
              <div className="form-builder__interactive__inputs">
                {this.hasJsonError ? <div className="error-red">JSON parse error</div> : null}
                <div className="form-builder__interactive__inputs__btns">
                  <button className="" onClick={() => this.formatJsonTextarea()}>Format Json</button>
                  <button className="" onClick={() => confirm('Reset form json?') ? this.resetForm() : null}>Reset</button>
                  <button className="" onClick={() => this.generateForm()}>Generate Form</button>
                </div>
                <span className="general-link" onClick={() => this.downloadFormJson()}>Download Form Config</span>
                <div className="form-builder__interactive__input"></div>
              </div>
              <div className="form-builder__interactive__previews">
                {this.hasFormError ? <div className="error-red">Error building form</div> : null}
                <div className="form-builder__interactive__preview"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
});
_.extend(ModalInteractiveFormBuilder.prototype, ViewJSXMixin);

export default ModalInteractiveFormBuilder;