import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';

const participantsChannel = Radio.channel('participants');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');

const EmptySubServCCRItemView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="">No items available.</div>`)
});

const MyScheduleItem = Marionette.View.extend({
  initialize(options) {
    this.mergeOptions(options, ['activeRowId', 'isSubService']);
    this.template = this.template.bind(this);
  },

  clickRow() {
    this.collection.trigger('click:row', this.model.id);
  },

  template() {
    if (this.isSubService) {
      return this.renderJsxSubServ();
    } else {
      return this.renderJsxCCR();
    }
  },

  renderJsxSubServ() {
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
      <div className={`standard-list-item sub-serv-ccr-table__row${this.activeRowId === this.model.id ? '--active' : ''}`} onClick={() => this.clickRow()}>
        <div className="sub-serv-ccr-table__requested-by-column">{serviceBy}</div>
        <div className="sub-serv-ccr-table__source-column">{requestSource}</div>
        <div className="sub-serv-ccr-table__requested-date-column">{createdDate}</div>
        <div className="sub-serv-ccr-table__service-to-column">{serviceTo}</div>
        <div className="sub-serv-ccr-table__documents-column">{docType}</div>
        <div className="sub-serv-ccr-table__status-column">{requestStatus}&nbsp;<div className={`sub-serv-ccr-table__status__img ${requestStatusImgClass}`}></div></div>
      </div>
    );
  },

  renderJsxCCR() {
    const serviceByParticipant = participantsChannel.request('get:participant', this.model.get('submitter_id'));
    const serviceBy = serviceByParticipant ? `${serviceByParticipant.isLandlord() ? 'Landlord' : 'Tenant'} - ${serviceByParticipant.getDisplayName()}` : '-';
    const requestSource = this.model.isSourceOffice() ? 'Paper' : 'Online';
    const createdDate = this.model.get('request_date') ? Formatter.toDateDisplay(this.model.get('request_date')) : '-';
    const associatedDocuments = this.model.getUploadedFiles()?.length ? this.model.getUploadedFiles()?.length : '-';
    const requestItemCount = this.model.getRequestItems()?.length;
    const requestStatus = this.model.get('request_status') ? configChannel.request('get', 'OUTCOME_DOC_REQUEST_STATUS_DISPLAY')[this.model.get('request_status')] : '-';

    return (
      <div className={`standard-list-item sub-serv-ccr-table__row${this.activeRowId === this.model.id ? '--active' : ''}`} onClick={() => this.clickRow()}>
        <div className="sub-serv-ccr-table__requested-by-column">{serviceBy}</div>
        <div className="sub-serv-ccr-table__source-column">{requestSource}</div>
        <div className="sub-serv-ccr-table__requested-date-column">{createdDate}</div>
        <div className="sub-serv-ccr-table__service-to-column">{associatedDocuments}</div>
        <div className="sub-serv-ccr-table__documents-column">{requestItemCount}</div>
        <div className="sub-serv-ccr-table__status-column">{requestStatus}</div>
      </div>
    );
  }
});

_.extend(MyScheduleItem.prototype, ViewJSXMixin);

const SubServCCRListView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: MyScheduleItem,
  emptyView: EmptySubServCCRItemView,

  childViewOptions(model, index) {
    return {
      collection: this.collection,
      index,
      activeRowId: this.getOption('activeRowId'),
      isSubService: this.getOption('isSubService')
    }
  }
});

const SubServCCRTable = Marionette.View.extend({
  regions: {
    subServCCRList: '.standard-list-items'
  },

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['collection', 'initSubServiceId', 'isSubService']);

    this.activeRowId = this.initSubServiceId || null;
  },

  setActiveRowId(rowId) {
    this.activeRowId = rowId;
  },

  onRender() {
    this.showChildView('subServCCRList', new SubServCCRListView({ activeRowId: this.activeRowId, collection: this.collection, isSubService: this.isSubService }));
  },

  selectRequest() {
    this.collection.trigger('select:request', this.activeRowId);
  },

  template() {
    return (
      <>
        <div className="standard-list-header sub-serv-ccr-table__table-header">
          <div className="sub-serv-ccr-table__requested-by-column">Requested By</div>
          <div className="sub-serv-ccr-table__source-column">Source</div>
          <div className="sub-serv-ccr-table__requested-date-column">Request Date</div>
          <div className="sub-serv-ccr-table__service-to-column">{this.isSubService ? 'Service To' : 'Associated Documents' }</div>
          <div className="sub-serv-ccr-table__documents-column">{ this.isSubService ? 'Documents' : 'Items' }</div>
          <div className="sub-serv-ccr-table__status-column">Status</div>
        </div>
        <div className="standard-list-items"></div>
        { this.collection.length ? <div className="sub-serv-ccr-table__use-request">
          <button type="button" className="btn btn-lg btn-default btn-primary btn-upload" onClick={() => this.selectRequest()}>
            <span>Use Selected Request</span>
          </button>
        </div> : null }
      </>
    )
  }
});

_.extend(SubServCCRTable.prototype, ViewJSXMixin);
export default SubServCCRTable;