import React from 'react';
import Radio from 'backbone.radio';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import { ModalQuickAccess } from '../../../components/quick-access';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';
import './ModalAutoAssignUnassignedDispute.scss';

const disputeChannel = Radio.channel('dispute');
const statusChannel = Radio.channel('status');
const sessionChannel = Radio.channel('session');
const modalChannel = Radio.channel('modals');

const ModalAutoAssignUnassignedDispute = ModalBaseView.extend({
  id: 'assign-dispute_modal',

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['nextStage', 'nextStatus']);
    this.dispute = disputeChannel.request('get');
    this.stageObj = statusChannel.request('get:stage', this.nextStage);
    this.statusObj = statusChannel.request('get:status', this.nextStatus);
    this.ownerModel = sessionChannel.request('get:user');
    this.createSubModels();
  },

  createSubModels() {
    this.stageModel = new DropdownModel({
      labelText: 'Stage',
      disabled: true,
      optionData: [{ value: this.stageObj.id, text: this.stageObj.title }],
      required: true,
      value: this.stageObj.id
    });

    this.statusModel = new DropdownModel({
      labelText: 'Status',
      disabled: true,
      optionData: [{ value: this.statusObj.id, text: this.statusObj.title }],
      required: true,
      value: this.statusObj.id
    });

    this.ownerModel = new DropdownModel({
      labelText: 'Owner',
      disabled: true,
      optionData: [{ value: this.ownerModel.id, text: this.ownerModel.get('name') }],
      required: true,
      value: this.ownerModel.id
    });
  },

  clickQuickStatus() {
    this.close();
    setTimeout(() => {
      modalChannel.request('add', new ModalQuickAccess({
        model: this.dispute,
        quickStatusOnly: true
      }));
    }, 25);
  },

  assignDispute() {
    const statusChanges = Object.assign({
      dispute_guid: this.dispute.id,
      dispute_stage: this.nextStage,
      dispute_status: this.nextStatus,
      owner: this.ownerModel.getData(),
      process: this.dispute.getProcess(),
    })

    this.dispute.saveStatus(statusChanges).fail((err) => {
      const handler = generalErrorFactory.createHandler('STATUS.SAVE', () => this.model.trigger('save:complete'));
      handler(err);
    })
    .always(() => {
      this.close();
      this.trigger('save:completed');
    })
  },

  onRender() {
    this.showChildView('stageRegion', new DropdownView({ model: this.stageModel }));
    this.showChildView('statusRegion', new DropdownView({ model: this.statusModel }));
    this.showChildView('ownerRegion', new DropdownView({ model: this.ownerModel }));
  },

  regions: {
    stageRegion: '.assign-dispute__stage',
    statusRegion: '.assign-dispute__status',
    ownerRegion: '.assign-dispute__owner',
  },

  template() {
    const hasQuickStatusOptions = statusChannel.request('get:rules:quickstatus', this.dispute).length;

    return (
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">Assign Dispute?</h4>
            <div className="modal-close-icon-lg close-x" onClick={() => this.close()}></div>
          </div>
          <div className="modal-body">
            <p>
              You appear to be the arbitrator that is associated to this dispute's hearing - but this dispute is not currently
              assigned to you. If this is your dispute file please assign it to yourself. If this is not your dispute file, press 'Cancel'
          </p>
          <p className="assign-dispute__current-state">
            <div><span className="assign-dispute__stage-label">Stage:</span> {statusChannel.request('get:stage:display', this.dispute.getStage())}</div>
            <div><span className="assign-dispute__status-label">Status:</span> {statusChannel.request('get:status:display', this.dispute.getStatus())}</div>
          </p>
          <div className="assign-dispute__assign-dropdowns">
            <div className="assign-dispute__stage"></div>
            <div className="assign-dispute__status"></div>
            <div className="assign-dispute__owner"></div>
          </div>
          <div className="button-row">
            <div className="float-right">
              { hasQuickStatusOptions ? <button type="button" className="btn btn-lg btn-default btn-primary btn-quickstatus" onClick={() => this.clickQuickStatus()}>Open Quick Status</button> : null }
              <button type="button" className="btn btn-lg btn-default btn-cancel" onClick={() => this.close()}><span>Cancel</span></button>
              <button type="button" className="btn btn-lg btn-primary btn-continue" onClick={() => this.assignDispute()}><span>Save</span></button>
            </div>
          </div>
          </div>
        </div>
      </div>
    );
  }
});

_.extend(ModalAutoAssignUnassignedDispute.prototype, ViewJSXMixin);
export default ModalAutoAssignUnassignedDispute