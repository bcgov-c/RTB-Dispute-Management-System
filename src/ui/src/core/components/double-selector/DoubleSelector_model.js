import Backbone from 'backbone';

const OTHER_KEY = "1234";

export default Backbone.Model.extend({
  defaults: {
    apiMapping: null,
    firstDropdownModel: null,
    secondDropdownModel: null,
    otherInputModel: null,
    singleDropdownMode: false,
    enableOther: false,
    otherOverrideValue: null,
    showValidate: true,
    alwaysOptional: false
  },

  initialize() {
    if (!this.get('firstDropdownModel')) {
      console.log(`[Error] Missing required first dropdown`);
    }
    if (!this.get('secondDropdownModel') && !this.get('singleDropdownMode')) {
      console.log(`[Error] Missing required second dropdown`);
    }

    if (this.get('enableOther') && !this.get('otherInputModel')) {
      console.log(`[Error] Missing required other inputModel`);
    }

    this.configureSubModels();
    this.setupListeners();
  },

  configureSubModels() {
    const firstDropdownModel = this.get('firstDropdownModel');
    const firstDropdownOptions = firstDropdownModel.get('optionData');
    const alwaysOptional = this.get('alwaysOptional');

    if (!alwaysOptional) {
      firstDropdownModel.set('required', true, { silent: true });
    }

    if (this.get('enableOther')) {
      firstDropdownOptions.push({ value: OTHER_KEY, text: 'Other' });
    }

    this.updateCurrentValue(this.get('currentValue'));
  },


  updateCurrentValue(val) {
    if ($.trim(val) === '') return;
    this.set('currentValue', val);

    const firstDropdownModel = this.get('firstDropdownModel');
    const secondDropdownModel = this.get('secondDropdownModel');
    const otherInputModel = this.get('otherInputModel');
    const alwaysOptional = this.get('alwaysOptional');
    const firstDropdownOptions = firstDropdownModel.get('optionData');

    if (this.get('singleDropdownMode')) {
      if (this.get('enableOther') && val && !this.isValueInFirstModel()) {
        firstDropdownModel.set('value', OTHER_KEY, {silent: true});
        otherInputModel.set(Object.assign({
          required: !alwaysOptional,
        }, val && val !== this.get('otherOverrideValue') ? { value: val } : null), {silent: true});
      } else if (this.isValueInFirstModel()) {
        firstDropdownModel.set('value', val, {silent: true});
      }
    } else {
      if (val && this.isValueInSecondModel()) {
        // NOTE: This is hardcoded right now to pick the first value in the list.
        // This component can be extended later to support more than 2 options in the first dropdown
        firstDropdownModel.set('value', firstDropdownOptions[0].value, {silent: true});
        secondDropdownModel.set({
          value: val,
          required: !alwaysOptional,
        }, {silent: true});
      } else if (this.get('enableOther')) {
        firstDropdownModel.set('value', OTHER_KEY, {silent: true});
        secondDropdownModel.set({
          value: null,
          required: false
        }, {silent: true});
        otherInputModel.set({
          value: val,
          required: !alwaysOptional,
        }, {silent: true});
      }
    }
  },

  setupListeners() {
    const firstDropdownModel = this.get('firstDropdownModel');
    const secondDropdownModel = this.get('secondDropdownModel');
    const otherInputModel = this.get('otherInputModel');

    this.listenTo(firstDropdownModel, 'change:value', _.bind(this.trigger, this, 'change'), this);

    if (secondDropdownModel) {
      this.listenTo(secondDropdownModel, 'change:value', _.bind(this.trigger, this, 'change'), this);
    }

    if (otherInputModel) {
      this.listenTo(otherInputModel, 'change:value', _.bind(this.trigger, this, 'change'), this);
    }
  },

  clearSelections() {
    const firstDropdownModel = this.get('firstDropdownModel');
    const secondDropdownModel = this.get('secondDropdownModel');
    const otherInputModel = this.get('otherInputModel');
    const options = { silent: true };

    firstDropdownModel.set('value', null, options);
    
    if (secondDropdownModel) {
      secondDropdownModel.set('value', null, options);
    }

    if (otherInputModel) {
      otherInputModel.set('value', null, options);
    }
  },

  _setRequiredBool(bool) {
    const options = { silent: true };
    this.set('alwaysOptional', !bool, options);
    
    this.get('firstDropdownModel').set('required', bool, options);

    if (this.get('secondDropdownModel')) {
      this.get('secondDropdownModel').set('required', bool, options);
    }

    if (this.get('otherInputModel')) {
      this.get('otherInputModel').set('required', bool, options);
    }
  },

  setToOptional() {
    this._setRequiredBool(false);
  },

  setToRequired() {
    this._setRequiredBool(true);
  },

  _isCurrentValueInDropdownModel(dropdownModelName) {
    return _.contains(_.map(this.get(dropdownModelName).get('optionData'), function(o) {
      return String(o.value);
    }), String(this.get('currentValue')));
  },

  isValueInFirstModel() {
    return this._isCurrentValueInDropdownModel('firstDropdownModel');
  },

  isValueInSecondModel() {
    return this._isCurrentValueInDropdownModel('secondDropdownModel');
  },

  isOtherModeSelected() {
    return this.get('enableOther') && this.get('firstDropdownModel').getData() === OTHER_KEY;
  },

  validate(attrs) {
    if (attrs.firstDropdownModel.validate(attrs.firstDropdownModel.attributes)) {
      return attrs.firstDropdownModel.validate(attrs.firstDropdownModel.attributes);
    }

    if (this.isOtherModeSelected()) {
      if (attrs.otherInputModel.validate(attrs.otherInputModel.attributes)) {
        return attrs.otherInputModel.validate(attrs.otherInputModel.attributes);
      }
    } else if (!this.get('singleDropdownMode')) {
      if (attrs.secondDropdownModel.validate(attrs.secondDropdownModel.attributes)) {
        return attrs.secondDropdownModel.validate(attrs.secondDropdownModel.attributes);
      }
    }
  },

  getPageApiDataAttrs() {
    const return_obj = {};
    
    if (this.get('singleDropdownMode')) {
      const firstDropdownSaveData = this.get('firstDropdownModel').getPageApiDataAttrs();
      console.log(firstDropdownSaveData);
      if (this.isOtherModeSelected() && this.get('otherOverrideValue')) {
        Object.keys(firstDropdownSaveData).forEach(key => firstDropdownSaveData[key] = this.get('otherOverrideValue'));
      }

      console.log(firstDropdownSaveData);
      _.extend(return_obj, firstDropdownSaveData, this.get('otherInputModel').getPageApiDataAttrs());
    } else {
      return_obj[this.get('apiMapping') || 'value'] = this.getData();
    }
    return return_obj;
  },

  getData() {
    return this.isOtherModeSelected() ? this.get('otherInputModel').getData() :
      this.get('singleDropdownMode') ? this.get('firstDropdownModel').getData() : this.get('secondDropdownModel').getData()

  }
})
