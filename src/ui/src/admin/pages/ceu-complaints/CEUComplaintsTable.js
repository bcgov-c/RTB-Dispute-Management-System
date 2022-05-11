import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import CeuParticipant_model from '../../../core/components/custom-data-objs/ceu/CeuParticipant_model';
import Formatter from '../../../core/components/formatter/Formatter';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import './CEUComplaintsTable.scss';

const userChannel = Radio.channel('users');
const configChannel = Radio.channel('config');

const EmptyCEUItemView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="">No submitted CEU complaints match the search parameters.</div>`)
});

const CEUItemView = Marionette.View.extend({
  initialize() {
    this.template = this.template.bind(this);
    this.ceuData = this.model.getParsedJson() || {};

    const primaryApplicantData = [...(this.ceuData.submitters||[]), ...(this.ceuData.applicants||[])].find(p => p.p_is_primary_applicant);
    this.primaryApplicant = primaryApplicantData ? new CeuParticipant_model(primaryApplicantData) : null;

    this.CEU_URGENCY_EMERGENCY = configChannel.request('get', 'CEU_URGENCY_EMERGENCY');
    this.CEU_URGENCY_STANDARD = configChannel.request('get', 'CEU_URGENCY_STANDARD');
    this.CEU_URGENCY_DEFERRED = configChannel.request('get', 'CEU_URGENCY_DEFERRED');
    this.CEU_URGENCY_DISPLAY = configChannel.request('get', 'CEU_URGENCY_DISPLAY');
    this.CEU_STATUS_DISPLAY = configChannel.request('get', 'CEU_STATUS_DISPLAY') || {};
  },

  clickView() {
    this.collection.trigger('click:view', this.model);
  },

  getUrgencyClass() {
    const urgency = this.model.get('object_sub_status');

    if (urgency === this.CEU_URGENCY_EMERGENCY) return '--emergency';
    else if (urgency === this.CEU_URGENCY_STANDARD) return '--standard';
    else if (urgency === this.CEU_URGENCY_DEFERRED) return '--deferred';
    else return '';
  },

  template() {
    const fileNumber = this.model.get('reference_id') ? this.model.get('reference_id') : '-';
    const owner = this.model.get('owner_id') ? userChannel.request('get:user:name', this.model.get('owner_id')) || '-' : '-';
    const status = this.model.get('object_status') ? this.CEU_STATUS_DISPLAY[this.model.get('object_status')] || '-' : '-';
    const urgency = this.model.get('object_sub_status') ? this.CEU_URGENCY_DISPLAY[this.model.get('object_sub_status')] || '-' : '-';
    const submitter = this.primaryApplicant ? `${this.primaryApplicant.getTypeDisplay()}: ${this.primaryApplicant.getDisplayName()}` : '-';
    const units = this.ceuData.units || [];
    const contraventions = this.ceuData.contraventions || [];
    let uploads = [];
    let dmsFiles = [];
    units.forEach(unit => uploads.push(unit.r_tenancy_agreement_extfile_ids || []));
    contraventions.forEach(c => {
      (c.c_evidence || []).forEach(ev => {
        uploads.push(ev.e_evidence_extfile_ids || []);
      });
      dmsFiles.push(c.c_dms_file_numbers || []);
    });
    uploads = uploads.flat();
    dmsFiles = dmsFiles.flat();

    return (
      <div className="standard-list-item ceu-table">
        <div className="ceu-table__filenumber-column"><a className="ceu-table__filenumber-column__text" onClick={() => this.clickView()}>{fileNumber}</a></div>
        <div className="ceu-table__status-column">{status}</div>
        <div className="ceu-table__created-column">{Formatter.toDateDisplay(this.model.get('created_date'))}</div>
        <div className="ceu-table__submitter-column">{submitter}</div>
        <div className={`ceu-table__urgency-column${this.getUrgencyClass()}`}>{urgency}</div>
        <div className="ceu-table__units-column">{units.length}</div>
        <div className="ceu-table__contraventions-column">{contraventions.length}</div>
        <div className="ceu-table__uploads-column">{uploads.length}</div>
        <div className="ceu-table__files-column">{dmsFiles.length}</div>
        <div className="ceu-table__owner-column">{owner}</div>
      </div>
    )
  }
});

const CEUListView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: CEUItemView,
  emptyView: EmptyCEUItemView,

  childViewOptions(model, index) {
    return {
      collection: this.collection,
      index
    }
  }
});

const CEUComplaintsTable = Marionette.View.extend({
  regions: {
    ceuList: '.standard-list-items'
  },

  initialize(options) {
    this.template = this.template.bind(this);
    this.options = options;
  },

  onRender() {
    this.showChildView('ceuList', new CEUListView(this.options));
  },

  template() {
    return (
      <>
        <div className="standard-list-header ceu-table__header">
          <div className="ceu-table__filenumber-column">File Number</div>
          <div className="ceu-table__status-column">Intake Status</div>
          <div className="ceu-table__created-column">Intake Started</div>
          <div className="ceu-table__submitter-column">Submitted By</div>
          <div className="ceu-table__urgency-column">Urgency</div>
          <div className="ceu-table__units-column">Units</div>
          <div className="ceu-table__contraventions-column">Contraventions</div>
          <div className="ceu-table__uploads-column">Uploads</div>
          <div className="ceu-table__files-column">DMS Files</div>
          <div className="ceu-table__owner-column">CEU Owner</div>
        </div>
        <div className="standard-list-items"></div>
      </>
    )
  }
});

_.extend(CEUComplaintsTable.prototype, ViewJSXMixin);
_.extend(CEUItemView.prototype, ViewJSXMixin);

export default CEUComplaintsTable