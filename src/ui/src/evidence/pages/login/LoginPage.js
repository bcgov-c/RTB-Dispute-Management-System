import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import InputView from '../../../core/components/input/Input';
import InputModel from '../../../core/components/input/Input_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import CheckboxCollection from '../../../core/components/checkbox/Checkbox_collection';
import CheckboxesView from '../../../core/components/checkbox/Checkboxes';
import template from './LoginPage_template.tpl';
import TOU_template from '../../../core/components/tou/TOU_template.tpl';

const touLinkClass = 'accepted-terms-link';
const INVALID_ACCESS_CODE_MSG = "Invalid access code";
const INVALID_USER_TYPE_MSG_TEMPLATE = "The access code you provided is not a <%= tenantLandlordString %> access code.<br/>If you don't know your access code, <a class='static-external-link' href='javascript:;' url='https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/contact-the-residential-tenancy-branch'>contact the Residential Tenancy Branch</a>";

const sessionChannel = Radio.channel('session');
const configChannel = Radio.channel('config');
const applicationChannel = Radio.channel('application');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const animationChannel = Radio.channel('animations');
const loaderChannel = Radio.channel('loader');
const modalChannel = Radio.channel('modals');

export default Marionette.View.extend({
  template,
  className: 'dac__login-page dac__floating-header-page',

  ui: {
    login: '.step-next',
    typeError: '.dac__login-page__type-error',
    touContents: '.info-help-container',
    accessCodeHelp: '.dac__login-page__help'
  },

  regions: {
    codeInput: '.dac__login-page__access-code',
    typeRegion: '.dac__login-page__access-code-type',
    userInput: '.dac__login-page__user-name',
    touRegion: '.dac__login-page__terms-of-use'
  },

  events: {
    'click @ui.login': 'clickLogin',
    [`click .${touLinkClass}`]: 'clickTermsOfUseLink',
    'click @ui.accessCodeHelp': 'clickAccessCodeHelp',
  },

  clickTermsOfUseLink(e) {
    e.preventDefault();
    const touContentsEle = this.getUI('touContents');

    if (touContentsEle.hasClass('help-opened')) {
      touContentsEle.slideUp({duration: 400, complete: function() {
        touContentsEle.removeClass('help-opened');
      }});
    } else {
      touContentsEle.addClass('help-opened');
      touContentsEle.find('.close-help').on('click', _.bind(this.clickTermsOfUseLink, this));
      touContentsEle.slideDown({duration: 400});
    }
  },

  clickAccessCodeHelp(e) {
    e.preventDefault();
    Backbone.history.navigate('recovery', { trigger: true });
  },

  clickLogin() {
    if (!this.validateAndShowErrors()) {
      console.log(`[Info] Page did not pass validation checks`);
      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
      }
      return;
    }

    this.model.set('fileDate', null);
    const submitterName = this.userInputModel.getData();
    this.model.set('staffLogin', false);
    this._performAccessCodeLogin(this.codeInputModel.getData(), submitterName);
  },

  _performAccessCodeLogin(access_code, username) {
    this.stopListening(applicationChannel, 'dispute:loaded:disputeaccess');
    this.listenToOnce(applicationChannel, 'dispute:loaded:disputeaccess', function() {
      if (!this.validateParticipantAccessCodeType()) {
        this.showInvalidCodeTypeMessage();
        // Ensure timers and saved data is cleaned
        sessionChannel.trigger('logout:complete');
      } else if (this.hasRestrictedDisputeCreationMethodAndTruth()) {
        this.showInvalidCreationMethodMessage();
      } else {
        this.model.set('routingFromLogin', true);
        Backbone.history.navigate('access', { trigger: true });
      }
      loaderChannel.trigger('page:load:complete');
    }, this);
    this.stopListening(applicationChannel, 'load:disputeaccess:fail');
    this.listenToOnce(applicationChannel, 'load:disputeaccess:fail', function() {
      this.showInvalidSearch();
      loaderChannel.trigger('page:load:complete');
    }, this);
    
    loaderChannel.trigger('page:load');
    
    // Clear the loaded info in the site and on the page, then re-load
    applicationChannel.request('clear');
    applicationChannel.trigger('load:disputeaccess', access_code, username);
  },

  /** Logic for migration checks */
  hasRestrictedDisputeCreationMethodAndTruth() {
    const dispute = disputeChannel.request('get');
    return dispute && dispute.isCreatedExternal() && dispute.isSourceOfTruthCms();
  },

  showInvalidCreationMethodMessage() {
    modalChannel.request('show:standard', {
      title: `Office Use Only`,
      bodyHtml: `
      <div class="center-text">
        <div class="modal-withdraw-title">If you are not an employee of the Residential Tenancy Branch, do not use this site.</div>
        <div class="modal-withdraw-body">
          <hr class="title-underline" style="margin-top:15px;" />
          <ul class="sublist">
            <li><span>If you do not work for the Residential Tenancy Branch, press Exit. All activity on this file is recorded.</span></li>
            <li><span>If you have questions about this file or require support, please contact the Residential Tenancy Branch at 1-800-665-8779 or <a href="mailto:HSTRO@gov.bc.ca">HSRTO@gov.bc.ca</a>.</span></li>
          </ul>
        </div>`,
      modalCssClasses: 'modal-cutover-warning',
      primaryButtonText: 'I am RTB Staff',
      cancelButtonText: 'Exit',
      onContinueFn: (modalView) => {
        modalView.close();
        this.model.set('routingFromLogin', true);
        Backbone.history.navigate('access', { trigger: true });
      },
      onCancelFn(modalView) {
        modalView.close();
        loaderChannel.trigger('page:load');
        Backbone.history.navigate('logout', { trigger: true });
      }
    });
  },
  /** End logic for migration check */

  validateParticipantAccessCodeType() {
    const dispute = disputeChannel.request('get');
    const token_participant = participantsChannel.request('get:participant', dispute.get('tokenParticipantId'));
    const selected_code_type = this.codeTypeModel.getData({ parse: true });

    return (participantsChannel.request('is:landlord', token_participant) && selected_code_type === configChannel.request('get', 'DISPUTE_SUBTYPE_LANDLORD')) ||
      (participantsChannel.request('is:tenant', token_participant) && selected_code_type === configChannel.request('get', 'DISPUTE_SUBTYPE_TENANT'));
  },

  
  validateAndShowErrors() {
    let is_valid = true;
    _.each(this.editGroup, function(name) {
      const component = this.getChildView(name);
      is_valid = is_valid & (component ? component.validateAndShowErrors() : true);
    }, this);

    return is_valid;
  },

  initialize() {
    this.createSubModels();
    this.editGroup = ['codeInput', 'typeRegion', 'userInput', 'touRegion'];
  },

  createSubModels() {
    this.codeInputModel = new InputModel({
      name: 'access-code',
      cssClass: null,
      autocomplete: false,
      labelText: 'Access Code',
      errorMessage: 'Enter the Access Code',
      inputType: 'access_code',
      maxLength: configChannel.request('get', 'ACCESS_CODE_LENGTH'),
      restrictedCharacters: InputModel.getRegex('whitespace__restricted_chars'),
      required: true,
      value: null,
    });

    this.codeTypeModel = new DropdownModel({
      optionData: [{ value: String(configChannel.request('get', 'DISPUTE_SUBTYPE_TENANT')), text: 'Tenant', },
          { value: String(configChannel.request('get', 'DISPUTE_SUBTYPE_LANDLORD')), text: 'Landlord', }],
      defaultBlank: true,
      labelText: 'Access Code For',
      required: true,
      errorMessage: 'Enter the type',
      value: null,
    });

    this.userInputModel = new InputModel({
      name: 'user-name',
      cssClass: null,
      autocomplete: false,
      labelText: 'Name of Submitter',
      subLabel: '(Disputant or Representative)',
      errorMessage: 'Enter the name',
      required: true,
      maxLength: configChannel.request('get', 'ACCESS_SUBMITTER_NAME_MAX'),
      value: null,
    });

    this.checkboxCollection = new CheckboxCollection([{
      html: `I have read and understand the Residential Tenancy online systems <span class="${touLinkClass}">Terms of Use</span>`,
      required: true,
      checked: false,
    }, {
      html: 'I am the owner of the access code entered above or an approved representative of the owner with authority to submit information on their behalf',
      required: true,
      checked: false,
    }], { minSelectsRequired: 2 });
  },

  createViewListeners() {
    const codeInputView = this.getChildView('codeInput');
    const userInputView = this.getChildView('userInput');
    this.stopListening(codeInputView, 'input:enter');
    this.listenTo(codeInputView, 'input:enter', this.clickLogin, this);
    
    this.stopListening(userInputView, 'input:enter');
    this.listenTo(userInputView, 'input:enter', this.clickLogin, this);

    this.listenTo(this.userInputModel, 'change:value', this.hideInvalidCodeTypeMessage, this);
    this.listenTo(this.codeTypeModel, 'change:value', this.hideInvalidCodeTypeMessage, this);
  },

  showInvalidSearch() {
    const codeInputView = this.getChildView('codeInput');      
    if (codeInputView) {
      codeInputView.showErrorMessage(INVALID_ACCESS_CODE_MSG);
    }
  },

  showInvalidCodeTypeMessage() {
    this.getUI('typeError').html(_.template(INVALID_USER_TYPE_MSG_TEMPLATE)({
      tenantLandlordString: this.codeTypeModel.getData({ parse: true }) === configChannel.request('get', 'DISPUTE_SUBTYPE_LANDLORD') ? 'landlord' : 'tenant'
    })).removeClass('hidden-item');
  },

  hideInvalidCodeTypeMessage() {
    this.getUI('typeError').html('').addClass('hidden-item');
  },

  onRender() {
    this.showChildView('codeInput', new InputView({ model: this.codeInputModel }));
    this.showChildView('typeRegion', new DropdownView({ model: this.codeTypeModel }));
    this.showChildView('userInput', new InputView({ model: this.userInputModel }));
    this.showChildView('touRegion', new CheckboxesView({ collection: this.checkboxCollection }));

    this.createViewListeners();

    loaderChannel.trigger('page:load:complete');
  },

  templateContext() {
    return {
      TOU_template: TOU_template()
    };
  }
});
