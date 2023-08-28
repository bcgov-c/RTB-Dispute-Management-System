import React from 'react';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import { ViewJSXMixin } from '../../utilities/JsxViewMixin';

const FORM_LAYOUT_HORIZONTAL = 'horizontal';

const FormView = Marionette.View.extend({
  tagName: 'div',
  className() {
    return `form-builder__form ${this.getOption('formLayout') === FORM_LAYOUT_HORIZONTAL ? FORM_LAYOUT_HORIZONTAL : ''}`;
  },
  
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['formTitle', 'formSteps', 'submitButton', 'formLayout']);
  },

  submitForm() {
    if (!this.validateAndShowErrors()) return false;
    const returnJson = JSON.stringify({
      formSteps: this.getData()
    }, null, 4);

    Radio.channel('files').request('download:file',
      new Blob([returnJson], { type: 'application/json;charset=utf8' }),
      `FormBuilder_JsonResponse_${Moment().format('YYYY-MM-DD_hh:mmA')}.json`
    );
  },

  getData() {
    // TODO: Should this call trigger validation first?
    const formResponses = this.formSteps.map(formStep => formStep.toFormResponse());
    return formResponses.map(stepResponse => stepResponse.toJSON());
  },

  validateAndShowErrors() {
    let isValid = true;
    this.formSteps.forEach(formStep => {
      isValid = formStep.dmsRenderedView.validateAndShowErrors() && isValid;
    });
    return isValid;
  },

  ui: {
    steps: '.form-builder__form__steps',
  },

  onRender() {
    // Create the form steps inside onRender() so that events stay attached to them
    // Render form steps
    this.formSteps.forEach(formStep => {
      const view = formStep.createStepView();
      // Propagate any enter key presses detected in inputs to the form
      this.listenTo(view, 'input:enter', () => {
        this.trigger('input:enter', ...arguments);
      });

      // Render and mount the view into the DOM. Events on the view will work normally
      this.getUI('steps').append(view.render().$el);
    });
  },

  template() {
    return <>
      {this.formTitle ? <h3 className="">{this.formTitle}</h3> : null}
      <div className="form-builder__form__steps"></div>
      {this.submitButton ? <button className="form-builder__form__submit btn btn-lg btn-standard" onClick={() => this.submitForm()}>Submit</button> : null}
    </>;
  },

});
_.extend(FormView.prototype, ViewJSXMixin);

export default FormView;