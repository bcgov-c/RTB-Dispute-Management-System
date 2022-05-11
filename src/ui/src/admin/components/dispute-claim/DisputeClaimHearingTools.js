import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import InputView from '../../../core/components/input/Input';
import InputModel from '../../../core/components/input/Input_model';
import RadioView from '../../../core/components/radio/Radio';
import RadioModel from '../../../core/components/radio/Radio_model';
import ClaimOutcomeUserIcon from '../../static/Icon_ArbOutcomes_WHT.png';
import template from './DisputeClaimHearingTools_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

let UAT_TOGGLING = {};
const INCLUDE_RADIO_CODE = 1;
const REMOVE_RADIO_CODE = 2;
const AWARDED_DROPDOWN_CODE = '1';
const DISMISS_DROPDOWN_CODE = '2';
const SETTLED_DROPDOWN_CODE = '3';
const NO_JURISDICTION_DROPDOWN_CODE = '4';
const AMEND_DROPDOWN_CODE = '5';
const SEVER_DROPDOWN_CODE = '6';
const NOT_DECIDED_DROPDOWN_CODE = '7';
const AWARDED_DATE_TYPE_2_DAYS_DROPDOWN_CODE = '1';
const AWARDED_DATE_TYPE_SPECIFIC_DROPDOWN_CODE = '2';
const AWARDED_DATE_TYPE_OTHER_DROPDOWN_CODE = '3';

const disputeChannel = Radio.channel('dispute');
const configChannel = Radio.channel('config');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
  
export default Marionette.View.extend({
  template,
  className: 'hearing-tools-container',
  
  ui: {
    outcomeDisplay: '.claim-outcome-container',
    edit: '.hearing-tools-edit',
    cancel: '.hearing-tools-save-controls-cancel',
    save: '.hearing-tools-save-controls-save',
    clearOutcome: '.hearing-tools-clear-outcome'
  },

  regions: {
    issueOptionsRegion: '.hearing-tools-issue-options',
    detailsRegion: '.hearing-tools-outcome-details',

    includeOutcomeRegion: '.hearing-tools-include-outcome',
    includeAwardAmountRegion: '.hearing-tools-award-amount',
    includeAwardDateTypeRegion: '.hearing-tools-award-date-type',
    includeAwardDateRegion: '.hearing-tools-award-date-specific',
    dismissOptionsRegion: '.hearing-tools-dismiss-options',

    removeOutcomeRegion: '.hearing-tools-remove-outcome',
    amendOptionsRegion: '.hearing-tools-amend-options',
    severOptionsRegion: '.hearing-tools-sever-options',
  },

  events: {
    'click @ui.outcomeDisplay': 'clickBody',
    'click @ui.edit': 'clickEdit',
    'click @ui.clearOutcome': 'clickClearOutcome',
    'click @ui.cancel': 'clickCancel',
    'click @ui.save': 'clickSave'
  },

  clickBody() {
    if (this.mode === 'claim-view') {
      this.clickEdit();
    }
  },

  clickEdit() {
    if (!this.disputeModel) {
      this.renderInEditMode();
      return;
    }

    this.disputeModel.checkEditInProgressPromise().then(
      () => {
        const isDisputeReviewProcess = this.disputeModel.checkProcess(configChannel.request('get', 'PROCESS_REVIEW_HEARING'));
        const remedyModel = this.remedyModel || this.disputeClaimModel.getApplicantsRemedy();
        const hasOutcome = remedyModel && remedyModel.hasOutcome();
        const hasAlreadyBeenReviewed = remedyModel && remedyModel.isReviewed();

        if (isDisputeReviewProcess && hasOutcome && !hasAlreadyBeenReviewed) {
          modalChannel.request('show:standard', {
            title: 'Confirm Issue Outcome Change',
            bodyHtml: `<p>You are changing an issue outcome recorded prior to this review hearing. To preserve the original issue outcome, it will be stored separately as a previous issue outcome, and a new empty outcome will be created to record the change to the original decision.</p>
            <p>This action cannot be undone. Are you sure you want to record a new outcome for this issue? To return to the DMS without adding a new issue outcome click 'Cancel'. To continue and add a new outcome for this issue click 'Add New Outcome'.</p>`,
            primaryButtonText: 'Add New Outcome',
            onContinueFn: (modalView) => {
              modalView.close();
              loaderChannel.trigger('page:load');
              remedyModel.saveAsReviewed(this.disputeClaimModel).then(() => {
                this.disputeClaimModel.trigger('contextRender:edit');
              }).finally(() => setTimeout(() => loaderChannel.trigger('page:load:complete'), 100));
            }
          });
        } else {
          this.renderInEditMode();
        }
      },
      () => {
        this.disputeModel.showEditInProgressModalPromise()
      });
  },

  clickClearOutcome() {
    modalChannel.request('show:standard', {
      title: 'Confirm Outcome Reset',
      bodyHtml: `<p>Are you sure you want to clear the issue outcomes from the following issue?</p>
        <p><b>${this.disputeClaimModel.getClaimTitleWithCode()}</b></p>
        <p>This action is permanent and cannot be undone.</p>`,
      primaryButtonText: 'Clear Outcome Information',
      onContinue: (modalView) => {
        const onFinishFn = () => {
          this.reinitialize();
          this.disputeClaimModel.trigger('hearingTools:save');
          loaderChannel.trigger('page:load:complete'); 
        };
        modalView.close();
        loaderChannel.trigger('page:load');

        if (!this.remedyModel) return onFinishFn();
        
        this.remedyModel.clearOutcome();
        this.remedyModel.save(this.remedyModel.getApiChangesOnly())
          .fail(generalErrorFactory.createHandler('ADMIN.REMEDY.SAVE'))
          .always(() => onFinishFn())
      },
    });
  },

  clickCancel() {
    this.reinitialize(); 
    this.renderInViewMode();
  },

  clickSave() {
    if (this.validateAndShowErrors()) {
      this.saveOutcome();
    }
  },

  initialize(options) {
    this.mergeOptions(options, ['mode', 'disputeClaimModel', 'remedyModel']);
    UAT_TOGGLING = configChannel.request('get', 'UAT_TOGGLING') || {};

    if (!this.disputeClaimModel || !this.remedyModel) {
      console.log(`[Error] DisputeClaimModel or RemedyModel is required`);
      return;
    }

    this.disputeModel = disputeChannel.request('get');
    this.AWARD_DETAILS_MAX_LENGTH = configChannel.request('get', 'AWARD_DETAILS_MAX_LENGTH');
    this.REMEDY_STATUS_REASONS_DISPLAY = configChannel.request('get', 'REMEDY_STATUS_REASONS_DISPLAY');
    this.REMEDY_SUB_STATUS_REAPPLY = configChannel.request('get', 'REMEDY_SUB_STATUS_REAPPLY');
    this.REMEDY_SUB_STATUS_NO_REAPPLY = configChannel.request('get', 'REMEDY_SUB_STATUS_NO_REAPPLY')


    this.remedyStatusConfigs = Object.fromEntries([
      'REMEDY_STATUS_NOT_SET',
      'REMEDY_STATUS_POSSESSION_GRANTED_2DAY',
      'REMEDY_STATUS_POSSESSION_GRANTED_SPECIFIC_DATE',
      'REMEDY_STATUS_POSSESSION_GRANTED_OTHER_DATE',
      'REMEDY_STATUS_MONETARY_GRANTED',
      'REMEDY_STATUS_OTHER_ISSUE_GRANTED',
      'REMEDY_STATUS_DISMISSED_WITH_LEAVE',
      'REMEDY_STATUS_DISMISSED_NO_LEAVE',
      'REMEDY_STATUS_SETTLED',
      'REMEDY_STATUS_SETTLED_MONETARY',
      'REMEDY_STATUS_SETTLED_POSSESSION_2DAY',
      'REMEDY_STATUS_SETTLED_POSSESSION_SPECIFIC_DATE',
      'REMEDY_STATUS_SETTLED_POSSESSION_OTHER_DATE',
      'REMEDY_STATUS_NO_JURISDICTION',
      'REMEDY_STATUS_NOT_DECIDED',
      'REMEDY_STATUS_REMOVE_AMEND',
      'REMEDY_STATUS_REMOVE_SEVER'    
    ].map(configCode => ([configCode, configChannel.request('get', configCode)])));


    this.subStatusRemedyConfigs = {};
    this.REMEDY_STATUS_REASON_AMEND_REMOVED_BY_APPLICANT = String(configChannel.request('get', 'REMEDY_STATUS_REASON_AMEND_REMOVED_BY_APPLICANT') || '');
    this.REMEDY_STATUS_REASON_AMEND_REMOVED_BY_RESPONDENT = String(configChannel.request('get', 'REMEDY_STATUS_REASON_AMEND_REMOVED_BY_RESPONDENT') || '');
    this.REMEDY_STATUS_REASON_AMEND_REMOVED = String(configChannel.request('get', 'REMEDY_STATUS_REASON_AMEND_REMOVED') || '');
    this.REMEDY_STATUS_REASON_SEVER_NOT_RELATED = String(configChannel.request('get', 'REMEDY_STATUS_REASON_SEVER_NOT_RELATED') || '');

    this.reinitialize();
  },

  reinitialize() {
    this.createSubModels();
    this.setupListeners();
  },

  _getOutcomeNotAwardedOptions() {
    const code_to_display = {
        REMEDY_SUB_STATUS_REAPPLY: 'With leave to re-apply',
        REMEDY_SUB_STATUS_NO_REAPPLY: 'Without leave to re-apply',
      },
      config_codes = ['REMEDY_SUB_STATUS_NO_REAPPLY', 'REMEDY_SUB_STATUS_REAPPLY'];

    return _.map(config_codes, function(config_code) {
      const value = configChannel.request('get', config_code);
      return { text: code_to_display[config_code], value: String(value) };
    });
  },

  _isIssueIncludeSelected() {
    return this.issueOptionsModel.getData() === INCLUDE_RADIO_CODE;
  },

  _isIssueRemoveSelected() {
    return this.issueOptionsModel.getData() === REMOVE_RADIO_CODE;
  },

  isInclude() {
    return this._isIssueIncludeSelected();
  },

  isAwarded() {
    return this._isIssueIncludeSelected() && this.includeOutcomeModel.getData() === AWARDED_DROPDOWN_CODE;
  },

  isSettled() {
    return this._isIssueIncludeSelected() && this.includeOutcomeModel.getData() === SETTLED_DROPDOWN_CODE;
  },
  
  isDismiss() {
    return this._isIssueIncludeSelected() && this.includeOutcomeModel.getData() === DISMISS_DROPDOWN_CODE;
  },

  isRemove() {
    return this._isIssueRemoveSelected();
  },

  isAmend() {
    return this._isIssueRemoveSelected() && this.removeOutcomeModel.getData() === AMEND_DROPDOWN_CODE;
  },

  isSever() {
    return this._isIssueRemoveSelected() && this.removeOutcomeModel.getData() === SEVER_DROPDOWN_CODE;
  },

  _isNoJurisdictionSelected() {
    return this._isIssueIncludeSelected() && this.includeOutcomeModel.getData() === NO_JURISDICTION_DROPDOWN_CODE;
  },

  _isIncludedNotDecidedSelected() {
    return this._isIssueIncludeSelected() && this.includeOutcomeModel.getData() === NOT_DECIDED_DROPDOWN_CODE;
  },

  _is2DayOffsetDateTypeSelected() {
    return this.includeAwardDateTypeDropdown.getData() === AWARDED_DATE_TYPE_2_DAYS_DROPDOWN_CODE;
  },

  _isSpecificDateTypeSelected() {
    return this.includeAwardDateTypeDropdown.getData() === AWARDED_DATE_TYPE_SPECIFIC_DROPDOWN_CODE;
  },

  _isOtherDateTypeSelected() {
    return this.includeAwardDateTypeDropdown.getData() === AWARDED_DATE_TYPE_OTHER_DROPDOWN_CODE;
  },

  _isLeaveToReapplySelected() {
    return String(this.dismissOptionsModel.getData()) === String(this.REMEDY_SUB_STATUS_REAPPLY) && this.REMEDY_SUB_STATUS_REAPPLY;
  },

  _isWithoutLeaveToReapplySelected() {
    return String(this.dismissOptionsModel.getData()) === String(this.REMEDY_SUB_STATUS_NO_REAPPLY) && this.REMEDY_SUB_STATUS_NO_REAPPLY;
  },

  _isRemedyStatusIncluded(remedyStatus) {
    return [
      this.remedyStatusConfigs.REMEDY_STATUS_POSSESSION_GRANTED_2DAY,
      this.remedyStatusConfigs.REMEDY_STATUS_POSSESSION_GRANTED_SPECIFIC_DATE,
      this.remedyStatusConfigs.REMEDY_STATUS_POSSESSION_GRANTED_OTHER_DATE,
      this.remedyStatusConfigs.REMEDY_STATUS_MONETARY_GRANTED,
      this.remedyStatusConfigs.REMEDY_STATUS_OTHER_ISSUE_GRANTED,
      this.remedyStatusConfigs.REMEDY_STATUS_DISMISSED_WITH_LEAVE,
      this.remedyStatusConfigs.REMEDY_STATUS_DISMISSED_NO_LEAVE,
      this.remedyStatusConfigs.REMEDY_STATUS_SETTLED,
      this.remedyStatusConfigs.REMEDY_STATUS_SETTLED_MONETARY,
      this.remedyStatusConfigs.REMEDY_STATUS_SETTLED_POSSESSION_2DAY,
      this.remedyStatusConfigs.REMEDY_STATUS_SETTLED_POSSESSION_SPECIFIC_DATE,
      this.remedyStatusConfigs.REMEDY_STATUS_SETTLED_POSSESSION_OTHER_DATE,
      this.remedyStatusConfigs.REMEDY_STATUS_NO_JURISDICTION,
      this.remedyStatusConfigs.REMEDY_STATUS_NOT_DECIDED
    ].includes(remedyStatus);  
  },

  _isRemedyStatusRemoved(remedyStatus) {
    return [
      this.remedyStatusConfigs.REMEDY_STATUS_REMOVE_AMEND,
      this.remedyStatusConfigs.REMEDY_STATUS_REMOVE_SEVER,
    ].includes(remedyStatus);
  },

  createSubModels() {
    const remedy_status = this.remedyModel ? this.remedyModel.get('remedy_status') : null;
    const remedy_status_reason_code = this.remedyModel ? this.remedyModel.get('remedy_status_reason_code') : null;
    const isReverseApplicantIssue = this.disputeClaimModel.isReverseAward();
    const absValAmount = this.remedyModel && this.remedyModel.get('awarded_amount') ? Math.abs(this.remedyModel.get('awarded_amount')) : null;
    const amountIsZero = this.remedyModel && this.remedyModel.get('awarded_amount') === 0;

    this.issueOptionsModel = new RadioModel({
      optionData: [
        { text: 'Include', value: INCLUDE_RADIO_CODE },
        ...(!isReverseApplicantIssue ? [{ text: 'Sever/Amend', value: REMOVE_RADIO_CODE }] : [])
      ],
      required: true,
      value: this._isRemedyStatusIncluded(remedy_status) || isReverseApplicantIssue ? INCLUDE_RADIO_CODE : 
        this._isRemedyStatusRemoved(remedy_status) ? REMOVE_RADIO_CODE :
        INCLUDE_RADIO_CODE
    });

    this.detailsModel = new InputModel({
      inputType: 'text',
      required: null, // Will be set at time of render
      maxLength: this.AWARD_DETAILS_MAX_LENGTH || 255,
      errorMessage: 'Enter the details',
      value: this.remedyModel ? this.remedyModel.get('award_details') : null,
      apiMapping: 'award_details'
    });

    this.includeOutcomeModel = new DropdownModel({
      optionData: [
        { text: 'Granted', value: AWARDED_DROPDOWN_CODE },
        { text: 'Dismissed', value: DISMISS_DROPDOWN_CODE },
        { text: 'Settled', value: SETTLED_DROPDOWN_CODE },
        { text: 'No Jurisdiction', value: NO_JURISDICTION_DROPDOWN_CODE },
        ...(UAT_TOGGLING.SHOW_DECISION_GENERATOR ? [{ text: '* Not Decided', value: NOT_DECIDED_DROPDOWN_CODE }] : [])
      ],
      defaultBlank: true,
      labelText: null,
      required: this._isIssueIncludeSelected(),
      disabled: isReverseApplicantIssue,

      value: (this.remedyModel.isOutcomeAwarded() || isReverseApplicantIssue) ? AWARDED_DROPDOWN_CODE : 
        this.remedyModel.isOutcomeDismissed() ? DISMISS_DROPDOWN_CODE : 
        this.remedyModel.isOutcomeSettled() ? SETTLED_DROPDOWN_CODE : 
        this.remedyModel.isOutcomeNoJurisdiction() ? NO_JURISDICTION_DROPDOWN_CODE :
        this.remedyModel.isOutcomeIncludedAndNotDecided() ? NOT_DECIDED_DROPDOWN_CODE :
        AWARDED_DROPDOWN_CODE
    });

    this.removeOutcomeModel = new DropdownModel({
      optionData: [
        { text: 'Amend', value: AMEND_DROPDOWN_CODE },
        { text: 'Sever', value: SEVER_DROPDOWN_CODE }
      ],
      defaultBlank: true,
      labelText: null,
      required: this._isIssueRemoveSelected(),
      value: this.remedyModel.isOutcomeAmend() ? AMEND_DROPDOWN_CODE :
        this.remedyModel.isOutcomeSever() ? SEVER_DROPDOWN_CODE :
        null
    });
    const autoSetAmountIfFeeRecovery = this.disputeClaimModel.isFeeRecovery() ? this.remedyModel.getFirstRemedyDetail()?.get('amount') : null;
    this.includeAwardAmountModel = new InputModel({
      inputType: 'currency',
      allowZeroAmount: true,
      maxNum: configChannel.request('get', 'CLAIM_AMOUNT_MAX_NUM'),
      errorMessage: 'Enter an amount greater than or equal to 0',
      required: true,
      value: absValAmount ? absValAmount :
        amountIsZero ? 0 : autoSetAmountIfFeeRecovery,
      apiMapping: 'awarded_amount'
    });


    this.includeAwardDateTypeDropdown = new DropdownModel({
      optionData: [
        { text: '2 Days', value: AWARDED_DATE_TYPE_2_DAYS_DROPDOWN_CODE },
        { text: 'Specific Date', value: AWARDED_DATE_TYPE_SPECIFIC_DROPDOWN_CODE },
        { text: 'Other', value: AWARDED_DATE_TYPE_OTHER_DROPDOWN_CODE }
      ],
      defaultBlank: true,
      required: true,
      apiMapping: null,
      value: this.remedyModel.isOutcomeAwarded2Day() ? AWARDED_DATE_TYPE_2_DAYS_DROPDOWN_CODE :
        this.remedyModel.isOutcomeAwardedSpecificDate() ? AWARDED_DATE_TYPE_SPECIFIC_DROPDOWN_CODE :
        this.remedyModel.isOutcomeAwardedOtherDate() ? AWARDED_DATE_TYPE_OTHER_DROPDOWN_CODE : null
    });

    this.includeAwardDateModel = new InputModel({
      inputType: 'date',
      required: true,
      allowFutureDate: true,
      value: this.remedyModel ? this.remedyModel.get('awarded_date') : null,
      apiMapping: 'awarded_date'
    });
    
    this.amendOptionsModel = new DropdownModel({
      optionData: [this.REMEDY_STATUS_REASON_AMEND_REMOVED_BY_APPLICANT, this.REMEDY_STATUS_REASON_AMEND_REMOVED_BY_RESPONDENT, this.REMEDY_STATUS_REASON_AMEND_REMOVED].map(value => (
        { text: this.REMEDY_STATUS_REASONS_DISPLAY[value], value: value })),
      defaultBlank: true,
      required: true,
      value: remedy_status_reason_code ? String(remedy_status_reason_code) : null,
      apiMapping: 'remedy_status_reason_code'
    });

    this.severOptionsModel = new DropdownModel({
      optionData: [{ text: this.REMEDY_STATUS_REASONS_DISPLAY[this.REMEDY_STATUS_REASON_SEVER_NOT_RELATED], value: this.REMEDY_STATUS_REASON_SEVER_NOT_RELATED }],
      defaultBlank: true,
      required: true,
      value: remedy_status_reason_code ? String(remedy_status_reason_code) : null,
      apiMapping: 'remedy_status_reason_code'
    });

    this.dismissOptionsModel = new DropdownModel({
      optionData: this._getOutcomeNotAwardedOptions(),
      defaultBlank: true,
      required: true,
      value: remedy_status === this.remedyStatusConfigs.REMEDY_STATUS_DISMISSED_WITH_LEAVE ? String(this.REMEDY_SUB_STATUS_REAPPLY) : 
        remedy_status === this.remedyStatusConfigs.REMEDY_STATUS_DISMISSED_NO_LEAVE ? String(this.REMEDY_SUB_STATUS_NO_REAPPLY) : null
    });
  },

  setupListeners() {
    this.listenTo(this.issueOptionsModel, 'change:value', this.render, this);
    this.listenTo(this.includeOutcomeModel, 'change:value', this.render, this);
    this.listenTo(this.removeOutcomeModel, 'change:value', this.render, this);
    this.listenTo(this.includeAwardDateTypeDropdown, 'change:value', this.render, this);

    this.stopListening(this.disputeClaimModel, 'render:edit');
    this.listenTo(this.disputeClaimModel, 'render:edit', this.renderInEditMode, this);
  },

  saveOutcome() {
    const api_attrs = _.extend({}, this.detailsModel.getPageApiDataAttrs());
    const isSettled = this.isSettled();
    let remedyStatusToUse = null;
    
    if (isSettled || this.isAwarded()) {
      if (this.disputeClaimModel.isMonetaryOutcomeIssue()) {
        remedyStatusToUse = isSettled ? this.remedyStatusConfigs.REMEDY_STATUS_SETTLED_MONETARY :
          this.remedyStatusConfigs.REMEDY_STATUS_MONETARY_GRANTED;

        const amountData = this.includeAwardAmountModel.getPageApiDataAttrs();
        // If OLRD is selected, then reverse the outcome amount
        if (this.disputeClaimModel.isReverseAward()) {
          (Object.keys(amountData) || []).forEach(function(key) {
            if (_.isNumber(amountData[key])) {
              amountData[key] = amountData[key] * -1;
            }
          });
        }
        _.extend(api_attrs, amountData);
      } else if (this.disputeClaimModel.isLandlordMoveOutIssue()) {
        if (this._is2DayOffsetDateTypeSelected()) {
          remedyStatusToUse = isSettled ? this.remedyStatusConfigs.REMEDY_STATUS_SETTLED_POSSESSION_2DAY
            : this.remedyStatusConfigs.REMEDY_STATUS_POSSESSION_GRANTED_2DAY;
          
          _.extend(api_attrs, { awarded_days_after_service: 2 });
        } else if (this._isSpecificDateTypeSelected()) {
          remedyStatusToUse = isSettled ? this.remedyStatusConfigs.REMEDY_STATUS_SETTLED_POSSESSION_SPECIFIC_DATE
            : this.remedyStatusConfigs.REMEDY_STATUS_POSSESSION_GRANTED_SPECIFIC_DATE;

          _.extend(api_attrs, this.includeAwardDateModel.getPageApiDataAttrs());
        } else if (this._isOtherDateTypeSelected()) {
          remedyStatusToUse = isSettled ? this.remedyStatusConfigs.REMEDY_STATUS_SETTLED_POSSESSION_OTHER_DATE
            : this.remedyStatusConfigs.REMEDY_STATUS_POSSESSION_GRANTED_OTHER_DATE;
        }
      } else {
        remedyStatusToUse = isSettled ? this.remedyStatusConfigs.REMEDY_STATUS_SETTLED
            : this.remedyStatusConfigs.REMEDY_STATUS_OTHER_ISSUE_GRANTED;
      }
    } else if (this.isDismiss()) {
      if (this._isLeaveToReapplySelected()) {
        remedyStatusToUse = this.remedyStatusConfigs.REMEDY_STATUS_DISMISSED_WITH_LEAVE;
      }
      if (this._isWithoutLeaveToReapplySelected()) {
        remedyStatusToUse = this.remedyStatusConfigs.REMEDY_STATUS_DISMISSED_NO_LEAVE;
      }
    } else if (this._isNoJurisdictionSelected()) {
      remedyStatusToUse = this.remedyStatusConfigs.REMEDY_STATUS_NO_JURISDICTION;
    } else if (this._isIncludedNotDecidedSelected()) {
      remedyStatusToUse = this.remedyStatusConfigs.REMEDY_STATUS_NOT_DECIDED;
    } else if (this.isAmend()) {
      remedyStatusToUse = this.remedyStatusConfigs.REMEDY_STATUS_REMOVE_AMEND;
      
      _.extend(api_attrs, this.amendOptionsModel.getPageApiDataAttrs());
    } else if (this.isSever()) {
      remedyStatusToUse = this.remedyStatusConfigs.REMEDY_STATUS_REMOVE_SEVER;
      
      _.extend(api_attrs, this.severOptionsModel.getPageApiDataAttrs());
    }

    _.extend(api_attrs, { remedy_status: remedyStatusToUse });
    
    if (_.isEmpty(api_attrs)) {
      this.renderInViewMode();
      return;
    }

    this.remedyModel.set(api_attrs);
    if (_.isEmpty(this.remedyModel.getApiChangesOnly())) {
      this.renderInViewMode();
      return;
    }    

    // Before saving, set all outcome values to null if they aren't being set by component
    this.remedyModel.set(_.extend({
      remedy_status_reason_code: null,
      awarded_amount: null,
      awarded_date: null,
      award_details: null,
      awarded_days_after_service: null, 
      remedy_status: null,
      remedy_status_reason: null,
    }, api_attrs));
    
    loaderChannel.trigger('page:load');
    this.remedyModel.save(this.remedyModel.getApiChangesOnly())
      .done(() => {
        this.reinitialize();
        this.disputeClaimModel.trigger('hearingTools:save');
      })
      .fail(
        generalErrorFactory.createHandler('ADMIN.REMEDY.SAVE', () => {
          this.reinitialize();
          this.disputeClaimModel.trigger('hearingTools:save');
        })
      ).always(() => loaderChannel.trigger('page:load:complete'));
    
  },

  getRegionsToValidate() {
    const regionNames = ['detailsRegion', 'issueOptionsRegion'];

    if (this.isInclude()) {
      regionNames.push('includeOutcomeRegion');

      if (this.isSettled() || this.isAwarded()) {
        if (this.disputeClaimModel.isMonetaryOutcomeIssue()) {
          regionNames.push('includeAwardAmountRegion');
        } else if (this.disputeClaimModel.isLandlordMoveOutIssue()) {
          regionNames.push('includeAwardDateTypeRegion');
          if (this._isSpecificDateTypeSelected()) {
            regionNames.push('includeAwardDateRegion');
          }
        }
      } else if (this.isDismiss()) {
        regionNames.push('dismissOptionsRegion');
      }

    } else if (this.isRemove()) {
      regionNames.push('removeOutcomeRegion');
      if (this.isAmend()) {
        regionNames.push('amendOptionsRegion')
      } else if (this.isSever()) {
        regionNames.push('severOptionsRegion');
      }
    }

    return regionNames;
  },

  validateAndShowErrors() {
    let is_valid = true;
    _.each(this.getRegionsToValidate(), (view_name) => {
      const view = this.getChildView(view_name);
      if (view) {
        is_valid = view.validateAndShowErrors() && is_valid;
      }
    });
    return is_valid;
  },

  renderInViewMode() {
    this.mode = 'claim-view';
    if (this.disputeModel && this.disputeModel.checkEditInProgressModel(this.disputeClaimModel)) {
      this.disputeModel.stopEditInProgress();
    }
    this.render();
  },

  renderInEditMode() {
    this.mode = 'claim-edit';

    if (this.disputeModel) {
      this.disputeModel.startEditInProgress(this.disputeClaimModel);
    }
    this.render();
  },

  onBeforeRender() {
    // Toggle required / not required state of details based on current UI selected state

    this.detailsModel.set('required',
      (this.isAwarded() && !this.disputeClaimModel.isLandlordMoveOutIssue() && !this.disputeClaimModel.isMonetaryOutcomeIssue() && !this.disputeClaimModel.isTenantMoveOut()) ||
      this._isOtherDateTypeSelected() ||
      this._isNoJurisdictionSelected()
    );

    this.includeOutcomeModel.set('required', this._isIssueIncludeSelected());
    this.removeOutcomeModel.set('required', this._isIssueRemoveSelected());
  },
  
  onRender() {
    this.showChildView('issueOptionsRegion', new RadioView({ model: this.issueOptionsModel }));
    this.showChildView('detailsRegion', new InputView({ displayTitle: 'Details', model: this.detailsModel }));

    if (this.isInclude()) {
      this.renderIssueIncludeRegions();
    } else if (this.isRemove()) {
      this.renderIssueRemoveRegions();
    }
  },

  renderIssueIncludeRegions() {
    const isMonetaryOutcomeIssue = this.disputeClaimModel.isMonetaryOutcomeIssue();
    const isAwarded = this.isAwarded();
    const isSettled = this.isSettled();

    this.showChildView('includeOutcomeRegion', new DropdownView({ displayTitle: 'Outcome', model: this.includeOutcomeModel }));

    if (isMonetaryOutcomeIssue && (isAwarded || isSettled)) {
      this.showChildView('includeAwardAmountRegion', new InputView({ displayTitle: 'Amount', model: this.includeAwardAmountModel }));
    }

    if (isAwarded || isSettled) {
      if (isMonetaryOutcomeIssue) {
        this.showChildView('includeAwardAmountRegion', new InputView({ displayTitle: 'Amount', model: this.includeAwardAmountModel }));
      } else if (this.disputeClaimModel.isLandlordMoveOutIssue()) {
        this.showChildView('includeAwardDateTypeRegion', new DropdownView({ displayTitle: 'When', model: this.includeAwardDateTypeDropdown }));

        if (this._isSpecificDateTypeSelected()) {
          this.showChildView('includeAwardDateRegion', new InputView({ model: this.includeAwardDateModel }));
        }
      }
    } else if (this.isDismiss()) {
      this.showChildView('dismissOptionsRegion', new DropdownView({ model: this.dismissOptionsModel }));
    }
  },

  renderIssueRemoveRegions() {
    this.showChildView('removeOutcomeRegion', new DropdownView({ model: this.removeOutcomeModel }));

    if (this.isAmend()) {
      this.showChildView('amendOptionsRegion', new DropdownView({ model: this.amendOptionsModel }));
    } else if (this.isSever()) {
      this.showChildView('severOptionsRegion', new DropdownView({ model: this.severOptionsModel }));
    }
  },

  templateContext() {
    const isInclude = this.isInclude();
    const isRemove = this.isRemove();
    const isAmend = this.isAmend();
    const isSever = this.isSever();
    const isDismiss = this.isDismiss();
    const isAwarded = this.isAwarded();
    const isSettled = this.isSettled();
    const isMonetaryOutcomeIssue = this.disputeClaimModel.isMonetaryOutcomeIssue();
    const isLandlordMoveOutIssue = this.disputeClaimModel.isLandlordMoveOutIssue();
    const isDateTypeSpecific = this._isSpecificDateTypeSelected();
    const outcomeDisplay = this.remedyModel ? this.remedyModel.getOutcomeDisplay(this.disputeClaimModel, { use_html: true }) :
      this.disputeClaimModel.getFirstOutcomeDisplay({ use_html: true });
    const lastModifiedOutcomeModel = this.disputeClaimModel.getOutcomeLastModifiedModel();
    const outcomeModifiedDisplay = lastModifiedOutcomeModel && lastModifiedOutcomeModel.getModifiedDisplay();
    return {
      mode: this.mode,
      isInclude,
      isRemove,
      isAmend,
      isSever,
      isDismiss,
      isAwarded,
      isSettled,
      isMonetaryOutcomeIssue,
      isLandlordMoveOutIssue,
      isDateTypeSpecific,
      outcomeDisplay,
      outcomeModifiedDisplay,
      hadStaffActivity: this.remedyModel ? this.remedyModel.hadStaffActivity() : true,
      ClaimOutcomeUserIcon
    };
  }

});
