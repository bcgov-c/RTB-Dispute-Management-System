/**
 * @class core.components.dispute.DisputeModel
 * @memberof core.components.dispute
 * @augments core.components.model.CMModel
 */

import Backbone from 'backbone';
import CMModel from '../model/CM_model';
import Radio from 'backbone.radio';
import DisputeStatusModel from './DisputeStatus_model';
import Formatter from '../../components/formatter/Formatter';

const dispute_api_name = 'dispute';
const create_api_name = 'newdispute';
const STATUS_ID_ATTR = 'dispute_status_id';

const modalChannel = Radio.channel('modals');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');

export default CMModel.extend({
  idAttribute: 'dispute_guid',
  defaults: {
    dispute_id: null,
    file_number: null,
    dispute_guid: null,
    dispute_type: null,
    dispute_sub_type: null,
    dispute_urgency: null,
    dispute_complexity: null,
    is_amended: false,
    initial_payment_by: null,
    initial_payment_date: null,
    initial_payment_method: null,
    tenancy_address: null,
    tenancy_city: null,
    tenancy_country: null,
    tenancy_zip_postal: null,
    tenancy_ended: null,
    tenancy_end_date: null,
    tenancy_start_date: null,
    tenancy_geozone_id: null,
    tenancy_agreement_date: null,
    tenancy_agreement_signed_by: null,
    cross_app_dispute_guid: null,
    cross_app_file_number: null,
    cross_app_role: null,
    migration_source_of_truth: null,
    rent_payment_interval: null,
    rent_payment_amount: null,
    tenancy_unit_type: null,
    tenancy_unit_text: null,
    security_deposit_amount: null,
    pet_damage_deposit_amount: null,
    original_notice_date: null,
    original_notice_delivered: null,
    original_notice_id: null,
    files_storage_setting: null,

    created_date: null,
    creation_method: null,
    submitted_date: null,
    submitted_by: null,
    modified_date: null,
    modified_by: null,

    // This value is not for an API update, but to hold Question objects
    questionCollection: null,

    // Fields used to save dispute UI state across pages and page loads
    sessionSettings: {
      hearingToolsEnabled: false,
      thumbnailsEnabled: false,
      notConsideredEvidence: false,
      taskPage: {
        filter_taskType: null,
        sortBy: null
      },
      evidencePage: {
        filter_viewType: null,
        hideRemoved: false,
        hideDups: false,
        hideNotReferenced: false,
        hideNotConsidered: false,
        hideNotes: false,
        showSubmitterName: false,
      },
      communicationPage: {
        filter_noteType: null,
        filter_noteCreatedBy: null,
        filter_emailType: null
      },
    },

    editInProgress: null,
    wasLoaded: false,

    /*
    {
      dispute_stage
      dispute_status
      dispute_status_id
      duration_seconds
      evidence_override
      owner
      process
      status_note
      status_set_by
      status_start_date
    }
    */
  },

  API_SAVE_ATTRS: [
    'dispute_type',
    'dispute_sub_type',
    'dispute_urgency',
    'dispute_complexity',
    'is_amended',
    'submitted_date',
    'submitted_by',
    'initial_payment_by',
    'initial_payment_date',
    'initial_payment_method',
    'tenancy_address',
    'tenancy_city',
    'tenancy_country',
    'tenancy_zip_postal',
    'tenancy_ended',
    'tenancy_end_date',
    'tenancy_start_date',
    'tenancy_geozone_id',
    'tenancy_agreement_date',
    'tenancy_agreement_signed_by',
    'tenancy_unit_type',
    'tenancy_unit_text',
    'cross_app_file_number',
    'cross_app_role',
    'migration_source_of_truth',
    'rent_payment_interval',
    'rent_payment_amount',
    'security_deposit_amount',
    'pet_damage_deposit_amount',
    
    'original_notice_date',
    'original_notice_delivered',
    'original_notice_id',
    'creation_method'
  ],

  /**
   * Custom attributes list for saving status
   * @prop {array} API_STATUS_ATTRS
   */
  API_STATUS_ATTRS: [
    'dispute_stage',
    'dispute_status',
    'duration_seconds',
    'evidence_override',
    'owner',
    'process',
    'status_note',
    'status_set_by',
    'status_start_date'
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${dispute_api_name}/${this.isNew() ? create_api_name : ''}`;
  },

  initialize() {
    CMModel.prototype.initialize.call(this, ...arguments);

    this.DISPUTE_CREATION_METHOD_ETL_SP = configChannel.request('get', 'DISPUTE_CREATION_METHOD_ETL_SP') || {};
    this.DISPUTE_MIGRATION_TRUTH_CMS = configChannel.request('get', 'DISPUTE_MIGRATION_TRUTH_CMS') || {};
  },

  getPageApiDataAttrs() {
    const pageApiData = CMModel.prototype.getPageApiDataAttrs.call(this);
    return _.extend(pageApiData, {
      status: _.pick(this.toJSON().status, [...this.API_STATUS_ATTRS, ...[STATUS_ID_ATTR]])
    });
  },


  isLandlord() {
    return this.get('dispute_sub_type') === configChannel.request('get', 'DISPUTE_SUBTYPE_LANDLORD');
  },

  isTenant() {
    return this.get('dispute_sub_type') === configChannel.request('get', 'DISPUTE_SUBTYPE_TENANT');
  },

  isMHPTA() {
    return this.get('dispute_type') === configChannel.request('get', 'DISPUTE_TYPE_MHPTA');
  },

  isPastTenancy() {
    // NOTE: This will not check the current status of the page question relating to tenancy end
    return this.get('tenancy_ended');
  },

  isUrgent() {
    return this.get('dispute_urgency') === configChannel.request('get', 'DISPUTE_URGENCY_EMERGENCY');
  },
  
  isPostNotice() {
    return this.get('original_notice_date') && this.get('original_notice_delivered') &&
            !Moment().isBefore(Moment(this.get('original_notice_date')));
  },

  hasDeposit() {
    return this.get('security_deposit_amount') || this.get('pet_damage_deposit_amount');
  },

  hasSecurityDeposit() {
    return this.get('security_deposit_amount');
  },

  hasPetDeposit() {
    return this.get('pet_damage_deposit_amount');
  },

  _getStatusObj() {
    const status = this.get('status');
    return  status && !_.isEmpty(status) ? status : null;
  },

  getStatus() {
    const status_obj = this._getStatusObj();
    return status_obj ? status_obj.dispute_status : null;
  },

  getStage() {
    const status_obj = this._getStatusObj();
    return status_obj ? status_obj.dispute_stage : null;
  },

  getProcess() {
    const status_obj = this._getStatusObj();
    return status_obj ? status_obj.process : null;
  },

  getOwner() {
    const status_obj = this._getStatusObj();
    return status_obj ? status_obj.owner : null;
  },

  getStatusComment() {
    const status_obj = this._getStatusObj();
    return status_obj ? status_obj.status_note : null;
  },

  getOverride() {
    const status_obj = this._getStatusObj();
    return status_obj ? status_obj.evidence_override : null;
  },

  isPaymentState() {
    const stage = this.getStage(),
      status = this.getStatus(),
      stage_status = `${stage}:${status}`;
    return _.has(configChannel.request('get', 'STAGE_STATUS_PAYMENT'), stage_status);
  },

  isReviewOnlyState() {
    const stage = this.getStage();
    return stage && (stage !== configChannel.request('get', 'STAGE_APPLICATION_IN_PROGRESS'));
  },

  isCreatedIntake() {
    return this.get('creation_method') === configChannel.request('get', 'DISPUTE_CREATION_METHOD_INTAKE');
  },

  isCreatedExternal() {
    return this.get('creation_method') === configChannel.request('get', 'DISPUTE_CREATION_METHOD_MANUAL');
  },

  isUnitType() {
    return this.isCreatedAriC() || this.isCreatedPfr();
  },

  isCreatedRentIncrease() {
    return this.isCreatedAriE() || this.isCreatedAriC();
  },

  isCreatedAriC() {
    return this.get('creation_method') === configChannel.request('get', 'DISPUTE_CREATION_METHOD_ARI_C');
  },

  isCreatedAriE() {
    return this.get('creation_method') === configChannel.request('get', 'DISPUTE_CREATION_METHOD_ARI_E');
  },

  isCreatedPfr() {
    return this.get('creation_method') === configChannel.request('get', 'DISPUTE_CREATION_METHOD_PFR');
  },

  isCreatedPaper() {
    return this.isCreatedExternal() || this.isCreatedAriE();
  },

  isSourceOfTruthCms() {
    return this.get('migration_source_of_truth') === this.DISPUTE_MIGRATION_TRUTH_CMS;
  },

  isMigrated() {
    return this.get('creation_method') === this.DISPUTE_CREATION_METHOD_ETL_SP || this.get('migration_source_of_truth') === this.DISPUTE_MIGRATION_TRUTH_CMS;
  },

  isSubmitted() {
    return !!this.get('submitted_date');
  },

  getFullAddressString(options={}) {
    return [
      ...options.withoutAddress ? [] : $.trim(this.get('tenancy_address')),
      $.trim(this.get('tenancy_city')),
      $.trim(this.get('tenancy_country')),
      $.trim(this.get('tenancy_zip_postal'))
    ].join(', ');
  },

  getAddressString() {
    if (!this.get('tenancy_address') || !this.get('tenancy_zip_postal')) {
      return null;
    }
    return `${this.get('tenancy_address')} ${this.get('tenancy_zip_postal')}`;
  },

  getAddressStringWithUnit() {
    const unitTypeToDisplay = this.getDisputeUnitTypeDisplay();
    return `${unitTypeToDisplay ? `(${unitTypeToDisplay}) ` : ''}${this.getAddressString()}`;
  },

  getDisputeUnitTypeDisplay() {
    return Formatter.toUnitTypeDisplay(this.get('tenancy_unit_type'), this.get('tenancy_unit_text'));
  },

  checkAndUpdateInitialPayment(payment_data) {
    if (this.get('initial_payment_date')) {
      return $.Deferred().resolve().promise();
    }

    return this.save(_.extend({
      initial_payment_date: Moment().toISOString()
    }, payment_data));
  },

  // Returns true if DisputeModel has a stage and status in the list of stages and statuses passed in
  checkProcess(processes) {
    if (_.isNumber(processes)) {
      processes = [processes];
    }
    return _.contains(processes, this.getProcess());
  },

  // Returns true if DisputeModel has a stage and status in the list of stages and statuses passed in
  checkStageStatus(stages, statuses) {
    if (_.isNumber(stages)) {
      stages = [stages];
    }
    if (_.isNumber(statuses)) {
      statuses = [statuses];
    }
    return _.contains(stages, this.getStage()) && _.contains(statuses, this.getStatus());
  },

  startEditInProgress(editModel) {
    this.set('editInProgress', editModel || true, { silent: true });
  },

  stopEditInProgress() {
    this.set('editInProgress', null, { silent: true });
  },

  // Returns true if the model is the current edit target
  checkEditInProgressModel(model) {
    return model && model === this.get('editInProgress');
  },

  // Rejects if there is an edit in progress.
  checkEditInProgressPromise() {
    return new Promise((resolve, reject) => {
      if (this.get('editInProgress')) {
        reject();
      } else {
        resolve();
      }
    });
  },

  showEditInProgressModalPromise(enableContinue=false) {
    const modalClassName = 'modal-edit-in-progress';
    return new Promise((resolve, reject) => {
      if ($(document).find(`.${modalClassName}:visible`).length) {
        // We are already showing a warning, no need for another
        reject();
        return;
      }
      loaderChannel.trigger('page:load:complete');
      const modalView = modalChannel.request('show:standard', {
        modalCssClasses: modalClassName,
        title: 'Current Edit In Progress',
        bodyHtml: `<p>You have an edit in progress, please cancel or save that edit to continue.</p>`,
        primaryButtonText: enableContinue ? 'Discard Changes and Continue' : 'Close',
        hideCancelButton: !enableContinue,
        onContinueFn: _modalView => {
          if (enableContinue) {
            resolve(true);
          }
          _modalView.close(); 
        }
      });
      this.listenTo(modalView, 'removed:modal', () => {
        resolve(false);
      }, this);
    });
  },

  saveStatus(attrs) {
    const dfd = $.Deferred(),
      self = this;

    const existing_status = _.pick(this._getStatusObj(), this.API_STATUS_ATTRS);
    const statusModel = new DisputeStatusModel(_.extend(
      { dispute_guid: this.id },
      existing_status,
      attrs
    ));
    statusModel.save().done(function(status_response) {
      self.set('status', status_response);
      _.extend(self.get('_originalData'), { status: status_response });
      dfd.resolve(status_response);
    }).fail(dfd.reject);

    return dfd.promise();
  },

  triggerPageRefresh() {
    this.set('wasLoaded', false);
    Backbone.history.loadUrl(Backbone.history.fragment);
  },

  isViewOnlyStageStatus() {
    return this.checkStageStatus(0, [1, 6, 94]);
  },

  isBlockedStageStatus() {
    return this.checkStageStatus(0, [0, 5, 99]);
  },

  /**
   * Whether or not the process is meant to be used with a Hearing&Notice, or a Notice only
   */
  isHearingRequired() {
    const processCodesRequiringHearing = [
      'PROCESS_ORAL_HEARING',
      'PROCESS_REVIEW_REQUEST',
      'PROCESS_REVIEW_HEARING',
      'PROCESS_JOINER_REQUEST',
      'PROCESS_JOINER_HEARING',
      'PROCESS_RENT_INCREASE',
    ];
    const process = this.getProcess();
    return process && processCodesRequiringHearing.map(code => configChannel.request('get', code)).includes(Number(process));
  },

  isNonParticipatory() {
    return this.getProcess() === configChannel.request('get', 'PROCESS_WRITTEN_OR_DR');
  },

  /* Cross App functionality on a dispute is deprecated, do not use these methods.  To be cleaned up when decision composer cleaned up. */
  isCrossApp() {
    return false;
  },

  isCrossAppParent() {
    return false;
  },

  isCrossAppChild() {
    return false;
  }
});
