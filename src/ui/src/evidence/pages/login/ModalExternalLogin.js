import Radio from 'backbone.radio';
import React from 'react';
import ModalBaseView from '../../../core/components/modals/ModalBase';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import Question from '../../../core/components/question/Question';
import Question_model from '../../../core/components/question/Question_model';
import Checkbox_collection from '../../../core/components/checkbox/Checkbox_collection';
import Input from '../../../core/components/input/Input';
import Input_model from '../../../core/components/input/Input_model';
import PageItemView from '../../../core/components/page/PageItem';
import Checkboxes from '../../../core/components/checkbox/Checkboxes';
import TOU_template from '../../../core/components/tou/TOU_template.tpl';
import './ModalExternalLogin.scss'

const touLinkClass = 'accepted-terms-link';
const DROPDOWN_YES = '1';
const DROPDOWN_NO = '2';

const configChannel = Radio.channel('config');

const ModalExternalLogin = ModalBaseView.extend({
  initialize() {
    this.template = this.template.bind(this);
    const daExternalContact = configChannel.request('get', 'EXTERNAL_DA_ACTION_CONTACT');
    const daExternalEvidence = configChannel.request('get', 'EXTERNAL_DA_ACTION_EVIDENCE');
    const daExternalNotice = configChannel.request('get', 'EXTERNAL_DA_ACTION_NOTICE');
    const daExternalSubServ = configChannel.request('get', 'EXTERNAL_DA_ACTION_SUBSERV');
    const daExternalReinstate = configChannel.request('get', 'EXTERNAL_DA_ACTION_REINSTATEMENT');
    this.actionNameDisplays = {
      [daExternalContact]: 'I want to update my contact information',
      [daExternalEvidence]: 'I want to submit evidence',
      [daExternalNotice]: 'I want to record the service of notice to respondents',
      [daExternalSubServ]: 'I want to submit a request for substituted service',
      [daExternalReinstate]: 'I want to request to reinstate my dispute',
    };
    this.showDates = this.model.get('extActionId') === daExternalEvidence && this.model.get('extSiteId') === configChannel.request('get', 'MAINTENANCE_SYSTEM_ID_OFFICE');
    this.isDateRequired = false;

    this.createSubModels();
  },

  createSubModels() {
    this.dateQuestionModel = new Question_model({
      optionData: [{ name: 'extLogin_modal-date-yes', value: DROPDOWN_NO, text: 'NO', cssClass: 'option-button dac__yes-no'  },
        { name: 'extLogin_modal-date-no', value: DROPDOWN_YES, text: 'YES', cssClass: 'option-button dac__yes-no' }],
      required: true,
      question_answer: null,
    });

    this.dateModel = new Input_model({
      inputType: 'date',
      labelText: null,
      required: true,
      allowFutureDate: false,
      errorMessage: 'Enter the override date',
      minDate: Moment().subtract(configChannel.request('get', 'STAFF_BACKDATE_OFFSET') || 0, 'days'),
      value: null,
    })

    this.checkboxCollection = new Checkbox_collection([{
      html: `I have read and understand the Residential Tenancy online systems <span class="${touLinkClass}">Terms of Use</span>`,
      required: true,
      checked: false,
    }, {
      html: 'I am the owner of the access code entered above or an approved representative of the owner with authority to submit information on their behalf',
      required: true,
      checked: false,
    }], { minSelectsRequired: 2 });

    this.listenTo(this.dateQuestionModel, 'change:question_answer', (model, value) => {
      this.isDateRequired = value === DROPDOWN_YES;
      this.render();
    });
  },

  onRender() {
    if (this.showDates) {
      this.showChildView('dateQuestionRegion', new PageItemView({
        stepText: `Are these files being submitted after the date on which they were provided?`,
        subView: new Question({ model: this.dateQuestionModel }),
        stepComplete: true,
        forceVisible: true,
      }));

      if (this.isDateRequired) {
        this.showChildView('dateRegion', new PageItemView({
          stepText: 'Please enter the exact date that the files were provided',
          subView: new Input({ model: this.dateModel }),
          stepComplete: true,
          forceVisible: true,
        }));
      }
    }
    this.showChildView('touRegion', new Checkboxes({ collection: this.checkboxCollection }));    
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

  validateAndShowErrors() {
    let isValid = true;
    const regions = ['touRegion'];
    if (this.showDates) regions.push('dateQuestionRegion');
    if (this.isDateRequired) regions.push('dateRegion');
    
    regions.forEach(regionName => {
      const view = this.getChildView(regionName);
      if (!view || !view.isRendered()) return;
      
      if (_.isFunction(view.validateAndShowErrors)) isValid = view.validateAndShowErrors() && isValid;
      else if (_.isFunction(view.callMethodOnSubView)) isValid = view.callMethodOnSubView('validateAndShowErrors') && isValid;
    });
    return isValid;
  },

  clickContinue() {
    if (!this.validateAndShowErrors()) return;

    const RTB_OFFICE_TIMEZONE_STRING = configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING');
    const fileDateWithTimezone = Moment.tz(Moment(this.dateModel.getData()), RTB_OFFICE_TIMEZONE_STRING);
    this.model.set('fileDate', fileDateWithTimezone.toISOString());
    this.trigger('continue');
  },

  id: 'extLogin_modal',
  regions: {
    dateQuestionRegion: '.extLogin_modal--date-question',
    dateRegion: '.extLogin_modal--date',
    touRegion: '.extLogin_modal--tou',
  },

  ui() {
    return Object.assign({}, ModalBaseView.prototype.ui, {
      touContents: '.info-help-container',
    });
  },

  events() {
    return Object.assign({}, ModalBaseView.prototype.events, {
      [`click .${touLinkClass}`]: 'clickTermsOfUseLink',
    });
  },

  template() {
    const isRoutedFromIntake = this.model.get('extSiteId') === configChannel.request('get', 'MAINTENANCE_SYSTEM_ID_INTAKE');
    const isRoutedFromOffice = this.model.get('extSiteId') === configChannel.request('get', 'MAINTENANCE_SYSTEM_ID_OFFICE');
    const originatingSite = isRoutedFromIntake ? 'Online Intake' 
    : isRoutedFromOffice ? 'Office Submissions'
    : 'RTB';
    return (
      <div className="modal-dialog">
        <div className="modal-content clearfix">
          <div className="modal-header">
            <h4 className="modal-title">Dispute Access Redirect</h4>
            <div className="modal-close-icon-lg close-x"></div>
          </div>
          <div className="modal-body clearfix">
            <p>
              You have been redirected to a specific action for the participant listed below. To continue to this action confirm the information below and press
              Continue. If this information is not correct, click Cancel.
            </p>
            <div>
              <div className="">
                <label className="general-modal-label">Originating Site:</label>&nbsp;<span className="general-modal-value">{originatingSite}</span>
              </div>
              <div className="">
                <label className="general-modal-label">User:</label>&nbsp;<span className="general-modal-value">{this.model.get('submitterName')}</span>
              </div>
              <div className="">
                <label className="general-modal-label">Access Code:</label>&nbsp;<span className="general-modal-value">{this.model.get('accessCode')}</span>
              </div>
              <div className="">
                <label className="general-modal-label">Action:</label>&nbsp;<span className="general-modal-value"><b>{this.actionNameDisplays[this.model.get('extActionId')] || '-'}</b></span>
              </div>
            </div>
            <div className="extLogin_modal--inputs">
              {this.showDates ? <>
                <div className="extLogin_modal--date-question"></div>              
                {this.isDateRequired ? <div className="extLogin_modal--date"></div> : null}
              </> : null}

              {<div dangerouslySetInnerHTML={{__html: TOU_template() }}></div>}
              <div className="extLogin_modal--tou"></div>
            </div>
            <div className="modal-button-container">
              <button type="button" className="btn btn-lg btn-default btn-cancel cancel-button" onClick={() => this.close()}>Cancel</button>
              <button type="button" className="btn btn-lg btn-default btn-primary btn-continue" onClick={() => this.clickContinue()}>Continue</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

});

_.extend(ModalExternalLogin.prototype, ViewJSXMixin);

export default ModalExternalLogin;
