import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import './ManageSubServiceTable.scss';

const participantsChannel = Radio.channel('participants');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');
const disputeChannel = Radio.channel('dispute');

const EmptySubServiceItemView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="">No substituted service requests available.</div>`)
});

const SubServiceItemView = Marionette.View.extend({
  initialize(options) {
    this.mergeOptions(options, ['activeRowSubServId']);
    this.template = this.template.bind(this);
    disputeChannel.request('get');
  },

  clickRow() {
    this.collection.trigger('change:selected:service', this.model);
  },

  template() {
    const serviceByParticipant = participantsChannel.request('get:participant', this.model.get('service_by_participant_id'));
    const serviceToParticipant = participantsChannel.request('get:participant', this.model.get('service_to_participant_id'));

    const serviceBy = serviceByParticipant ? `${serviceByParticipant.isLandlord() ? 'Landlord' : 'Tenant'} - ${serviceByParticipant.getDisplayName()}` : '-';
    const requestSource = this.model.get('request_source') ? configChannel.request('get','REQUEST_SOURCE_DISPLAY')[this.model.get('request_source')] : '-';
    const createdDate = this.model.get('created_date') ? Formatter.toDateDisplay(this.model.get('created_date')) : '-';
    const serviceTo = serviceToParticipant ? `${serviceToParticipant.isLandlord() ? 'Landlord' : 'Tenant'} - ${serviceToParticipant.getDisplayName()}` : '-';
    const docType = this.model.get('request_doc_type') ? this.model.getDocTypeDisplay() : '-';
    const requestStatus = this.model.get('request_status') ? configChannel.request('get', 'SUB_SERVICE_REQUEST_STATUS_DISPLAY')[this.model.get('request_status')] : '-';
    const requestStatusImgClass = this.model.getRequestStatusImgClass();

    return (
      <div className={`standard-list-item sub-serv-table__row${this.activeRowSubServId === this.model.id ? '--active' : ''}`} onClick={() => this.clickRow()}>
          <div className="sub-serv-table__requested-by">{serviceBy}</div>
          <div className="sub-serv-table__source">{requestSource}</div>
          <div className="sub-serv-table__requested-date">{createdDate}</div>
          <div className="sub-serv-table__service-to">{serviceTo}</div>
          <div className="sub-serv-table__documents">{docType}</div>
          <div className="sub-serv-table__status"><span>{requestStatus}</span>&nbsp;<div className={`sub-serv-table__status__img ${requestStatusImgClass}`}></div></div>
      </div>
    )
  }
});

_.extend(SubServiceItemView.prototype, ViewJSXMixin);

const SubServiceListView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: SubServiceItemView,
  emptyView: EmptySubServiceItemView,

  childViewOptions(model, index) {
    return {
      collection: this.options.collection,
      activeRowSubServId: this.options.activeRowSubServId,
      index
    }
  }
});

const ManageSubServiceTable = Marionette.View.extend({
  regions: {
    subServiceList: '.standard-list-items'
  },

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['collection', 'initSubServiceId']);
    this.activeRowSubServId = this.initSubServiceId || null;
  },

  setActiveRowSubServId(subServId) {
    this.activeRowSubServId = subServId;
  },

  onRender() {
    this.showChildView('subServiceList', new SubServiceListView({ activeRowSubServId: this.activeRowSubServId, collection: this.collection }))
  },

  template() {
    return (
      <>
        <div className="standard-list-header sub-serv-table__header">
          <div className="sub-serv-table__requested-by">Requested By</div>
          <div className="sub-serv-table__source">Source</div>
          <div className="sub-serv-table__requested-date">Requested Date</div>
          <div className="sub-serv-table__service-to">Service To</div>
          <div className="sub-serv-table__documents">Documents</div>
          <div className="sub-serv-table__status">Status</div>
        </div>
        <div className="standard-list-items"></div>
      </>
    )
  }
});

_.extend(ManageSubServiceTable.prototype, ViewJSXMixin);
export default ManageSubServiceTable