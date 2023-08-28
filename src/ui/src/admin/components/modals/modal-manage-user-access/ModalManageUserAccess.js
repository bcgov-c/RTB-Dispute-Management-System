import React from 'react';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import RadioModel from '../../../../core/components/radio/Radio_model';
import RadioView from '../../../../core/components/radio/Radio';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';
import './ModalManageUserAccess.scss';

const ACTIVE_RADIO_VALUE = 1;
const INACTIVE_RADIO_VALUE = 0;

const disputeChannel = Radio.channel('dispute');
const loaderChannel = Radio.channel('loader');
const userChannel = Radio.channel('users');

const ModalManagerUserAccess = ModalBaseView.extend({
  id: 'manageUserAccess_modal',
  initialize(options) {
    this.template = this.template.bind(this);

    this.createSubModels();
  },

  createSubModels() {
    this.userActiveToggleModel = new RadioModel({
      optionData: [{ value: ACTIVE_RADIO_VALUE, text: 'Active (visible and accessible)' }, { value: INACTIVE_RADIO_VALUE, text: 'Inactive (not visible or accessible)' }],
      value: this.model.get('is_active') !== null ? Number(this.model.get('is_active')) : null,
    });
  },

  updateAccess() {
    loaderChannel.trigger('page:load');
    this.model.set({ is_active: this.userActiveToggleModel.getData() });
    this.model.save(this.model.getApiChangesOnly())
    .catch(() => generalErrorFactory.createHandler('ADMIN.USER.DISPUTE.ACCESS'))
    .always(() => {
      loaderChannel.trigger('page:load:complete');
      this.close();
    })
  },

  onRender() {
    this.showChildView('userActiveSelectRegion', new RadioView({ model: this.userActiveToggleModel }));
  },

  regions: {
    userActiveSelectRegion: '.manager-user-access__toggle'
  },

  template() {
    const disputeCreator = disputeChannel.request('get:dispute:creator');
    const creatorDisplay = disputeCreator ? userChannel.request('get:user', disputeCreator.get('system_user_id'))?.getObscuredUsername() : '-'

    return (
      <div className="manager-user-access">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Manage Access</h4>
              <div className="modal-close-icon-lg close-x" onClick={() => this.close()}></div>
            </div>
            <div className="modal-body clearfix manager-user-access">
              <span className="review-label">Login: </span><span><b>{creatorDisplay}</b></span>
              <p className="manager-user-access__description">
                You can turn off access to this dispute in the intake dispute list for the login that submitted this dispute by setting it to Inactive. 
                This will not effect participant access codes that are completely separate from this login account that submitted the initial application.
              </p>
              <div className="manager-user-access__toggle"></div>
              <div className="button-row">
                <div className="pull-right">
                  <button type="button" className="btn btn-lg btn-default btn-cancel" onClick={() => this.close()}><span>Cancel</span></button>
                  <button type="button" className="btn btn-lg btn-primary btn-continue" onClick={() => this.updateAccess()}>Update Access</button>
                </div>
              </div>
          </div>
          </div>
        </div>
      </div>
    );
  }
});

_.extend(ModalManagerUserAccess.prototype, ViewJSXMixin);
export default ModalManagerUserAccess;