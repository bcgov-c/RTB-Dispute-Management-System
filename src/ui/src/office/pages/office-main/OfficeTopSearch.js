import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import InputView from '../../../core/components/input/Input';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import { doesCurrentURLHaveAssociatedData } from '../../routers/office_router';
import template from './OfficeTopSearch_template.tpl';

const API_ERROR_MESSAGE_PARTICIPANT_REMOVED = "Participant removed";
const API_ERROR_MESSAGE_FILE_NOT_FOUND = "File number not provided or invalid";
const UI_ERROR_MESSAGE_NOT_FOUND = 'No matching file found';
const UI_ERROR_MESSAGE_REMOVED_PARTICIPANT = "Participant removed.";

const INVALID_USER_TYPE_MSG_TEMPLATE = "The access code you provided was not a <%= tenantLandlordString %> access code.<br/>If the person does not know their access code, tell them to contact the <a class='static-external-link' href='javascript:;' url=''>Residential Tenancy Branch</a>";

const disputeChannel = Radio.channel('dispute');
const modalChannel = Radio.channel('modals');
const applicationChannel = Radio.channel('application');
const configChannel = Radio.channel('config');
const participantsChannel = Radio.channel('participants');
const loaderChannel = Radio.channel('loader');

export default Marionette.View.extend({
  template,

  id: String(Math.random(100)).replace('.', ''),

  className: 'office-top-search-logout-container hidden-print',

  ui: {
    logoutLink: '.da-access-logout',
    search: '.btn-validate',
    typeError: '.da-login-code-type-error'
  },

  regions: {
    fileTypeRegion: '.office-top-search-input-file-type',
    fileIdentifierRegion: '.office-top-search-input-file-identifier',
    fileNumberRegion: '.office-top-search-input-file-number',
    accessCodeRegion: '.office-top-search-input-file-code',
    codeTypeRegion: '.office-top-search-input-file-code-type',
  },

  events: {
    'click @ui.logoutLink': 'clickLogoutLink',
    'click @ui.search': 'clickSearch'
  },

  clickLogoutLink() {
    loaderChannel.trigger('page:load');
    Backbone.history.navigate('logout', { trigger: true });
  },

  _isActionResponsePartyRemoved(responseMsg) {
    responseMsg = $.trim(responseMsg);
    if (_.isEmpty(responseMsg)) {
      return false;
    }

    return responseMsg.includes(API_ERROR_MESSAGE_PARTICIPANT_REMOVED);
  },

  _isActionResponseFileNotFound(responseMsg) {
    responseMsg = $.trim(responseMsg);
    if (_.isEmpty(responseMsg)) {
      return false;
    }

    return responseMsg.includes(API_ERROR_MESSAGE_FILE_NOT_FOUND) || responseMsg.includes(this.model.get('appModel') && this.model.get('appModel').getApiErrorMessageInvalidParticipantCode());
  },

  clickSearch() {
    if (this.model._isAccessCodeLookupMode()) {
      this.model.resetAccessCodeLookupState()
      this.render();
      return;
    }
    this.hideErrorMessages();
    
    if (this.isNewDisputePage && this.model.isFileTypeNewSelected()) {
      // Don't perform any search on "new", if we are already on the "new dispute" page
      return;
    }
    
    if (!this.validateAndShowErrors()) {
      return;
    }

    let isSearching = false;
    if (doesCurrentURLHaveAssociatedData()) {
      const modal = modalChannel.request('show:standard', {
        title: 'Confirm Form Exit',
        bodyHtml: `<p>You are navigating away from a form where data is entered.  If you continue, any information entered on this form may be lost.  If you are sure you want to exit this form, click Continue. To stay on the current form click Cancel.</p>`,
        onContinueFn: (modalView) => {
          isSearching = true;
          modalView.close();
          this.performSearch();
        }
      });

      this.listenTo(modal, 'removed:modal', () => {
        if (isSearching) {
          return;
        }
        
        if (this.model.isFileTypeNewSelected()) {
          this.model.fileTypeModel.set('value', null);
        }
        isSearching = false;
      });
    } else {
      this.performSearch();
    }
  },

  performSearch() {
    // Always clear current dispute state on an attempted search
    applicationChannel.request('clear:dispute');

    loaderChannel.trigger('page:load');
    this.model.runCurrentActionPromise().done(response => {
      this.model.set({ reviewNotificationDisplayed: false });
      if (response instanceof Backbone.Model && response.get('tokenParticipantId') && !this.validateParticipantAccessCodeType(response)) {
        this.showInvalidCodeTypeMessage();
        
        // If dispute loaded successfully but wrong code, then clear loaded dispute
        applicationChannel.request('clear:dispute');
      } else if (this.hasRestrictedFileNumberAndIsMigrated()) {
        // If dispute loaded successfully but file is too old, clear dispute
        applicationChannel.request('clear:dispute');
        this.showOldCmsFileMessage();
      }
    }).fail(err => {
      err = err || {};
      let supressErrorModal = false;
      if (err.status === 400) {
        if (this._isActionResponseFileNotFound(err.responseText)) {
          this.model.set('showFileNotFoundError', true);
          supressErrorModal = true;
        } else if (this._isActionResponsePartyRemoved(err.responseText)) {
          this.model.set('showParticipantRemovedError', true);
          supressErrorModal = true;
        }
      }

      // Show the API error unless it's one of the expected errors
      if (!supressErrorModal) {
        generalErrorFactory.createHandler('OS.DISPUTE.LOAD')(err);
      }
    }).always(() => {
      // Always do a full refresh
      this.model.trigger('refresh:main');
      loaderChannel.trigger('page:load:complete');
    });
  },

  /** Logic for migration checks */
  hasRestrictedFileNumberAndIsMigrated() {
    const dispute = disputeChannel.request('get');
    if (!dispute) {
      return true;
    }

    const isNewFileNumberFormat = /^\d{9}$/.test(dispute.get('file_number'));
    const isLegacyFileNumberFormat = /^\d{6}$/.test(dispute.get('file_number')) || /^\d{8}$/.test(dispute.get('file_number'));
    return (isNewFileNumberFormat && dispute.isMigrated()) || isLegacyFileNumberFormat;
  },

  showOldCmsFileMessage() {
    const modalView = modalChannel.request('show:standard', {
      title: `Old Dispute File`,
      bodyHtml: `
      <div class="center-text">
        <div class="modal-withdraw-title">The file you searched for was created in an older system and cannot be accessed through this site.</div>
        <div class="modal-withdraw-body">
          <hr class="title-underline" style="margin-top:15px;" />
          <ul class="sublist">
            <li><span>Service BC Agents: please contact the Residential Tenancy Branch to make a payment, submit forms or evidence or make any changes to this file.</span></li>
            <li><span>Residential Tenancy Branch staff: please consult the Cutover Procedures for instructions on how to add a payment or modify this file.</span></li>
          </ul>
          
          <p class="" style="margin-top:35px;">
            If you have any questions, please contact the Residential Tenancy Branch at 1-800-665-8779 or <a href="mailto:HSTRO@gov.bc.ca">HSRTO@gov.bc.ca</a>.
          </p>
        </div>`,
      modalCssClasses: 'modal-cutover-warning',
      primaryButtonText: 'Exit File',
      hideCancelButton: true,
      onContinueFn(modal) {
        modal.close();
      }
    });

    modalView.once('removed:modal', () => {
      this.model.clearWithDefaults();
      this.model.trigger('refresh');
    });
  },
  /** End logic for migration check */


  _showErrorMessageUnderFileInput(msg) {
    if (this.isRendered()) {
      const view = this.getChildView( this.model._isFileNumberIdentifierSelected() ? 'fileNumberRegion' : 'accessCodeRegion' );
      if (view) {
        view.showErrorMessage(msg);
      }
    }
  },

  showFileNotFoundError() {
    this._showErrorMessageUnderFileInput(UI_ERROR_MESSAGE_NOT_FOUND);
  },

  showParticipantRemovedError() {
    this._showErrorMessageUnderFileInput(UI_ERROR_MESSAGE_REMOVED_PARTICIPANT);
  },

  showInvalidCodeTypeMessage() {
    this.model.set('codeTypeErrorMsg',
      _.template(INVALID_USER_TYPE_MSG_TEMPLATE)({
        tenantLandlordString: this.model.codeTypeModel.getData({ parse: true }) === configChannel.request('get', 'DISPUTE_SUBTYPE_LANDLORD') ? 'landlord' : 'tenant'
      })
    );
  },

  hideErrorMessages() {
    this.model.set({
      showFileNotFoundError: false,
      showParticipantRemovedError: false,
      codeTypeErrorMsg: null
    });

    this.$('.error-block:not(.warning)').html('');
  },

  validateParticipantAccessCodeType(disputeModel) {
    const tokenParticipant = participantsChannel.request('get:participant', disputeModel.get('tokenParticipantId'));
    const selectedCodeType = this.model.codeTypeModel.getData({ parse: true });

    return (participantsChannel.request('is:landlord', tokenParticipant) && selectedCodeType === configChannel.request('get', 'DISPUTE_SUBTYPE_LANDLORD')) ||
      (participantsChannel.request('is:tenant', tokenParticipant) && selectedCodeType === configChannel.request('get', 'DISPUTE_SUBTYPE_TENANT'));
  },

  validateAndShowErrors() {
    let is_valid = true;
    _.each(['fileTypeRegion', 'fileIdentifierRegion', 'fileNumberRegion', 'accessCodeRegion', 'codeTypeRegion'], function(viewName) {
      const view = this.getChildView(viewName);
      if (view && view.isRendered() && view.validateAndShowErrors) {
        is_valid = view.validateAndShowErrors() && is_valid;
      }
    }, this);
    return is_valid;
  },

  initialize(options) {
    this.mergeOptions(options, ['isNewDisputePage']);

    this.listenTo(this.model, 'refresh', this.render, this);

    this.listenTo(this.model.fileTypeModel, 'change:value', this.hideErrorMessages, this);
    this.listenTo(this.model.fileIdentifierModel, 'change:value', this.hideErrorMessages, this);
    this.listenTo(this.model.codeTypeModel, 'change:value', this.hideErrorMessages, this);
    this.listenTo(this.model.accessCodeModel, 'change:value', this.hideErrorMessages, this);
    this.listenTo(this.model.codeTypeModel, 'change:value', this.hideErrorMessages, this);

    // Always trigger a search right away when New is chosen
    this.listenTo(this.model, 'search', this.clickSearch, this);
  },

  onRender() {
    this.showChildView('fileTypeRegion', new DropdownView({ model: this.model.fileTypeModel }));
    this.showChildView('fileIdentifierRegion', new DropdownView({ model: this.model.fileIdentifierModel }));

    const fileNumberView = new InputView({ model: this.model.fileNumberModel });
    const accessCodeView = new InputView({ model: this.model.accessCodeModel });
    
    this.showChildView('fileNumberRegion', fileNumberView);
    this.showChildView('accessCodeRegion', accessCodeView);
    this.showChildView('codeTypeRegion', new DropdownView({ model: this.model.codeTypeModel }));

    this.listenTo(fileNumberView, 'input:enter', this.clickSearch, this);
    this.listenTo(accessCodeView, 'input:enter', this.clickSearch, this);


    if (this.model.get('showFileNotFoundError')) {
      this.showFileNotFoundError();
    } else if (this.model.get('showParticipantRemovedError')) {
      this.showParticipantRemovedError();
    }
  },

  templateContext() {
    return {
      isNewSearch: this.model.isFileTypeNewSelected(),
      isAccessCodeSearch: this.model._isAccessCodeIdentifierSelected(),
      isFileNumberSearch: this.model._isFileNumberIdentifierSelected(),
      submitButtonText: this.model._isAccessCodeLookupMode() ? 'Reset' : 'Update'
    };
  }

});