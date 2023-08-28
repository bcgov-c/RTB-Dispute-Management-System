import Radio from 'backbone.radio';
import React from 'react';
import { ViewJSXMixin } from '../../../../../core/utilities/JsxViewMixin';
import ModalBaseView from '../../../../../core/components/modals/ModalBase';
import IntakeParticipantModel from '../../../../../core/components/participant/IntakeParticipant_model';
import IntakeParticipantView from '../../../../../core/components/participant/IntakeParticipant';
import { generalErrorFactory } from '../../../../../core/components/api/ApiLayer';
import ModalAmendmentConfirm from '../../../../components/amendments/ModalAmendmentConfirm';

const amendmentChannel = Radio.channel('amendments');
const disputeChannel = Radio.channel('dispute');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');

const ModalEditDeliveryAddress = ModalBaseView.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['participantModel']);
    this.isPrimary = this.participantModel.isPrimary();
    this.isPostNotice = disputeChannel.request('get')?.isPostNotice();
    this.addingMailingAddress = false;
    this.createSubModels();
    this.setupListeners();
  },
  
  createSubModels() {
    this.intakeParticipantModel = new IntakeParticipantModel({
      participantModel: this.participantModel,
      isRespondent: true,
    });

    // Only mailing address can be changed in this case
    if (this.isPostNotice && this.participantModel.hasMailAddress()) {
      this.intakeParticipantModel.disableAddress({ disableMail: true });
      this.addingMailingAddress = true;
    }
  },

  setupListeners() {
    if (this.isPostNotice) {
      this.listenTo(this.intakeParticipantModel.get('useMailModel'), 'change:value', (m, val) => {
        if (val === '0') {
          this.intakeParticipantModel.disableAddress({ render: true });
          this.addingMailingAddress = true;
        } else if (val === '1') {
          this.intakeParticipantModel.enableAddress({ render: true });
          this.addingMailingAddress = false;
        }
        this.getUI('title').text(this.getModalTitle());
      });
    }
  },

  validateAndShowErrors() {
    let isValid = true;
    const view = this.getChildView('participantRegion');
    if (view && view.isRendered()) isValid = view.validateAndShowErrors();
    return isValid;
  },

  saveAddress() {
    if (!this.validateAndShowErrors()) return;
    if (this.isPostNotice) {
      this.confirmAmendmentAndSave(this.getAmendmentChangeType());
    } else {
      loaderChannel.trigger('page:load');
      this.participantModel.set(this.intakeParticipantModel.getUIDataAttrs(), {silent: true});
      this.saveParticipant();
    }  
  },

  getAmendmentChangeType() {
    return (this.isPostNotice && this.addingMailingAddress) ? `change:${this.isPrimary? 'primaryApplicant' : 'party'}:mailing`
      : (this.isPostNotice) ? `change:${this.isPrimary? 'primaryApplicant' : 'party'}:address`
      : '';
  },

  confirmAmendmentAndSave(amendmentChange) {
    const modal = new ModalAmendmentConfirm({
      title: `${this.getModalTitle()} for ${this.participantModel.getDisplayName()}?`,
      bodyHtml: `<p>Warning - this will change <b>${this.participantModel.getDisplayName()}</b>, and store the change as an amendment.`
        + `&nbsp;Amendments must be served to responding parties.</p>`
        + `<p>Are you sure you want to make this amendment?`,
      isRtbInitiated: true,
    });
  
    this.listenToOnce(modal, 'save', function(amendmentData) {
      modal.close();
      loaderChannel.trigger('page:load');
      this.saveAmendment(amendmentChange, amendmentData);
    }, this);

    modalChannel.request('add', modal);
  },

  saveAmendment(changeType, amendmentData={}) {
    this.participantModel.set(this.intakeParticipantModel.getUIDataAttrs(), {silent: true});

    const changeData = this.participantModel.getApiChangesOnly();
    if (!changeData || _.isEmpty(changeData)) {
      loaderChannel.trigger('page:load:complete');
      this.close();
      return;
    }
    
    amendmentChannel.request(changeType, this.participantModel, amendmentData)
      .done(() => {
        this.participantModel.set('is_amended', true);
        this.saveParticipant();
      }).fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.AMENDMENT.PARTY', () => this.close());
        handler(err);
      });
  },

  saveParticipant() {
    this.participantModel.save()
      .done(() => this.close())
      .fail(generalErrorFactory.createHandler('ADMIN.PARTY.SAVE'))
      .always(() => loaderChannel.trigger('page:load:complete'));
  },

  onRender() {
    this.showChildView('participantRegion', new IntakeParticipantView({
      model: this.intakeParticipantModel,
      noHeader: true,
      packageMethodOptional: true,
      enableUnitType: true,
    }));
  },

  getModalTitle() {
    const actionLanguage = this.isPostNotice && this.addingMailingAddress && !this.participantModel.hasMailAddress() ? 'Add'
      : this.isPostNotice ? 'Amend'
      : 'Edit';
    return `${actionLanguage} ${!this.isPostNotice || !this.addingMailingAddress ? `Participant Address` : ''}${!this.isPostNotice ? ' and ': ''} ${!this.isPostNotice || this.addingMailingAddress ? `Mailing Address` : ''}`;
  },

  id: 'editDeliveryAddress_modal',

  ui() {
    return Object.assign({}, ModalBaseView.prototype.ui, {
      title: '.modal-title'
    });
  },

  regions: {
    participantRegion: '.editDeliveryAddress_party',
  },

  template() {
    return (
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">{this.getModalTitle()}</h4>
            <div className="modal-close-icon-lg close-x"></div>
          </div>
          <div className="modal-body">

            <div className="editDeliveryAddress_party"></div>

            <div className="modal-button-container">
              <button type="button" className="btn btn-lg btn-default btn-cancel cancel-button">Close</button>
              <button
                type="button"
                className="btn btn-lg btn-default btn-primary btn-continue"
                onClick={() => this.saveAddress()}
              >Save</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

_.extend(ModalEditDeliveryAddress.prototype, ViewJSXMixin);
export default ModalEditDeliveryAddress;
