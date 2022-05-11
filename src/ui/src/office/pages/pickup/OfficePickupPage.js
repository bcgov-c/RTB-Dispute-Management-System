import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import RadioModel from '../../../core/components/radio/Radio_model';
import RadioView from '../../../core/components/radio/Radio';
import PageView from '../../../core/components/page/Page';
import OfficeDisputeOverview from '../../components/office-dispute/OfficeDisputeOverview';
import OfficeTopSearchView from '../office-main/OfficeTopSearch';
import EmailModel from '../../../core/components/email/Email_model';
import CheckmarkIcon from '../../static/DA_CheckIcon.png';
import XIcon from '../../static/DA_XIIcon.png';
import OfficePickupAttachments from './OfficePickupAttachments';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

import './OfficePickupPage.scss';
import EmailPreviewView from '../../../core/components/preview-email/PreviewEmail';

const emailsChannel = Radio.channel('emails');
const participantsChannel = Radio.channel('participants');
const disputeChannel = Radio.channel('dispute');
const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');

const PICKUP_OVERVIEW_DESCRIPTION_TEXT = `Print the RTB message and the associated documents and provide them to the dispute participant. Once they have all been
provided, click the 'Mark documents as picked up' button at the bottom. IMPORTANT: The system will indicate if print or file viewing was initiated on all files, but cannot detect if documents
were actually printed and provided - Only mark documents as picked up when you are sure all documents were provided.`

const OfficePickupPage = PageView.extend({
  className: `${PageView.prototype.className} office-pickup`,

  initialize() {
    this.template = this.template.bind(this);
    this.createViewVars();
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.pickupOptionsModel = new RadioModel({
      optionData: this.getPickupOptions(),
      required: true,
      value: this.selectedPickup ? this.selectedPickup.get('email_id') : null
    });
  },

  createViewVars() {
    this.dispute = disputeChannel.request('get');
    this.participantToUse = participantsChannel.request('get:participant', this.dispute.get('tokenParticipantId'));
    this.pickupEmails = emailsChannel.request('get:all')
    this.printClicked = false;
    this.selectedPickup = this.pickupEmails.length === 1 ? this.pickupEmails.at(0) : null;
    this.showPickupError = false;
    this.attachmentClickedList = [];
  },

  setupListeners() {
    this.listenTo(this.pickupOptionsModel, 'change:value', () => {
      this.selectedPickup = this.pickupEmails.findWhere({ email_id: Number(this.pickupOptionsModel.getData())});
      this.attachmentClickedList = [];
      this.printClicked = false;
      this.showPickupError = false;
      this.selectedPickup.getAttachments().forEach(() => this.attachmentClickedList.push(false))
      this.render();
    });

    this.listenTo(this.model.getOfficeTopSearchModel(), 'refresh:main', function() { Backbone.history.navigate('main', { trigger: true }); }, this);
  },

  cancelPickup() {
    Backbone.history.navigate('main', { trigger: true });
  },

  completePickup() {
    if (this.selectedPickup.getAttachments().length && (this.attachmentClickedList.includes(false) || !this.printClicked)) {
      this.showPickupError = true;
      this.render();
      return;
    } else if (!this.selectedPickup.getAttachments().length && !this.printClicked) {
      this.showPickupError = true;
      this.render();
      return;
    }

    loaderChannel.trigger('page:load');
    emailsChannel.request('set:pickup:messageStatus', this.selectedPickup.get('email_id')).then(() => {
      this.model.setReceiptData({
        pickupTitle: this.selectedPickup.get('subject'),
        associatedDocumentsCount: 1 + this.selectedPickup.getAttachments().length
      })
      Backbone.history.navigate('#pickup/receipt', { trigger: true });
    }).catch(generalErrorFactory.createHandler('PICKUP.SET.SAVE'))
  },

  printMessage() {
    this.printClicked = true;
    this.showPickupError = false;
    this.render();
    const previewEmailView = this.getChildView('pickupPreviewEmail');
    previewEmailView ? previewEmailView.print() : null;
  },

  getPickupOptions() {
    if (!this.pickupEmails.length) return [];
      
    return this.pickupEmails.slice(0).reverse().map((pickup) => {
      return { value: pickup.get('email_id'), text: `${pickup.get('subject')} - <span class="office-pickup__options__created-date">${Formatter.toDateDisplay(pickup.get('created_date'))}</span>` }
    })
  },

  toParticipantDisplay(participant) {
    if (!participant) {
      return;
    }
    return `${participant.isTenant() ? 'Tenant' : 'Landlord'} - Initials ${participant.getInitialsDisplay()} (${participant.isRespondent() ? 'Respondent' : 'Applicant'})`;
  },

  getAttachmentView() {
    if(this.currentChildView) {
      return this.currentChildView;
    }
    
    return new OfficePickupAttachments({ collection: this.selectedPickup.getAttachments() })
  },

  onRender() {
    this.showChildView('topSearchRegion', new OfficeTopSearchView({ model: this.model.getOfficeTopSearchModel() }));
    this.showChildView('disputeRegion', new OfficeDisputeOverview({ model: this.model }));
    this.showChildView('pickupOptionsRegion', new RadioView({ model: this.pickupOptionsModel }));

    if (!this.selectedPickup) return;
    this.showChildView('pickupPreviewEmail', new EmailPreviewView({ emailModel: new EmailModel({ message_type: configChannel.request('get', 'EMAIL_MESSAGE_TYPE_PICKUP'), html_body: this.selectedPickup.get('html_body'), subject: this.selectedPickup.get('subject') }) }));

    if (!this.selectedPickup || !this.selectedPickup.getAttachments()) return;
    this.listenTo(this.selectedPickup.getAttachments(), 'file:button:clicked', (clickedIndex) => {
      this.attachmentClickedList[clickedIndex] = true;
      this.showPickupError = false;
      this.render();
    })
    this.showChildView('pickupAttachmentsRegion', new OfficePickupAttachments({ collection: this.selectedPickup.getAttachments(), attachmentClickedList: this.attachmentClickedList }));
  },

  regions: {
    topSearchRegion: '.office-top-main-content-container',
    disputeRegion: '.da-access-overview-container',
    pickupOptionsRegion: '.office-pickup__options',
    pickupPreviewEmail: '.office-pickup__email__message',
    pickupAttachmentsRegion: '.office-pickup__attachments',
  },

  template() {
    const pickupUserDisplay = this.participantToUse ? `${this.toParticipantDisplay(this.participantToUse)}` : '-';
    const renderJsxPickupError = () => {
      if (!this.showPickupError) return;
      return <p className="error-block">All pick-up items must have been printed, viewed or downloaded to mark all documents as picked up</p>
    }

    const renderJsxSubmitButton = () => {
      if (!this.selectedPickup) return;
      return <button className="btn btn-lg btn-standard btn-continue" onClick={() => this.completePickup()}>Mark All Documents As Picked Up</button>;
    }

    return (
      <>
        <div className="hidden-print">
          <div className="office-top-main-instructions"></div>
          <div className="office-top-main-content-container"></div>
          <div className="da-access-overview-container"></div>

          <div className="office-sub-page-view">
            <div className="da-page-header-title office-pickup__title">
              <span className="da-page-header-icon da-access-menu-icon"></span>
              <span>Print and provide documents</span>
            </div>

            <div className="office-pickup__options__wrapper">
              <div>Available pick-up documents for: <b>{pickupUserDisplay}</b> <i>To switch to another user, login with their access code.</i></div>
              <div className="office-pickup__options"></div>
            </div>

            <div className="office-pickup__overview-text">
              <span>{PICKUP_OVERVIEW_DESCRIPTION_TEXT}</span>
            </div>

            {this.renderJsxEmailSection()}
            {this.renderAttachmentsSection()}
            {renderJsxPickupError()}

            <div className="office-sub-page-buttons">
              <button className="btn btn-lg btn-cancel" onClick={() => this.cancelPickup()}>Cancel</button>
              {renderJsxSubmitButton()}
            </div>
          </div>
          <div className="office-pickup__printable-iframe"></div>
        </div>
      </>
    )
  },

  renderJsxEmailSection() {
    if (!this.pickupOptionsModel.getData()) return;
    if (!this.selectedPickup) return;

    const renderJsxPrintInitiated = () => {
  
      return (
      <div className="office-pickup__print">
        <button className="btn btn-lg btn-standard btn-continue" onClick={() => this.printMessage()}>Print Message</button>
        <div className="office-pickup__print__initiated"> 
            <img src={this.printClicked ? CheckmarkIcon : XIcon} />
            <span className="office-pickup__print__initiated__text">{this.printClicked ? 'Print was initiated' : 'Print not initiated'}</span> 
          </div>
      </div>
      )
    };

    return (
      <div className="office-pickup__email">
        {renderJsxPrintInitiated()}
        <div className="office-pickup__email__wrapper">
          <div className="office-pickup__email__header">RTB Message: {this.selectedPickup.get('subject')}</div>
          <div className="office-pickup__email__message"></div>
        </div>
      </div>
    )
  },

  renderAttachmentsSection() {
    if (!this.selectedPickup || !this.selectedPickup.getAttachments()) return;
    return <div className="office-pickup__attachments"></div>
  }
});

_.extend(OfficePickupPage.prototype, ViewJSXMixin);
export default OfficePickupPage;