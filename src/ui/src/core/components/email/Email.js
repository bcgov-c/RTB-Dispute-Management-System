import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import InputView from '../input/Input'
import template from './Email_template.tpl'

const SLIDE_HIDE_DURATION = 300;
const SLIDE_SHOW_DURATION = 400;
const MINIMUM_SEND_DURATION = 2000;
const EMAIL_OPEN_CLASS = 'email-open';

const modalChannel = Radio.channel('modals');
const animationChannel = Radio.channel('animations');

export default Marionette.View.extend({
  template,
  tagName: 'div',
  className: 'component-email-container',

  regions: {
    emailInput: '.component-email-input'
  },

  ui: {
    slider: '.component-email-input-slide',
    emailIcon: '.component-email-icon',
    emailLabel: '.component-email-label',
    emailInputContainer: '.component-email-input-container',

    emailInputOk: '.component-email-buttons-ok',
    emailInputCancel: '.component-email-buttons-cancel',

    sendingSlider: '.component-email-sending-slide',
    resultSlider: '.component-email-result-slide',
    resultSuccess: '.component-email-result-success',
    resultFail: '.component-email-result-fail'
  },

  events: {
    'click @ui.emailIcon': 'clickEmailIcon',
    'click @ui.emailLabel': 'clickEmailIcon',

    'click @ui.emailInputOk': 'clickEmailInputOk',
    'click @ui.emailInputCancel': 'resetUI',

    'click @ui.resultSlider': 'resetUI'
  },

  STATE: null,

  resetUI() {
    if (this.eraseTextAfterClose) {
      this.model.trigger('update:input', null);
    }
    this.toDisplayState('closed');
  },

  clickEmailIcon() {
    if (this.isOpenState()) {
      this.toDisplayState('closed');
    } else {
      this.toDisplayState('open');
    }
  },

  isOpenState() {
    return this.STATE === 'open';
  },

  isSendingState() {
    return this.STATE === 'sending';
  },

  isResultState() {
    return this.STATE === 'send_success' || this.STATE === 'send_fail';
  },

  isClosedState() {
    return this.STATE === 'closed';
  },

  
  toDisplayState(stateName) {
    switch (stateName) {
      case 'open':
        this._animateOpen();
        break;
      case 'closed':
        this._animateClosed();
        break;
      case 'sending':
        this._animateSending();
        break;
      case 'send_success':
        this._animateSendResult({is_success: true});
        break;
      case 'send_fail':
        this._animateSendResult({is_success: false});
        break;
      default:
        console.log(`[Warning] Unknown display state passed to Email component: ${stateName}`);
        return;
    }
    this.STATE = stateName;
  },
  

  _animateOpen() {
    const slider = this.getUI('slider'),
      _sliderToClose = this.isClosedState() ? slider :
        this.isSendingState() ? this.getUI('sendingSlider') :
        this.isResultState() ? this.getUI('resultSlider') : null;

    this.trigger('email:open:start');
    if (_sliderToClose) {
      _sliderToClose.addClass('hidden');
    }
    this.getUI('emailLabel').addClass('hidden');
    slider.removeClass('hidden');
    this.getUI('emailInputContainer').removeClass('hidden');
    animationChannel.request('queueEvent', _.bind(function() { this.trigger('email:open:complete'); }, this));
  },

  _animateClosed() {
    const slider = this.getUI('slider'),
      _sliderToClose = this.isOpenState() ? slider :
        this.isSendingState() ? this.getUI('sendingSlider') :
        this.isResultState() ? this.getUI('resultSlider') : null;

    this.trigger('email:close:start');
    if (_sliderToClose) {
      _sliderToClose.addClass('hidden');
    }
    this.getUI('emailInputContainer').addClass('hidden');
    slider.removeClass('hidden');
    this.getUI('emailLabel').removeClass('hidden');

    this.trigger('email:close:complete');
    animationChannel.request('queueEvent', _.bind(function() { this.trigger('email:close:complete'); }, this));
  },

  _animateSending() {
    const slider = this.getUI('slider'),
      sendingSlider = this.getUI('sendingSlider'),
      _sliderToClose = this.isOpenState() || this.isClosedState() ? slider :
        this.isResultState() ? this.getUI('resultSlider') : null;

    if (_sliderToClose) {
      _sliderToClose.addClass('hidden');
    }

    sendingSlider.html(`<div class="component-email-send-name">Sending to ${this.model.get('value')}</div><div class="component-email-send-loader"></div>`);
    sendingSlider.removeClass('hidden');

    // Force a minimum 2 second wait on email send
    animationChannel.request('queueEvent', function() {
      const dfd = $.Deferred();
      setTimeout(dfd.resolve, MINIMUM_SEND_DURATION);
      return dfd.promise();
    });
  },

  _animateSendResult(result) {
    result = result || {};

    const slider = this.getUI('slider'),
    resultSlider = this.getUI('resultSlider'),
      _sliderToClose = this.isOpenState() || this.isClosedState() ? slider :
        this.isSendingState() ? this.getUI('sendingSlider') : null;

  
    //resultSlider.addClass('hidden').css('left', '100%');
    resultSlider.addClass('hidden')
    if (_sliderToClose) {
       _sliderToClose.addClass('hidden');
    }

    if (result.is_success) {
      this.getUI('resultFail').addClass('hidden');
      this.getUI('resultSuccess').removeClass('hidden');
    } else {
      this.getUI('resultSuccess').addClass('hidden');
      this.getUI('resultFail').removeClass('hidden');
    }
    resultSlider.removeClass('hidden');
  },


  clickEmailInputOk() {
    const inputView = this._getInputView()
    inputView.saveInput();
  },

  initialize(options) {
    this.mergeOptions(options, ['widgetMode', 'showOptOut', 'labelText', 'iconClass', 'floatDir', 'eraseTextAfterClose']);
    this.labelText = this.labelText || this.model.get('labelText');

    this.SLIDE_HIDE_DURATION = SLIDE_HIDE_DURATION;
    this.SLIDE_SHOW_DURATION = SLIDE_SHOW_DURATION;

    this.updateModelAttrs();

    this.listenTo(this.model, 'unableToEmail', this.render, this);
    this.listenTo(this.model, 'render', this.render, this);

    this.listenTo(this, 'email:open:start', function() {
      this.getUI('emailIcon').addClass(EMAIL_OPEN_CLASS);
    }, this);
    this.listenTo(this, 'email:close:complete', function() {
      this.getUI('emailIcon').removeClass(EMAIL_OPEN_CLASS);
    }, this);
  },

  updateModelAttrs() {
    // Only allow opt out if it's in the view option, and if the model is required with no customLink already present
    if (this.showOptOut && this.model.get('required') && !this.model.get('customLink')) {
      this.model.set({
        customLink: 'Unable to use email?',
        customLinkFn: _.bind(this.showModalOpenUnableToEmail, this)
      }, { silent: true });
    }

    // Force the underlying model to be type "email"
    if (this.model) {
      this.model.set('inputType', 'email');
    }
  },

  optOutOfEmail() {
    this.showOptOut = false;
    this.model.set({
      cssClass: `${this.model.get('cssClass')} optional-input`,
      required: false,
      customLink: null,
      customLinkFn: null
    });
  },

  optInToEmail() {
    this.showOptOut = true;
    this.model.set({
      required: true,
      cssClass: $.trim(this.model.get('cssClass')).replace('optional-input', ''),
    }, { silent: true });
    this.updateModelAttrs();
  },

  showModalOpenUnableToEmail() {
    modalChannel.request('show:standard', {
      title: 'Unable to use email?',
      bodyHtml: `<p>It will take longer for the Residential Tenancy Branch to provide information to parties who do not use an email.</p>
      <p>Are you sure you would like to continue without an email address for this contact?</p>`,
      primaryButtonText: 'Continue without email',
      cancelButtonText: 'Cancel, use email',
      primaryButtonTextMobile: 'Continue',
      cancelButtonTextMobile: 'Cancel',
      onContinueFn: _.bind(function(modalView) {
        this.optOutOfEmail();
        this.model.trigger('unableToEmail');
        modalView.close();
      }, this)
    });
  },


  _getInputView() {
    return this.getChildView('emailInput');
  },

  onRender() {
    this.renderEmail();
  },

  renderEmail() {
    const inputView = new InputView({ model: this.model });
    this.showChildView('emailInput', inputView);
    this.setupInputListeners(inputView);
  },

  setupInputListeners(inputView) {
    /*
      Watchers can handle email view like this:
        object.listenTo(emailView, 'sendEmail', function(emailView) {
          emailView.toDisplayState('sending');
          <call_api_email_function>().done(function() {
            emailView.toDisplayState('send_success');
          }).fail(function() {
            emailView.toDisplayState('send_fail');
          });
        });
     */

    this.listenTo(inputView, 'itemComplete', _.bind(this.trigger, this, 'sendEmail', this));
    this.listenTo(inputView, 'input:enter', _.bind(inputView.saveInput, inputView));
  },

  /* Simply pass along to the InputView */
  showErrorMessage(error_msg) {
    return this._getInputView().showErrorMessage(error_msg);
  },

  /* Simply pass along to the InputView */
  validateAndShowErrors() {
    return this._getInputView().validateAndShowErrors();
  },

  templateContext() {
    return {
      iconClass: this.iconClass,
      floatDir: this.floatDir === 'right' ? 'float-right' : 'float-left',
      widgetMode: this.widgetMode,
      showOptOut: this.showOptOut,
      labelText: this.labelText
    }
  }

});
