import React from 'react';
import Radio from 'backbone.radio';
import ModalBaseView from '../../../core/components/modals/ModalBase';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';

import './AddIssueModal.scss';


const TENANT_IN_UNIT_CODE = '0';

const AddIssueModal = ModalBaseView.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['issueData', 'addIssueCollection']);
    const { disputeProcess, act, applicantType, tenancyStatus } = this.issueData;
    this.configChannel = Radio.channel('config');
    this.modalChannel = Radio.channel('modals');
    this.claimsChannel = Radio.channel('claims');

    const DROPDOWN_CODE_HOME = String(this.configChannel.request('get', 'DISPUTE_TYPE_RTA'));;
    const LANDLORD_CODE = String(this.configChannel.request('get', 'DISPUTE_SUBTYPE_LANDLORD'));
    const DIRECT_REQUEST_CODE = String(this.configChannel.request('get', 'PROCESS_WRITTEN_OR_DR'));
    const REVIEW_HEARING_CODE = String(this.configChannel.request('get', 'PROCESS_REVIEW_HEARING'));
    const landlord_fee_recovery = String(this.configChannel.request('get', 'landlord_fee_recovery'));
    const tenant_fee_recovery = String(this.configChannel.request('get', 'tenant_fee_recovery'));

    this.globalClaimIds = [landlord_fee_recovery, tenant_fee_recovery];
    this.addIssueCollection = this.addIssueCollection ? this.addIssueCollection : {};
    this.isLandlord = applicantType.value === LANDLORD_CODE;
    this.isCurrent = tenancyStatus.value === TENANT_IN_UNIT_CODE;
    this.isRTA = act.value === DROPDOWN_CODE_HOME;
    this.isDR = disputeProcess.value === DIRECT_REQUEST_CODE;
    this.isReview = disputeProcess.value === REVIEW_HEARING_CODE;
    this.issueData = this.issueData ? this.issueData : {};
    this.createSubModals();
    this.setupListeners();
  },

  createSubModals() {
    this.addIssueModel = new DropdownModel({
      optionData: this.getIssueList(),
      labelText: "Issues to add",
      errorMessage: "Select an issue",
      required: true,
      defaultBlank: true,
      value: null,
    });
  },

  setupListeners() {
    this.listenTo(this.addIssueModel, 'change:value', (model) => {
      this.getUI('selectedIssue').text(model.getSelectedText());
      if (model.getData()) this.getUI('selectedIssueText').removeClass('hidden');
      else this.getUI('selectedIssueText').addClass('hidden');
    });

    this.listenTo(this.addIssueModel, 'change:value', this.render);
    this.listenTo(this.addIssueModel, 'remove', this.render);
  },

  getIssueList() {
    const dr_issues = this.configChannel.request('get', 'direct_request_issue_codes');
    const getClaimOptions = this.claimsChannel.request('get:claim:options', this.addIssueCollection, this.isRTA, this.isLandlord, this.isCurrent, null, true);
    
    if (this.isDR) {
      return getClaimOptions.filter((claim) => {
        return (dr_issues.includes(Number(claim.value)) || this.globalClaimIds.includes(claim.value));
      })
    } else if (!this.isReview) {
      return getClaimOptions.filter(claim => {
        return !dr_issues.includes(Number(claim.value));
      });
    } else {
      return getClaimOptions;
    }
  },

  save() {
    if(!this.addIssueModel.getData()) {
      this.getChildView('addIssueDropdownRegion').validateAndShowErrors()
      return;
    }
    this.addIssueCollection.add(this.addIssueModel);
    this.trigger('issue:added', this.addIssueCollection);
    this.modalChannel.request('remove', this);
  },

  /* Marionette Methods */

  className: 'modal fade modal-rtb-default',
  id: "add-issue-modal",
  regions: {
    addIssueDropdownRegion: '.addIssue-modal__add-issue'
  },

  ui() {
    return Object.assign({}, ModalBaseView.prototype.ui, {
      selectedIssue: '.addIssue-modal__properties__selected-issue',
      selectedIssueText:'#selectedIssueText'
    });
  },

  onRender() {
    this.showChildView('addIssueDropdownRegion', new DropdownView({ model: this.addIssueModel }));
  },

  template() {
    const { disputeProcess, act, applicantType, tenancyStatus,  } = this.issueData;
    return (
      <div className="modal-dialog">
        <div className="modal-content clearfix">

          <div className="modal-header">
            <h4 className="modal-title">Add Issue</h4>
            <div className="modal-close-icon-lg close-x"></div>
          </div>

          <div className="modal-body clearfix">
            <div className="addIssue-modal">
              <div className="addIssue-modal__properties">
                <span className="addIssue-modal__properties__title">Dispute Process: </span>
                <span className="addIssue-modal__properties__value">{disputeProcess.text}</span>
              </div>
              <div className="addIssue-modal__properties">
                <span className="addIssue-modal__properties__title">Act: </span>
                <span>{act.text}</span>
              </div>
              <div className="addIssue-modal__properties">
                <span className="addIssue-modal__properties__title">Applicant Type: </span>
                <span>{applicantType.text}</span>
              </div>
              <div className="addIssue-modal__properties">
                <span className="addIssue-modal__properties__title">Tenancy Status: </span>
                <span>{tenancyStatus.text}</span>
              </div>
              <div className="addIssue-modal__add-issue"></div>
              <div className="addIssue-modal__properties">
                <span className="addIssue-modal__properties__title hidden" id="selectedIssueText">Full selected issue text: </span>
                <span className="addIssue-modal__properties__selected-issue"></span>
              </div>
              <div className="addIssue-modal__buttons">
                <button type="button" className="btn btn-lg btn-default btn-cancel"> Cancel </button>
                <button type="button" className="btn btn-lg btn-primary btn-continue" onClick={() => this.save()}> Add Issue </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
});
_.extend(AddIssueModal.prototype, ViewJSXMixin);
export { AddIssueModal }