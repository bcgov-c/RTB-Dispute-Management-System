/**
 * @fileoverview - Modal that displays a table containing notice service history
 */
import React from 'react';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import ServiceHistoryTable from './ServiceHistoryTable';
import './ServiceHistory.scss';

const ModalServiceAuditHistory = ModalBaseView.extend({
  id: 'modalServiceHistory-modal',
  /**
   * @param {ParticipantModel} participantModel - participant for which to display service history for 
   * @param {ServiceAuditCollection} serviceAuditCollection - Contains audit data
   */
  initialize(options) {
    this.mergeOptions(options, ['participantModel', 'serviceAuditCollection']);
    this.template = this.template.bind(this);
  },

  onRender() {
    this.showChildView('serviceHistory', new ServiceHistoryTable({ collection: this.serviceAuditCollection, serviceId: this.model.id }));
  },

  regions: {
    serviceHistory: '.service-history-table'
  },

  template() {
    return (
      <>
        <div className="modal-dialog">
          <div className="modal-content clearfix">
            <div className="modal-header">
              <h4 className="modal-title">Service History</h4>
              <div className="modal-close-icon-lg close-x"></div>
            </div>
            <div className="modal-body clearfix">
              <div className=""><label className="review-label">Service Type:</label>&nbsp;<span>{this.model.get('notice_id') ? `Notice (ID: ${this.model.get('notice_id')})` : `File Package (ID: ${this.model.get('file_package_id')})`}</span></div>
              <div className=""><label className="review-label">Service To:</label>&nbsp;<span>{this.participantModel.getDisplayName()}</span></div>
              <div className="service-history-table"></div>
            </div>
          </div>
        </div>
      </>
    );
  }
});

_.extend(ModalServiceAuditHistory.prototype, ViewJSXMixin);
export default ModalServiceAuditHistory;