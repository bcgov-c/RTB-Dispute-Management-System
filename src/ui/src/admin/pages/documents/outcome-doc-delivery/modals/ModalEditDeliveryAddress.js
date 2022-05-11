import Radio from 'backbone.radio';
import React from 'react';
import { ViewJSXMixin } from '../../../../../core/utilities/JsxViewMixin';
import ModalBaseView from '../../../../../core/components/modals/ModalBase';
import IntakeParticipantModel from '../../../../../core/components/participant/IntakeParticipant_model';
import IntakeParticipantView from '../../../../../core/components/participant/IntakeParticipant';
import { generalErrorFactory } from '../../../../../core/components/api/ApiLayer';

const loaderChannel = Radio.channel('loader');

const ModalEditDeliveryAddress = ModalBaseView.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['participantModel']);
    this.createSubModels();
  },
  
  createSubModels() {
    this.intakeParticipantModel = new IntakeParticipantModel({
      participantModel: this.participantModel,
      isRespondent: true,
    });
  },

  validateAndShowErrors() {
    let isValid = true;
    const view = this.getChildView('participantRegion');
    if (view && view.isRendered()) isValid = view.validateAndShowErrors();
    return isValid;
  },

  saveAddress() {
    if (!this.validateAndShowErrors()) return;

    loaderChannel.trigger('page:load');
    this.participantModel.set(this.intakeParticipantModel.getUIDataAttrs(), {silent: true});
    this.participantModel.save(this.participantModel.getApiChangesOnly())
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

  id: 'editDeliveryAddress_modal',

  regions: {
    participantRegion: '.editDeliveryAddress_party',
  },

  template() {
    return (
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">Edit Particpant Address and Mailing Address</h4>
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
