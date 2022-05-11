/**
 * @class core.components.input.InputView
 * @memberof core.components.input
 * @augments Marionette.View
 */

import Radio from 'backbone.radio';
import Cleave from 'cleave.js';
import ViewMixin from '../../utilities/ViewMixin';
import InputModel from './Input_model';
import template from './Input_template.tpl';

const ENTER_KEYCODE = 13;

const configChannel = Radio.channel('config');

export default ViewMixin.extend({
  template,

  tagName: 'div',
  defaultClass: 'intake-input-component form-group',

  ui: {
    input: 'input',
    error: '.error-block',
    container: '.form-group',
    submit: '.btn-validate',
    customLink: '.input-model-custom-link',
    secondCustomLink: '.input-model-second-custom-link',
  },

  // Pass along these change events from <input> element to View, so that View can attach listeners if needed
  triggers: {
    'blur @ui.input' : 'blur',
    'focus @ui.input' : 'focus',
    'change @ui.input' : 'change',
    'keyup @ui.input' : 'keyup',
    'input @ui.input' : 'input',
    'propertychange @ui.input': 'propertychange'
  },

  events() {
    const events = {
      'blur @ui.input': 'onInputBlur',
      'change @ui.input': 'onInputChanged',
      'keyup @ui.input': 'onInputChanged',
      'input @ui.input': 'onInputChanged',
      'propertychange @ui.input': 'onInputChanged',
      'click @ui.submit': 'saveInput'
    };
    // NOTE: The custom link functions is run in the context of the input's model by default
    if (this.model.get('customLinkFn')) {
      _.extend(events, { 'click @ui.customLink': _.bind(this.model.get('customLinkFn'), this.model) });
    }
    if (this.model.get('secondCustomLinkFn')) {
      _.extend(events, { 'click @ui.secondCustomLink': _.bind(this.model.get('secondCustomLinkFn'), this.model) });
    }

    return events;
  },

  onInputBlur() {
    this.removeErrorStyles();
    this.getUI('input').val($.trim(this.getUI('input').val()));
    if (!this.model.isDate() && !this.model.isTime()) {
      // Don't handle any input blurs if datepicker/timepicker mode was open, because the click into calendar datepicker causes a blur
      this.inputChanged();
    }
    if (this.model.get('showValidate') && this.model.get('autoAcceptFirstTouch') && !this._touched) {
      this._touched = true;
      this.saveInput();
    }
  },

  onInputChanged() {
    this.removeErrorStyles();
    // Time widget is only active on blur
    if (this.model.isTime()) {
      return;
    }
    this.inputChanged();
  },

  inputChanged() {
    const ui_value = this.getUI('input').val();
    const cleaned_value = this.model.applyCharacterRestrictions(ui_value);

    if (ui_value !== cleaned_value) {
      // If the replace / removal of characters changed the original string, update the UI
      this.getUI('input').val(cleaned_value);
    }

    // On dates, the empty string is equivalent to a null model - don't trigger a change in this case, because a View render
    // while the calendar is open can cause issues
    const valueToSet = this.model.isDate() && cleaned_value === '' ? null : cleaned_value;
    this.model.set('value', valueToSet);

    if (this._savedInput === cleaned_value || (this._savedInput && String(this._savedInput) === cleaned_value)) {
      this.validateDisable();
    } else {
      this.validateEnable();
    }
    this.trigger('finished:change', this);
  },

  saveInput() {
    // If a validate button is present, check that it's not disabled
    if (this.model.get('showValidate') && this.getUI('submit').hasClass('btn-disabled')) {
      return;
    }

    const error_msg = this.model.validate(this.model.attributes);
    if (error_msg) {
      this.showErrorMessage(error_msg);
    } else {
      this._savedInput = this.model.get('value');
      this.setValidateTextToUpdate();
      this.inputChanged();
      this.removeErrorStyles();
      this.trigger('itemComplete');
    }
  },


  initialize(options) {
    this.mergeOptions(options, ['displayTitle']);
    this._savedInput = this.model.get('value');
    this.POSTAL_CODE_FIELD_MAX = configChannel.request('get', 'POSTAL_CODE_FIELD_MAX');
    this._touched = !!this.model.get('value');
    if (this.model.get('showValidate')) {
      this.on('input:enter', this.saveInput, this);
    }

    this.listenTo(this.model, 'render', this.render, this);

    this.listenTo(this.model, 'update:input', (value, options) => {
      options = options || {};
      this.getUI('input').val(value);
      this.removeErrorStyles();

      if (this.model.get('showValidate') && options.update_saved_value) {
        this._savedInput = value;
      }

      this.inputChanged();
    });

    this.listenTo(this.model, 'show:datepicker', () => {
      this.getUI('input').datepicker("show");
    });
  },

  validateEnable() {
    if (this.model.get('showValidate')) {
      this.getUI('submit').removeClass('btn-disabled');
    }
  },

  validateDisable() {
    if (this.model.get('showValidate')) {
      this.getUI('submit').addClass('btn-disabled');
    }
  },

  setValidateTextToUpdate() {
    if (this.model.get('showValidate')) {
      this.getUI('submit').text('Update');
    }
  },

  removeErrorStyles() {
    this.getUI('container').removeClass('has-error');
    this.getUI('error').html('');
  },

  onKeyup(view, ev) {
    if (ev.keyCode === ENTER_KEYCODE) {
      this.trigger('input:enter');
    }
  },

  // Displays an error message
  showErrorMessage(error_msg) {
    this.getUI('container').addClass('has-error');
    this.getUI('error').html(error_msg);
  },

  validateAndShowErrors() {
    // If Validate Button option is enabled, perform that check first
    if (this.model.get('showValidate') && !this.getUI('submit').hasClass('btn-disabled')) {
      this.getUI('error').html('Please update changes to continue');
      return false;
    }

    const is_valid = this.model.isValid();
    this.showErrorMessage(is_valid ? '' : this.model.validationError);
    return is_valid;
  },

  isActive() {
    return this.$el.is(':visible');
  },

  onBeforeRender() {
    if (this.model.isDate()) {
      if (this.isRendered()) {
        this.getUI('input').datepicker('hide');
        this.getUI('input').datepicker('destroy');
      }
      // Force-remove all existing calendars
      $('.ui-datepicker').remove();
    }
  },

  onBeforeDestroy() {
    if (this.isRendered()) {
      this.getUI('input').datepicker('hide');
      this.getUI('input').datepicker('destroy');
    }
  },

  onRender() {
    const inputType = this.model.get('inputType');
    if (inputType === 'date') {
      this._renderAsDate();
    } else if (inputType === 'time') {
      this._renderAsTime();
    } else if (inputType === 'phone') {
      this._renderAsPhone();
    } else if (inputType === 'postal_code') {
      this._renderAsPostalCode();
    }

    if (this.model.get('value') !== null) {
      this.setValidateTextToUpdate();
    }

    this.initializeHelp(this, this.model.get('helpHtml'));
  },

  _renderAsDate() {
    const inputEle = this.getUI('input');
    
    if (!this.model.get('isMobile')) {
      inputEle.datepicker(Object.assign({
        showWeeks: true,
        changeYear: this.model.get('showYearDate'),
        dateFormat: 'M d, yy',
        maxDate: this.model.get('maxDate') ? new Date(this.model.get('maxDate')) : this.model.get('allowFutureDate') ? new Date(8640000000000000) : new Date(),
        minDate: (this.model.get('minDate') ? new Date(this.model.get('minDate')) : null),
        onSelect: (value) => this.model.trigger('update:input', value)
      },
        this.model.get('yearRange') ? { yearRange: this.model.get('yearRange') } : null
      ));
      this.$('.input-group-addon').off('click.input_date');
      this.$('.input-group-addon').on('click.input_date', function() {
        const input_group_ele = $(this).closest('.input-group')
        if (input_group_ele.hasClass('disabled')) {
          return;
        }
        input_group_ele.find('input').datepicker("show");
      });
    }
  },

  _renderAsTime() {
    const inputEle = this.getUI('input');
    const minTime = this.model.get('minTime');
    const maxTime = this.model.get('maxTime');
    const value = this.model.get('value');
    const self = this;

    inputEle.timepicker(_.extend(
      {
        timeFormat: 'h:mmp',
        interval: 30,
        dynamic: false,
        dropdown: true,
        scrollbar: true,
        change(time) {
          if (!time) {
            self.showErrorMessage(`Invalid time format`);
          } else {
            self.model.set('value', Moment(time).format(InputModel.getTimeFormat()));
          }
        }
      },
      minTime ? {
        minTime: Moment(minTime, InputModel.getTimeFormat()).toDate(),
        startTime: Moment(minTime, InputModel.getTimeFormat()).toDate()
      } : {},
      maxTime ? { maxTime: Moment(maxTime, InputModel.getTimeFormat()).toDate() } : {},
      value ? { defaultTime: Moment(value, InputModel.getTimeFormat()).toDate() } : {},
    ));
    this.$('.input-group-addon').off('click.input_time');
    this.$('.input-group-addon').on('click.input_time', function() {
      const input_group_ele = $(this).closest('.input-group')
      if (input_group_ele.hasClass('disabled')) {
        return;
      }
      input_group_ele.find('input').click();
    });
  },

  _renderAsPhone() {
    new Cleave(this.getUI('input'), {
      phone: true,
      delimiter: '-',
      phoneRegionCode: 'CA'
    });
  },

  _renderAsPostalCode() {
    const canadaPostalCodeBlocks = [3, 3],
      otherBlocksOption = [this.POSTAL_CODE_FIELD_MAX];

    new Cleave(this.getUI('input'), {
      blocks: this.model.get('nonCanadaPostalCode') ? otherBlocksOption : canadaPostalCodeBlocks,
      uppercase: true
    });
  },

  templateContext() {
    return {
      displayTitle: this.displayTitle
    };
  }

});
