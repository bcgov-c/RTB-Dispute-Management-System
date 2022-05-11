import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import { renderToString } from 'react-dom/server';
import PageView from '../../../core/components/page/Page';
import AccessDisputeOverview from '../../components/access-dispute/AccessDisputeOverview';
import ExternalParticipantModel from '../../../evidence/components/external-api/ExternalParticipant_model';
import { ReceiptContainer } from '../../../core/components/receipt-container/ReceiptContainer';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';

const PAGE_TITLE = `Update Contact submitted`;
const RECEIPT_TITLE = 'Update Contact';

const emailsChannel = Radio.channel('emails');
const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const Formatter = Radio.channel('formatter').request('get');

const UpdateContactReceipt = PageView.extend({
  initialize() {
    this.template = this.template.bind(this);
    this.COMMON_IMAGE_ROOT = configChannel.request('get', 'COMMON_IMAGE_ROOT');
    this.receiptData = this.model.getReceiptData() || {};
    
    this.changed_attrs = this.receiptData.changed_attrs || {};
    this.old_participant_model = this.receiptData.old_participant_model || new Backbone.Model();

    // For emails to access these icons, use the full URL here
    this.operationNameToIconUrl = {
      Added: `${this.COMMON_IMAGE_ROOT}DA_ContactIcon_Add.png`,
      Modified: `${this.COMMON_IMAGE_ROOT}DA_ContactIcon_Edit.png`,
      Removed: `${this.COMMON_IMAGE_ROOT}DA_ContactIcon_Remove.png`
    };

    this.dispute = disputeChannel.request('get');
    this.loggedInParticipant = participantsChannel.request('get:participant', this.dispute.get('tokenParticipantId'));

    emailsChannel.request('save:receipt', {
      participant_id: this.loggedInParticipant ? this.loggedInParticipant.id : null,
      receipt_body: renderToString(this.receiptPageHtml()),
      receipt_title: RECEIPT_TITLE,
      receipt_type: configChannel.request('get', 'RECEIPT_TYPE_DISPUTEACCESS_SUBMISSION'),
      receipt_subtype: configChannel.request('get', 'RECEIPT_SUBTYPE_DA_CONTACT'),
    });
  },

  preparePrimaryContactChanges() {
    const PARTICIPANT_CONTACT_METHOD_DISPLAY = configChannel.request('get', 'PARTICIPANT_CONTACT_METHOD_DISPLAY');
    const display_obj = {};
    display_obj.label ='Preferred Contact Method';
    if (this.changed_attrs.hasOwnProperty('primary_contact_method')) {
      display_obj.value = _.has(PARTICIPANT_CONTACT_METHOD_DISPLAY, this.changed_attrs.primary_contact_method) ? PARTICIPANT_CONTACT_METHOD_DISPLAY[this.changed_attrs.primary_contact_method] : null;
      if (this.old_participant_model.get('primary_contact_method')) {
        display_obj.operationName = 'Modified';
      } else {
        display_obj.operationName = 'Added';
      }
    } else {
      display_obj.value = _.has(PARTICIPANT_CONTACT_METHOD_DISPLAY, this.old_participant_model.get('primary_contact_method')) ? PARTICIPANT_CONTACT_METHOD_DISPLAY[this.old_participant_model.get('primary_contact_method')] : null;
    }
    return display_obj;
  },

  prepareEmailChanges() {
    const display_obj = {};
    display_obj.label ='Email Address';
    if (this.changed_attrs.hasOwnProperty('email')) {
      display_obj.value = this.changed_attrs.email;
      if (this.old_participant_model.get('email') && this.changed_attrs.email === null) {
        display_obj.operationName = 'Removed';
        display_obj.isRemoved = true;
      } else if (this.old_participant_model.get('email')) {
        display_obj.operationName = 'Modified';
      } else {
        display_obj.operationName = 'Added';
      }
    } else {
      display_obj.value = this.old_participant_model.get('email');
    }
    
    return display_obj;
  },

  preparePrimaryPhoneChanges() {
    const display_obj = {};
    display_obj.label = 'Daytime phone';
    if (this.changed_attrs.hasOwnProperty('primary_phone')) {
      display_obj.value = this.changed_attrs.primary_phone;
      if (!this.old_participant_model.get('primary_phone') && this.changed_attrs.primary_phone) {
        display_obj.operationName = 'Added';
      } else if (this.old_participant_model.get('primary_phone') && this.changed_attrs.primary_phone) {
        display_obj.operationName = 'Modified';
      }
    } else {
      display_obj.value = this.old_participant_model.get('primary_phone');
    }
    return display_obj;
  },

  prepareSecondaryPhoneChanges() {
    const display_obj = {};
    display_obj.label = 'Other phone';
    if (this.changed_attrs.hasOwnProperty('secondary_phone')) {
      display_obj.value = this.changed_attrs.secondary_phone;
      if (this.old_participant_model.get('secondary_phone') && this.changed_attrs.secondary_phone == null) {
        display_obj.operationName = 'Removed';
        display_obj.isRemoved = true;
      } else if (!this.old_participant_model.get('secondary_phone') && this.changed_attrs.secondary_phone) {
        display_obj.operationName = 'Added';
      } else if (this.old_participant_model.get('secondary_phone') && this.changed_attrs.secondary_phone) {
        display_obj.operationName = 'Modified';
      }
    } else {
      display_obj.value = this.old_participant_model.get('secondary_phone');
    }
    return display_obj;
  },

  prepareFaxChanges() {
    const display_obj = {};
    display_obj.label = 'Fax';
    if (this.changed_attrs.hasOwnProperty('fax')) {
      display_obj.value = this.changed_attrs.fax;
      if (this.old_participant_model.get('fax') && !this.changed_attrs.fax) {
        display_obj.operationName = 'Removed';
        display_obj.isRemoved = true;
      } else if (!this.old_participant_model.get('fax') && this.changed_attrs.fax) {
        display_obj.operationName = 'Added';
      } else if (this.old_participant_model.get('fax') && this.changed_attrs.fax) {
        display_obj.operationName = 'Modified';
      }
    } else {
      display_obj.value = this.old_participant_model.get('fax');
    }
    return display_obj;
  },

  getChangedAttributesObjects() {
    const changeObjs =[
      this.preparePrimaryContactChanges(),
      this.prepareEmailChanges(),
      this.preparePrimaryPhoneChanges(),
      this.prepareSecondaryPhoneChanges(),
      this.prepareFaxChanges()
    ];
    
    _.each(changeObjs, function(obj) {
      if (_.has(this.operationNameToIconUrl, obj.operationName)) {
        obj.iconUrl = this.operationNameToIconUrl[obj.operationName];
      }
    }, this);

    return changeObjs;
  },

  onRender() {
    
    this.showChildView('disputeRegion', new AccessDisputeOverview({ model: this.model }));

    this.showChildView('receiptContainerRegion', new ReceiptContainer({
      displayHtml: this.receiptPageHtml(),
      emailSubject: `File number ${this.dispute.get('file_number')}: ${RECEIPT_TITLE} Receipt`,
      containerTitle: RECEIPT_TITLE,
      emailUpdateParticipantId: this.loggedInParticipant ? this.loggedInParticipant.id : null,
      autoSendEmail: true,
      participantSaveModel: ExternalParticipantModel,
      messageSubType: configChannel.request('get', 'EMAIL_MESSAGE_SUB_TYPE_DA_CONTACT_UPDATE')
    }));
  },

  clickMenu() {
    Backbone.history.navigate('access', { trigger: true });
  },

  clickLogout() {
    loaderChannel.trigger('page:load');
    Backbone.history.navigate('logout', { trigger: true });
  },

  className: `${PageView.prototype.className} da-update-contact-receipt-page da-receipt-page`,

  regions: {
    disputeRegion: '.dac__contact__dispute-overview',
    receiptDisputeRegion: '.da-receipt-dispute-info-container',
    receiptContainerRegion: '.dac__contact__receipt'
  },

  template() {
    return (
      <>
        <div className="dac__contact__dispute-overview"></div>

        <div className="dac__page-header">
          <span className="dac__page-header__icon dac__icons__menu__contact"></span>
          <span className="dac__page-header__title">{PAGE_TITLE}</span>
        </div>
        <div className="dac__contact__receipt"></div>
        <div className="dac__page-buttons hidden-print">
          <button className="btn btn-standard btn-lg da-receipt-main-menu-btn" onClick={() => this.clickMenu()}>Main Menu</button>
          <span className="receipt-logout-btn" onClick={() => this.clickLogout()}>Logout</span>
        </div>
        <div className="spacer-block-10"></div>
      </>
    )
  },

  receiptPageHtml() {
    const participantInitials = this.loggedInParticipant && this.loggedInParticipant.getInitialsDisplay() ? this.loggedInParticipant.getInitialsDisplay()  : '-';
    const isApplicant = this.loggedInParticipant.isApplicant();
    const isLandlord = this.loggedInParticipant.isLandlord();
    const valsAndClasses = this.getChangedAttributesObjects()

    return (
      <>
        <h4 className="er-title visible-email" style={{ fontWeight: 'bold', padding: '0px', margin: '25px 0px 10px 0px' }}>Receipt: {RECEIPT_TITLE}</h4>

        <p className="er-text" style={{ 'textAlign': 'left',  padding: '0px 0px 0px 0px', margin: '0px 0px 10px 0px' }}>
          The following was submitted to the Residential Tenancy Branch. For information privacy purposes, any personal information that was not provided as part of this submission may be abbreviated or partially hidden (**).
        </p>

        <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>File number: </span>&nbsp; <b>{this.dispute.get('file_number')}</b></p>
        <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>Access code: </span>&nbsp; <b>{this.dispute.get('accessCode')}</b></p>
        <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>Added for: </span>&nbsp; { isApplicant ? 'Applicant' : 'Respondent'} { isLandlord ? 'Landlord' : 'Tenant' } - Initials { participantInitials }</p>
        <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>Submitted by: </span>&nbsp; {this.model.get('submitterName')}</p>
        <p className="er-text" style={{ textAlign: 'left', padding: '0px 0px 0px 0px', margin: '0px 0px 5px 0px' }}> <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>Date of submission: </span>&nbsp; {Formatter.toDateDisplay(Moment())}</p>
      
        <table cellPadding="0" cellSpacing="0" width="100%" className="er-nesttable-wrapper" style={{ margin: '0px', padding: '0px', borderCollapse: 'collapse' }}>
          <tr>
          <td className="er-nesttable-wrapper-td" style={{ padding: '15px 0px 10px 0px' }}>
              <table cellPadding="0" cellSpacing="0" width="100%" className="er-nesttable" style={{ margin: '0px', padding: '0px', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr className="er-nesttable-tr">
                  <td className="er-nesttable-header" style={{ minWidth: '110px', width:'10%', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold', border: '1px solid #e3e3e3', backgroundColor: '#f0f0f0', padding: '4px', whiteSpace: 'nowrap' }}>Contact Info</td>
                  <td className="er-nesttable-subheader" style={{ padding: '4px 4px 4px 10px', width: 'auto', border: '1px solid #e3e3e3' }}> </td>
                  </tr>
                  {valsAndClasses.map((obj) => {
                    const valueDisplay = obj.value || obj.isRemoved ? obj.value ? obj.value : '-' : 'not provided';
                    
                    return (
                      <>
                        <tr className="er-nesttable-tr">
                          <td colSpan="2" className="er-nesttable-item" style={{ padding: '8px', width: '100%', border: '1px solid #e3e3e3' }}>
                          <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>{ obj.label }: </span> <span style={{ marginRight: '3px'}}> <span dangerouslySetInnerHTML={{__html: valueDisplay }}></span>&nbsp;</span>
                          <span className="er-change-note" style={{ whiteSpace: 'nowrap' }}>
                            { obj.value || obj.isRemoved ? obj.iconUrl ? <img src={`${obj.iconUrl}`} className="er-change-icon" style={{ marginRight: '3px', position: 'relative', bottom: '1px' }}/> : null : null }
                            <span className="er-label" style={{ padding: '0px 5px 0px 0px', color: '#8d8d8d' }}>{obj.operationName ? obj.operationName : 'No change'}</span>
                          </span>
                          </td>
                        </tr>
                      </>
                    );
                  })
                  }
                </tbody>
              </table>
            </td>
          </tr>
        </table>
      </>
    );
  },
});

_.extend(UpdateContactReceipt.prototype, ViewJSXMixin);
export default UpdateContactReceipt
