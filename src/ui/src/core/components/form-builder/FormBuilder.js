// DMS-7778 Polls framework

// Step1. Create Domain-Specific-Language (DSL) for form elements and form responses in JSON.  This can be expanded on, but should start with core required items
// Step2. Create a parser from JSON to create some basic elements: (Input, Radio, Textarea, Checkbox, see ticket)
// Step3. Add form submission logic (required elements, max/min length etc) to form, and some sort of post-submission state
// Step4. Add an interactive builder for the form

// JSON Form configuration: a list of FormItems
/*
FormItem:
name: unique identifier for the FormItem. Will be used in the form response
stepText: the main text to use for form question - displayed above the input forms
help: adds popout help
optionData: list of { text, value } pairs to drive checkboxes, radios and any inputs with multiple selections
value: defines a pre-filled value in the form
labelText: label for the input
type: required input type:
-- string
-- date
-- currency
-- textarea
-- dropdown
-- checkbox
-- radio
-- nestedForm

---- NEW speciality inputs -----
-some input types work like others, but have some special fields to auto-fill values etc-
-- staffDropdown
- filterRoleGroup
- filterRoleSubGroup


-form validation fields:
required: a boolean to indicate whether the field can be left blank or must be filled by the user for a valid submission
min: the minimum number that user must provide on the input (min characters on text field, or min selections on checkboxes, etc)
max: the maximum number that user must provide on the input (max characters on text field, or max selections on checkboxes, etc)


// Form Responses are returned in the same order as the questions that were answered
FormResponse:
name: the identifier of the FormItem this is a response to
value: the provided user value from the field
*/

import React from 'react';
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import Textarea_model from '../textarea/Textarea_model';
import Textarea from '../textarea/Textarea';
import PageItemView from '../page/PageItem';
import Input from '../input/Input';
import Input_model from '../input/Input_model';
import Radio_model from '../radio/Radio_model';
import RadioView from '../radio/Radio';
import Dropdown from '../dropdown/Dropdown';
import Dropdown_model from '../dropdown/Dropdown_model';
import Checkbox_collection from '../checkbox/Checkbox_collection';
import Checkboxes from '../checkbox/Checkboxes';
import Address from '../address/Address';
import Address_model from '../address/Address_model';
import FormView from './FormBuilderForm';
import { SYSTEM_USER_NAMES } from '../user/UserManager';
import './FormBuilder.scss';
import UtilityMixin from '../../utilities/UtilityMixin';

// TODO: Should data loading happen automatically here, or should we have some sort of separate data provider layer for getting form data??
const userChannel = Radio.channel('users');

const EmptyFormView = Marionette.View.extend({
  template: _.noop,
  validateAndShowErrors() { return true; }
});
const EmptyFormModel = Backbone.Model.extend({
  getData() { return this.get('value'); }
});

const NestedFormView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: Marionette.View.extend({ template: _.noop }),
  onRender() {
    this.children = [];
    this.collection.forEach(model => {
      // TODO: Is there a better approach to use the marionette collection views in a more standard way?
      const view = model.get('formStep').createView();
      this.children.push(view);
      this.$el.append(view.render().$el);
    });
  },
  validateAndShowErrors() {
    let isValid = true;
    this.children?.forEach(childView => {
      if (childView && typeof childView.validateAndShowErrors !== "function") {
        return console.log(`[Warning] No validation function defined for child view`, childView);
      }
      isValid = childView.validateAndShowErrors() && isValid;
    });
    return isValid;
  },
});

const NestedFormCollection = Backbone.Collection.extend({
  getData() {
    return this.map(model => model.getData());
  },
  model: Backbone.Model.extend({
    defaults: { formStep: null },
    getData() {
      return new Backbone.Model({ name: this.get('formStep').getFormStepData() });
    }
  })
});

class FormStepResponse {
  constructor(name, value) {
    this.name = name;
    this.value = this.process(value);
  }

  process(value) {
    // Cast null values as empty strings to allow sending empty/optional parameters for the reports, ensure numbers are not passed as strings
    return value === null ? '' : 
      UtilityMixin.util_isNumeric(value) ? Number(value) : value;
  }

  toJSON() {
    return { name: this.name, value: this.value };
  }
};

class FormStep {
  constructor(formStepData={}, dmsModel=null, dmsViewClass=null, _dmsModelIsCollection=false) {
    // TODO: How to list required names better?
    if ([formStepData?.name, formStepData?.type].some(v => v === null || v === undefined) ||
      // TODO: Need to improve handling of field required-ness
      (['radio', 'dropdown', 'checkbox'].includes(formStepData?.type) && !formStepData?.optionData?.length)) {
      throw new Error(`FormValidationError: FormStep "${name||'INVALID_NAME'}" is missing required fields`);
    }
    this.data = formStepData || {};
    this.dmsModel = dmsModel;
    this.dmsViewClass = dmsViewClass;
    this._dmsModelIsCollection = _dmsModelIsCollection;
    this.dmsRenderedView;
  }

  createView() {
    const viewOptions = { [this._dmsModelIsCollection ? 'collection' : 'model']: this.dmsModel };
    const view = new this.dmsViewClass(viewOptions);
    // Cache the rendered view
    this.dmsRenderedView = view;
    return view;
  }

  createStepView() {
    const viewOptions = { [this._dmsModelIsCollection ? 'collection' : 'model']: this.dmsModel };
    // Only add 
    const view = new PageItemView({
      forceVisible: true,
      stepText: this.data?.stepText,
      helpHtml: this.data?.stepText ? this.data?.help : null,
      subView: new this.dmsViewClass(viewOptions),
      // Always pass input type information to the class for default form styling
      extraCssClasses: `form-builder__step--${this.data?.type || 'default'}`
    });
    // Cache the rendered view
    this.dmsRenderedView = view;
    return view;
  }

  getFormStepData() {
    const options = this.data?.type === 'date' ? { format: 'date' } : null;
    let userValue = this.dmsModel?.getData(options);
    if (this._dmsModelIsCollection && userValue.length) {
      // TODO: Very unlikely this is consistent across all Collections we might use
      userValue = userValue.map(model => model.get('name'));
    }
    
    // By default, always concatenate as strings any values in nested strings, with whitespace separator " "
    if (this.data?.type === 'nestedForm') {
      userValue = userValue?.join?.(' ');
    }
    return userValue;
  }

  toFormResponse() {
    return new FormStepResponse(this.data.name, this.getFormStepData());
  }
};

const FormBuilder = Marionette.Object.extend({
  initialize(options) {
    this.mergeOptions(options, ['jsonString']);
    this.formSteps = [];
    this.parseJsonForm();
    this._renderedFormView = null;
  },

  setJsonString(jsonString) {
    this.jsonString = jsonString;
    this.formSteps = [];
  },

  parseJsonForm() {
    let parsedJson;
    try {
      parsedJson = JSON.parse(this.jsonString)
      
      if (!parsedJson?.formSteps?.length) throw new Error(`FormValidationError: No questions defined on the form`);

      parsedJson.formSteps?.forEach(formStepData => {
        const formStep = this.createFormStep(formStepData);
        this.formSteps.push(formStep);
      });

    } catch (err) {
      // TODO: Return false, in order to hook this into external validation?
      console.log(err);
      throw new Error(`FormValidationError: ${err}`);
    }
  },

  getFormStep(formStepName) {
    return this.formSteps.find(step => step.name === formStepName);
  },

  createFormStep(formStepData={}) {
    const defaultFormStepData = {
      name: formStepData.name,
      value: formStepData.value,
      optionData: formStepData.optionData,
      labelText: formStepData.labelText, // Always hide the input labels for forms by default
      required: formStepData.required,
      helpHtml: formStepData.stepText ? null : formStepData.help // If a "step" is provided, help will go there instead
    };
    let dmsModel, dmsViewClass, isCollection;
    
    if (formStepData.type === 'hiddenConstant') {
      dmsViewClass = EmptyFormView;
      dmsModel = new EmptyFormModel(Object.assign({}, defaultFormStepData));
    } else if (formStepData.type === 'text') {
      dmsViewClass = Input;
      dmsModel = new Input_model(Object.assign({}, defaultFormStepData, {
        inputType: 'string',
        minLength: formStepData.min,
        maxLength: formStepData.max,
      }));
    } else if (formStepData.type === 'date') {
      dmsViewClass = Input;
      dmsModel = new Input_model(Object.assign({}, defaultFormStepData, {
        inputType: 'date',
        allowFutureDate: true,
        minDate: formStepData.min,
        maxDate: formStepData.max,
      }));
    } else if (formStepData.type === 'time') {
      dmsViewClass = Input;
      dmsModel = new Input_model(Object.assign({}, defaultFormStepData, {
        inputType: 'time',
        minTime: formStepData.min,
        maxTime: formStepData.max,
      }));
    } else if (formStepData.type === 'positive_integer') {
      dmsViewClass = Input;
      dmsModel = new Input_model(Object.assign({}, defaultFormStepData, {
        inputType: 'positive_integer',
        minNum: formStepData.min,
        maxNum: formStepData.max,
      }));
    } else if (formStepData.type === 'currency') {
        dmsViewClass = Input;
        dmsModel = new Input_model(Object.assign({}, defaultFormStepData, {
          inputType: 'currency',
          allowZeroAmount: true,
        }));
    } else if (formStepData.type === 'textarea') {
      dmsViewClass = Textarea;
      dmsModel = new Textarea_model(Object.assign({}, defaultFormStepData, {
        min: formStepData.min,
        max: formStepData.max,
      }));
    } else if (formStepData.type === 'checkbox') {
      isCollection = true;
      dmsViewClass = Checkboxes;
      dmsModel = new Checkbox_collection(formStepData.optionData?.map(({ value, text }) => ({ html: text, name: value, checked: formStepData.value?.includes(value) })), Object.assign({
        minSelectsRequired: formStepData.min || (formStepData.required ? 1 : null),
        maxSelectsAllowed: formStepData.max,
      }, defaultFormStepData));
    } else if (formStepData.type === 'radio') {
      dmsViewClass = RadioView;
      dmsModel = new Radio_model(Object.assign({}, defaultFormStepData));
    } else if (formStepData.type === 'dropdown') {
      dmsViewClass = Dropdown;
      dmsModel = new Dropdown_model(Object.assign({}, defaultFormStepData, {
        // Dropdown should always have an empty selection row available
        defaultBlank: formStepData.defaultBlank === false ? false : true,
      }));
    } else if (formStepData.type === 'rating') {
      throw new Error("RATING NOT IMPLEMENTED");
    } else if (formStepData.type === 'address') {
        dmsViewClass = Address;
        dmsModel = new Address_model(Object.assign({}, defaultFormStepData, {
          json: formStepData.value,
          streetMaxLength: formStepData.max,
          useSubLabel: !!formStepData.labelText,
          streetSubLabel: formStepData.labelText,

          // TODO: Bug where Address view always calls model.setToRequired on validateAndShowErrors()??
          isOptional: !formStepData.required,
        }));
    } else if (formStepData.type === 'staffDropdown') {
      dmsViewClass = Dropdown;
      dmsModel = new Dropdown_model(Object.assign({}, defaultFormStepData, {
        // Dropdown should always have an empty selection row available
        defaultBlank: formStepData.defaultBlank === false ? false : true,
        optionData: _.sortBy(userChannel.request('get:all:users').filter(user => !(SYSTEM_USER_NAMES || []).includes(user.get('user_name')))
          .filter(user => {
            const isValidRoleGroup = formStepData.filterRoleGroup?.includes?.(user.getRoleId()) || formStepData.filterRoleGroup === user.getRoleId() || !formStepData.filterRoleGroup;
            const isValidRoleSubGroup = formStepData.filterRoleGroup?.includes?.(user.getRoleSubtypeId()) || formStepData.filterRoleSubGroup === user.getRoleSubtypeId() || !formStepData.filterRoleSubGroup;
            return isValidRoleGroup && isValidRoleSubGroup && user.isActive();
          }).map(user => ({ value: String(user.id), text: user.getDisplayName() })),
          'text'
        )
      }));
    } else if (formStepData.type === 'nestedForm') {
      isCollection = true;
      dmsViewClass = NestedFormView;
      dmsModel = new NestedFormCollection(formStepData.value?.map(formStepData => ({
        formStep: this.createFormStep(formStepData)
      })));
    } else {
      throw new Error(`UNKNOWN COMPONENT FOR: ${formStepData.type}`);
    }

    return new FormStep(formStepData, dmsModel, dmsViewClass, isCollection);
  },

  // Builds a functional form from the JSON and returns the html (?)
  createFormView(formTitle, submitButton=false, formLayout='horizontal') {
    this._renderedFormView = new FormView({
      formTitle,
      formSteps: this.formSteps,
      submitButton,
      formLayout,
    });
    return this._renderedFormView;
  },
});

export { FormBuilder };
