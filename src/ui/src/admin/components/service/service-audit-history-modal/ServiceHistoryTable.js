import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import ServiceHistoryDetailsIcon from '../../../static/Icon_ServiceHistoryDetails.png';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';

const userChannel = Radio.channel('users');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');
const participantChannel = Radio.channel('participants');

const EmptyServiceItemView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="">No service history available.</div>`)
});

const ServiceHistoryItem = Marionette.View.extend({
  ui: {
    detailsPopover: '.service-history-table__details-icon__popover',
  },

  initialize(options) {
    this.mergeOptions(options, ['serviceId']);
    this.template = this.template.bind(this);
  },

  onRender() {
    this.getUI('detailsPopover').popover();
  },

  onDestroy() {
    $('.popover').popover('hide');
  },

  getServiceDate() {
    const serviceDate = this.model.get('service_date');
    const isAcknowledged = !this.model.get('service_method') && !serviceDate && this.model.get('is_served');
    const isDeemed = serviceDate && this.model.get('received_date') && this.model.get('is_served');
    const isServed = !this.model.get('received_date') && serviceDate && this.model.get('is_served')
    if (isAcknowledged) return 'Acknowledged';
    else if (isDeemed) return `Deem: ${Formatter.toDateDisplay(serviceDate)}`;
    else if (isServed) return `Serve: ${Formatter.toDateDisplay(serviceDate)}`;
    else return '-';
  },

  getServiceTypeDisplay() {
    if (this.model.get('is_served') === false && this.model.get('service_change_type') === configChannel.request('get', 'SERVICE_AUDIT_HISTORY_TYPE_NOT_SERVED')) {
      return "Marked Not Served";
    } else if (this.model.get('is_served') === null && this.model.get('service_change_type') === configChannel.request('get', 'SERVICE_AUDIT_HISTORY_TYPE_NOT_SERVED')) {
      return "Service Info Removed";
    }
    
    return this.model.get('service_change_type') ? configChannel.request('get', 'SERVICE_AUDIT_TYPE_DISPLAY')[this.model.get('service_change_type')] : '-'
  },

  template() {
    const createdDate = this.model.get('created_date') ? Moment(this.model.get('created_date')).format('MMM DD, YYYY, h:mmA') : '-';
    const requestOwner = this.model.get('created_by') ?  userChannel.request('get:user:name', this.model.get('created_by')) : '-';
    const serviceTypeDisplay = this.getServiceTypeDisplay();
    const isServed = this.model.get('is_served') ? 'Yes' : this.model.get('is_served') === false ? 'No' : '-';
    const serviceDate = this.getServiceDate();
    const serviceMethod = this.model.get('service_method') ? Formatter.getServiceDeliveryMethods().find(method => method.value === String(this.model.get('service_method')))?.text : '-'; 
    const servedBy = this.model.get('served_by') ?  (participantChannel.request('get:participant', this.model.get('served_by')))?.getDisplayName() : '-';
    const proofIdDisplay = this.model.get('proof_file_description_id') ? this.model.get('proof_file_description_id') : '-';
    const otherProofIdDisplay = this.model.get('other_proof_file_description_id') ? this.model.get('other_proof_file_description_id') : '-'; 
    const validationStatus = this.model.get('validation_status') ? 
      Object.entries(configChannel.request('get', 'SERVICE_AUDIT_VALIDATION_STATUS_DISPLAY'))?.map(([key, value]) => ({ text: value, value: Number(key) }) )?.find(validation => validation.value === this.model.get('validation_status'))?.text : '-';
    const popoverContent = !this.model.get('service_description') && !this.model.get('service_comment') ? '-' 
    : `${this.model.get('service_description') ? `Service Description: ${this.model.get('service_description')}` : ''}${this.model.get('service_comment') ? `${this.model.get('service_description') ? '<br/><br/>' : ''}Internal Service Comment: ${this.model.get('service_comment')}` : ''}`;

    return (
      <div className="standard-list-item">
        <div className="service-history-table__action-date">{createdDate}</div>
        <div className="service-history-table__action-by">{requestOwner}</div>
        <div className="service-history-table__change">{serviceTypeDisplay}</div>
        <div className="service-history-table__record-id">{this.serviceId}</div>
        <div className="service-history-table__served">{isServed}</div>
        <div className="service-history-table__method">{serviceMethod}</div>
        <div className="service-history-table__date">{serviceDate}</div>
        <div className="service-history-table__served-by">{servedBy}</div>
        <div className="service-history-table__proof-id">{proofIdDisplay}/{otherProofIdDisplay}</div>
        <div className="service-history-table__validation-status">{validationStatus}</div>
        <div className="service-history-table__details-icon">
          <span className="service-history-table__details-icon__popover" tabIndex="-1" data-toggle="popover" data-container="body" data-placement="left" data-html="true" data-content={popoverContent}>
            <img className="service-history-table__details-icon__img" src={ServiceHistoryDetailsIcon} alt=""/>
          </span>
        </div>
      </div>
    )
  }
});

_.extend(ServiceHistoryItem.prototype, ViewJSXMixin);

const ServiceHistoryListView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: ServiceHistoryItem,
  emptyView: EmptyServiceItemView,

  childViewOptions(model, index) {
    return {
      collection: this.collection,
      index,
      serviceId: this.getOption('serviceId')
    }
  }
});

const ServiceHistoryTable = Marionette.View.extend({
  regions: {
    myScheduleList: '.standard-list-items'
  },

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options);
  },

  onRender() {
    this.showChildView('myScheduleList', new ServiceHistoryListView(this.options))
  },

  template() {
    return (
      <>
        <div className="standard-list-header service-history-table__header">
          <div className="service-history-table__action-date">Date of Action</div>
          <div className="service-history-table__action-by">Action By</div>
          <div className="service-history-table__change">Change</div>
          <div className="service-history-table__record-id">Record ID</div>
          <div className="service-history-table__served">Served?</div>
          <div className="service-history-table__method">Method</div>
          <div className="service-history-table__date">Date</div>
          <div className="service-history-table__served-by">Served By</div>
          <div className="service-history-table__proof-id">Proof Ids</div>
          <div className="service-history-table__validation-status">Validation</div>
        </div>
        <div className="standard-list-items"></div>
      </>
    )
  }
});

_.extend(ServiceHistoryTable.prototype, ViewJSXMixin);
export default ServiceHistoryTable