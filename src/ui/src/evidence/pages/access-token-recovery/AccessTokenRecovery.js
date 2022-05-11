import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import InputView from '../../../core/components/input/Input';
import InputModel from '../../../core/components/input/Input_model';
import EmailIcon from '../../static/DA_Icon_EmailAccessCode.png';
import BackIcon from '../../../core/static/Icon_Back.png';
import RecoverPWIcon from '../../static/DA_RecoverPWIcon.png';
import SearchIcon from '../../static/DA_Icon_FindAccessCode.png';
import CheckIcon from '../../static/DA_CheckIcon.png';
import ResetFormIcon from '../../static/Icon_SearchAgain.png';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import './AccessTokenRecovery.scss';

const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');
const sessionChannel = Radio.channel('session');

const AccessTokenRecoveryPage = Marionette.View.extend({
  
  initialize() {
    this.template = this.template.bind(this);
    this.createModels();
    this.searched = false;
  },

  createModels() {
    this.fileNumber = new InputModel({
      labelText: 'File Number',
      errorMessage: 'Enter file number',
      inputType: 'dispute_number',
      required: true,
      value: null,
    });

    this.emailAddress = new InputModel({
      labelText: 'Your email address',
      errorMessage: 'Enter email',
      inputType: 'email',
      required: true,
      value: null,
    });
  },

  regions: {
    fileNumberInputRegion: '.recovery__inputs__file-number',
    emailInputRegion: '.recovery__inputs__email'
  },

  submit() {
    if (this.validateAndShowErrors()) {
      this.fileNumber.set({ disabled: true });
      this.emailAddress.set({ disabled: true });
      this.searched = true;
      this.render();

      this.initiateAccessTokenRecovery();
    }
  },

  initiateAccessTokenRecovery() {
    const requestData = {
      fileNumber: this.fileNumber.getData(),
      email: this.emailAddress.getData()
    }

    sessionChannel.request('recover:accesscode', requestData).catch(generalErrorFactory.createHandler('ACCESS.TOKEN.RECOVERY', () => {
      this.model.trigger('search:reset');
      loaderChannel.trigger('page:load:complete');
    }));
  },

  backClicked() {
    Backbone.history.navigate('login', { trigger: true });
  },

  resetPage() {
    this.searched = false;
    this.fileNumber.set({ disabled: false, value: null });
    this.emailAddress.set({ disabled: false, value: null });
    this.render();
  },

  validateAndShowErrors() {
    const regionsToValidate = ['fileNumberInputRegion', 'emailInputRegion'];
    let isValid = true;

    regionsToValidate.forEach((region) => {
      const view = this.getChildView(region);
      if (view) {
        isValid = view.validateAndShowErrors() && isValid;
      }
    });

    return isValid;
  },

  onRender() {
    this.showChildView('fileNumberInputRegion', new InputView({ model: this.fileNumber }));
    this.showChildView('emailInputRegion', new InputView({ model: this.emailAddress }));
  },

  template() {
    const INTAKE_URL = configChannel.request('get', 'INTAKE_URL');

    return (
      <div className="recovery dac__floating-header-page">
        <span className="recovery__title"><img src={EmailIcon} alt="" />&nbsp;Email my Dispute Access Code</span>
        <p>
          Please enter the file number and your email address. If your email address is associated to an active participant on the file
          your Dispute Access Code will be sent to that email address.
        </p>
        
        <div className="recovery__wrapper">
          <div className="recovery__inputs">
            <div className="recovery__inputs__file-number"></div>
            <div className="recovery__inputs__email"></div>
          </div>
          <button className={`btn btn-lg btn-standard recovery__submit-button ${this.searched ? 'hidden' : ''}`} onClick={ () => this.submit() }><img className="recovery__submit-button__img" src={RecoverPWIcon} alt="" />&nbsp;Email Dispute Access Code</button>
        </div>

        {this.searched ? 
          <>
            <span>
              <span className="recovery__submitted"><img className="recovery__submitted__img" src={ CheckIcon } alt="" />&nbsp;Request submitted.</span>
              &nbsp;If this email is registered on dispute {this.fileNumber.getData()} your Dispute Access Code was just emailed. This may take a couple of
                minutes. Check your email and junk folders. If you do not receive the email, use the other recovery options. 
              </span>
            <span className="recovery__reset" onClick={ () => this.resetPage() }><img className="recovery__reset__img" src={ ResetFormIcon } alt="" />&nbsp;Reset Form</span>
          </>
        : null}

        <p className="recovery__info-title"><img className="recovery__info-title__img" src={ SearchIcon } alt=""/>&nbsp;Find your Dispute Access Code</p>
        <ul>
          <li>Log into your online <a className="static-external-link" href="javascript:;" url={INTAKE_URL}>Application for Dispute Resolution</a> with your Basic BCeID; or</li>
          <li>Check your Notice of Dispute Resolution Proceeding package</li>
        </ul>
        <p className="recovery__contact-text">Still can't find your Dispute Access Code? <a className="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/contact-the-residential-tenancy-branch">Contact the Residential Tenancy Branch</a>.</p>
        <button className="btn btn-lg btn-standard recovery__back-button" onClick={ () => this.backClicked() }><img className="recovery__back-button__img" src={ BackIcon } alt="" />&nbsp;Return to Login</button>
      </div>
    );
  }
});

_.extend(AccessTokenRecoveryPage.prototype, ViewJSXMixin);
export { AccessTokenRecoveryPage }