import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import { ReceiptContainer } from '../../../core/components/receipt-container/ReceiptContainer';
import ExternalParticipantModel from '../../../evidence/components/external-api/ExternalParticipant_model';
import ParticipantModel from '../../../core/components/participant/Participant_model';
import AddressModel from '../../../core/components/address/Address_model';
import pageTemplate from './NewDisputeReceipt_template.tpl';
import receiptTemplate from './NewDisputeReceiptContent_template.tpl';

const NOT_VISIBLE_MSG = `<i>Cannot be displayed on resumed applications for privacy purposes</i>`;

const emailsChannel = Radio.channel('emails');
const loaderChannel = Radio.channel('loader');
const paymentsChannel = Radio.channel('payments');
const configChannel = Radio.channel('config');
const filesChannel = Radio.channel('files');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const sessionChannel = Radio.channel('session');
const Formatter = Radio.channel('formatter').request('get');

export default PageView.extend({
  template: pageTemplate,
  className: `${PageView.prototype.className} office-page-new-dispute-receipt`,

  ui: {
    menu: '.btn-cancel',
    logout: '.office-receipt-logout'
  },

  regions: {
    receiptContainerRegion: '.office-sub-page-receipt-container',
  },

  events: {
    'click @ui.menu': 'clickMainMenu',
    'click @ui.logout': 'clickLogout',
  },

  clickMainMenu() {
    Backbone.history.navigate('main', { trigger: true, replace: true });
  },

  clickLogout() {
    loaderChannel.trigger('page:load');
    Backbone.history.navigate('logout', { trigger: true });
  },

  initialize() {
    this.COMMON_IMAGE_ROOT = configChannel.request('get', 'COMMON_IMAGE_ROOT');
    this.dispute = disputeChannel.request('get');
    this.formCode = this.model.getFormCodeUsedFromLoadedDispute();
    this.formConfig = configChannel.request('get:evidence', this.formCode);

    if (!this.formCode || _.isEmpty(this.formConfig)) {
      alert("[Error] Invalid application form data configuration.  This process cannot continue.  Please contact RTB for support.");
      Backbone.history.navigate('main', { trigger: true });
      return;
    }

    this.matchingFormFileDescription = filesChannel.request('get:filedescription:code', this.formCode);
    this.matchingBulkFileDescriptions = filesChannel.request('get:filedescriptions:category', configChannel.request('get', 'EVIDENCE_CATEGORY_BULK'));
    this.OFFICE_FORM_EVIDENCE_DESCRIPTION = configChannel.request('get', 'OFFICE_FORM_EVIDENCE_DESCRIPTION');

    const intakeFee = paymentsChannel.request('get:fee:intake');
    this.paymentTransaction = intakeFee ? intakeFee.getActivePayment() : null;

    this.isPrivateMode = !this.dispute.get('tenancy_address');
    this.isPartial = !intakeFee || !intakeFee.isPaid();

    this.pageTitle = this.isPartial ? 'Partial application filed' : 'Application submitted';
    this.receiptTitle = this.isPartial ? 'Partial Application Filing' : 'Application Submission';

    if (this.isPartial) return;
    const primaryApplicant = participantsChannel.request('get:primaryApplicant');
    emailsChannel.request('save:receipt', {
      participant_id: primaryApplicant ? primaryApplicant.id : null,
      receipt_body: this.receiptPageHtml(),
      receipt_title: this.receiptTitle,
      receipt_type: configChannel.request('get', 'RECEIPT_TYPE_OFFICE_SUBMISSION'),
      receipt_subtype: configChannel.request('get', this.isPartial ? 'RECEIPT_SUBTYPE_OFFICE_NEW_DISPUTE_PARTIAL' : 'RECEIPT_SUBTYPE_OFFICE_NEW_DISPUTE'),
    });
  },

  onRender() {
    const primaryApplicant = participantsChannel.request('get:primaryApplicant');
    const currentUser = sessionChannel.request('get:user');
    this.showChildView('receiptContainerRegion', new ReceiptContainer({
      displayHtml: this.receiptPageHtml(),
      emailSubject: `File number ${this.dispute.get('file_number')}: ${this.receiptTitle} Receipt`,
      containerTitle: this.receiptTitle,
      submissionTitle: this.isPartial ? 'Information Submitted' : null,
      emailUpdateParticipantId: primaryApplicant ? primaryApplicant.id : null,
      autoSendEmail: false,
      participantSaveModel: currentUser && currentUser.isOfficeUser() ? ExternalParticipantModel : ParticipantModel,
      messageSubType: configChannel.request('get', 'EMAIL_MESSAGE_SUB_TYPE_OS_NEW_APPLICATION'),
    }));
  },

  receiptPageHtml() {
    return receiptTemplate(this._toTemplateData());
  },

  _toTemplateData(asEmail) {
    const rentalAddressApiMappings = {
      street: 'tenancy_address',
      city: 'tenancy_city',
      country: 'tenancy_country',
      postalCode: 'tenancy_zip_postal',
      geozoneId: 'tenancy_geozone_id',
      unitType: 'tenancy_unit_type',
      unitText: 'tenancy_unit_text'
    };
    this.addressEditModel = new AddressModel({
      json: _.mapObject(rentalAddressApiMappings, function(val, key) { return this.dispute.get(val); }, this),
    });

    const primaryApplicant = participantsChannel.request('get:primaryApplicant');
  
    return {
      COMMON_IMAGE_ROOT: this.COMMON_IMAGE_ROOT,
      asEmail,
      Formatter,
      isPartial: this.isPartial,
      pageTitle: this.pageTitle,
      receiptTitle: this.receiptTitle,
      isPrivateMode: this.isPrivateMode,
      dispute: this.dispute,
      fileNumber: this.dispute.get('file_number'),
      addressDisplay: !this.isPrivateMode ? this.addressEditModel.getAddressString() : NOT_VISIBLE_MSG,
      isBusiness: primaryApplicant.isBusiness(),
      primaryApplicant,
      daRootUrl: configChannel.request('get', 'DISPUTE_ACCESS_URL'),

      formTitleDisplay: this.matchingFormFileDescription ? this.matchingFormFileDescription.get('title') : this.formConfig.title,
      formDescriptionDisplay: this.matchingFormFileDescription ? this.matchingFormFileDescription.get('description') : this.OFFICE_FORM_EVIDENCE_DESCRIPTION,
      
      // Payment step only accessible after uploading files, so if any matchingFormFileDescription is found, we must NOT be in private mode
      formFilesDisplay: !this.matchingFormFileDescription ?
        (this.model.get('_newDisputeSkipUploads') ? 'No application files submitted.' : NOT_VISIBLE_MSG) :
        Formatter.toUploadedFilesDisplay(this.matchingFormFileDescription.getUploadedFiles()),

      bulkFilesDisplay: !this.matchingFormFileDescription ?
        (this.model.get('_newDisputeSkipUploads') ? 'No evidence files submitted.' : NOT_VISIBLE_MSG) :
        !_.isEmpty(this.matchingBulkFileDescriptions) ? 
          Formatter.toUploadedFilesDisplay(_.union.apply(_, _.map(this.matchingBulkFileDescriptions, function(fileDescription) {
            return fileDescription.getUploadedFiles(); }))
          ) : null,
      
      paymentTransaction: this.paymentTransaction,
      paymentBy: this.dispute.get('officePayorName'),
      officePaymentMethod: this.dispute.get('officePaymentMethod')
    };
  },

  templateContext() {
    return this._toTemplateData();
  }

});